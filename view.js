#!/usr/bin/env node
const validateNpmPackageName = require('validate-npm-package-name');
const npmPackageVersions = require('npm-package-versions');
const npmPackageStars = require('npm-package-stars');
const listNpmContents = require('list-npm-contents');
const moduleDependents = require('module-dependents');
const pkgDownloads = require('pkg-downloads');
const npmAvailable = require('npm-available');
const boolean = require('boolean');
const kleur = require('kleur');
const got = require('got');
const cp = require('child_process');


// Global variables.
const E = process.env;
const FUNCTION = new Map([
  ['stars', stars],
  ['versions', versions],
  ['contents', contents],
  ['readme', readme],
  ['dependents', dependents],
  ['downloads', downloads],
  ['available', npmAvailable]
]);
const URL = 'https://www.npmjs.com/search?q=';
const HEADERS = {
  'x-spiferack': 1
};
const OPTIONS = {
  help: false,
  package: null,
  fields: null,
  silent: boolean(E['ENPM_VIEW_SILENT']||E['ENPM_SILENT']||'0'),
  count: boolean(E['ENPM_COUNT']||'0')
};
const STDIO = [0, 1, 2];


// Log array result.
function logArray(arr) {
  for(var v of arr)
    console.log(v);
};

// Log result.
function logResult(pkg, err, ans, o) {
  if(o.meta) console.log(`\n${o.type} = `);
  if(err) return console.error('error:', err.message||`package "${pkg}" not found`);
  if(Array.isArray(ans)) return logArray(pkg, ans, o);
  if(!o.log) return console.log(ans);
  if(typeof ans==='boolean') return console.log(`${pkg} is${ans? '':' not'} available`);
  if(typeof ans==='number') return console.log(`${pkg} has ${ans} ${typ}`);
  return console.log(ans);
};

// Error package not found.
function error(e, o) {
  if(o.silent) console.log(-1);
  else console.error(kleur.red('error:'), e.message);
};

// Get package name, with validation.
function package(nam, o) {
  nam = nam.replace(/(.)@.*/, '$1');
  var a = validateNpmPackageName(nam);
  if(a.validForNewPackages || a.validForOldPackages) return nam;
  if(o.silent) return console.log(-1);
  for(var m of a.errors||[])
    console.error(kleur.red('error:'), m);
  for(var m of a.warnings||[])
    console.warn(kleur.yellow('warning:'), m);
};

// Get package details.
async function details(nam, o) {
  try {
    var a = JSON.parse((await got(URL+nam, {headers: HEADERS})).body);
    if(a.ghapi) a = JSON.parse((await got(URL+nam+'*', {headers: HEADERS})).body);
    for(var d of a.objects)
      if(d.package.name===nam) return d;
    throw new Error('cannot find package '+nam);
  }
  catch(e) { error(e, o); }
};

// Get scope of package.
function scope(pkg, o) {
  if((pkg=package(pkg, o))==null) return;
  if(!pkg.startsWith('@')) console.log('unscoped');
  else console.log(pkg.substring(1).replace(/\/.*/, ''));
};

// Get last publish date of package.
async function date(pkg, o) {
  var d = null;
  if((pkg=package(pkg, o))==null) return;
  if((d=await details(pkg, o))==null) return;
  console.log(o.field==='date.rel'? d.package.date.rel:d.package.date.ts);
};

// Get publisher of package.
async function publisher(pkg, o) {
  var d = null;
  if((pkg=package(pkg, o))==null) return;
  if((d=await details(pkg, o))==null) return;
  console.log(d.package.publisher.name);
};

// Get maintainers of package.
async function maintainers(pkg, o) {
  var d = null;
  if((pkg=package(pkg, o))==null) return;
  if((d=await details(pkg, o))==null) return;
  if(o.count) return console.log(d.package.maintainers.length);
  if(o.field==='maintainers.username') for(var m of d.package.maintainers) console.log(m.username);
  else if(o.field==='maintainers.email') for(var m of d.package.maintainers) console.log(m.email);
  else for(var m of d.package.maintainers) console.log(`${m.username} (${m.email})`);
};

// Get score of package.
async function score(pkg, o) {
  var d = null;
  if((pkg=package(pkg, o))==null) return;
  if((d=await details(pkg, o))==null) return;
  if(o.field==='score.quality') console.log(d.score.detail.quality);
  else if(o.field==='score.popularity') console.log(d.score.detail.popularity);
  else if(o.field==='score.maintenance') console.log(d.score.detail.maintenance);
  else console.log(d.score.final);
};

// Get stars of package.
async function stars(pkg, o) {
  if((pkg=package(pkg, o))==null) return;
  try { console.log(await npmPackageStars(pkg)); }
  catch(e) { error(e, o); }
};

// Get versions of package.
function versions(pkg, o) {
  if((pkg=package(pkg, o))==null) return;
  npmPackageVersions(pkg, (e, vers) => {
    if(e) return error(e, o);
    for(var v of vers) console.log(v);
  });
};

// Get contents of package.
async function contents(pkg, o) {
  var nam = pkg.replace(/(.)@.*/, '$1');
  var ver = pkg.indexOf('@')>0? pkg.replace(/(.).*?@/, ''):null;
  try { for(var f of (await listNpmContents(nam, ver))) console.log(f); }
  catch(e) { error(e, o); }
};

// Get readme of package.
async function readme(pkg, o) {
  var nam = pkg.replace(/(.)@.*/, '$1'), fil = null;
  var ver = pkg.indexOf('@')>0? pkg.replace(/(.).*?@/, ''):null;
  try {
    for(var f of (await listNpmContents(nam, ver)))
      if(/^readme(\..+)?/i.test(f)) { fil = f; break; }
    if(fil==null) throw new Error(pkg+' has no readme');
    console.log((got(`https://unpkg.com/${pkg}/${fil}`)).body);
  }
  catch(e) { error(e, o); }
};

// Get dependents of package.
function dependents(pkg, o) {
  if((pkg=package(pkg, o))==null) return;
  var deps = [], req = moduleDependents(pkg)
  req.on('error', e => error(e, o))
  req.on('data', p => deps.push(p.name));
  req.on('end', () => { for(var d of deps) console.log(d); });
};

// Get downloads of package.
async function downloads(pkg, o) {
  if((pkg=package(pkg, o))==null) return;
  var period = o.field.split('.')[1]||'month';
  try { console.log(await pkgDownloads(pkg, {period})); }
  catch(e) { error(e, o); }
};

// Check if package name is available.
function available(pkg, o) {
  if((pkg=package(pkg, o))==null) return;
  npmAvailable(pkg, (e, ok) => {
    if(e) return error(e, o);
    console.log(ok);
  });
};

// Show details of package.
function show(typ, pkg, o) {
  var fn = FUNCTION.get(typ.replace(/\..*/, ''));
  if(fn==null) {
    if(o.meta) console.log(`\n${typ} = `);
    return console.error(`error: unknown field "${typ}"`);
  }
  fn(pkg, (err, ans) => {
    if(o.meta) console.log(`\n${typ} = `);
    if(err) return console.error('error:', err.message||`package "${pkg}" not found`);
    if(!Array.isArray(ans)) {
      if(!o.log) return console.log(ans);
      if(typeof ans==='boolean') return console.log(`${pkg} is${ans? '':' not'} available`);
      if(typeof ans==='number') return console.log(`${pkg} has ${ans} ${typ}`);
      return console.log(ans);
    }
    if(o.log) console.log(`${pkg} has ${ans.length} ${typ}`);
    if(o.count) { if(!o.log) console.log(ans.length); return; }
    if(o.log) return console.log(ans);
    for(var v of ans)
      console.log(v);
  }, {type: typ});
};

// Get infomation on a package.
function view(pkg, flds, o) {
  var o = Object.assign({}, OPTIONS, o);
  if(flds[0]===':scope') scope(pkg, o);
  else if(flds[0]===':date') date(pkg, o);
  else if(flds[0]===':publisher') publisher(pkg, o);
  else if(flds[0]===':maintainers') maintainers(pkg, o);
  else if(flds[0]===':score') score(pkg, o);
  else if(flds[0]===':stars') stars(pkg, o);
  else if(flds[0]===':versions') versions(pkg, o);
  else if(flds[0]===':contents') contents(pkg, o);
  else if(flds[0]===':readme') readme(pkg, o);
  else if(flds[0]===':dependents') dependents(pkg, o);
  else if(flds[0]===':downloads') downloads(pkg, o);
  else if(flds[0]===':available') available(pkg, o);
};

// Get options from arguments.
function options(o, k, a, i) {
  o.fields = o.fields||[];
  if(k==='--help') o.help = true;
  else if(k==='--silent') o.silent = true;
  else if(!o.package) o.package = a[i];
  else o.fields.push(a[i]);
  return i+1;
};

view.options = options;
module.exports = view;

// Run on shell.
function shell(a) {
  var o = {};
  for(var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  if(o.help) return cp.execSync('less README.md', {cwd: __dirname, stdio: STDIO});
  view(o.package, o.fields, o);
};


function shellX(a) {
  var def = [], spc = [], pkg = null, o = OPTIONS;
  for(var i=2, I=a.length; i<I; i++) {
    if(a[i]==='-l' || a[i]==='--log') o.log = true;
    else if(a[i]==='-c' || a[i]==='--count') o.count = true;
    else if(pkg==null) pkg = a[i];
    else if(!a[i].startsWith(':')) def.push(a[i]);
    else spc.push(a[i].substring(1));
  }
  if(!pkg) return;
  o.meta = def.length+spc.length>1;
  if(def.length>0 || spc.length===0) {
    try { cp.execSync(`npm view ${pkg} ${def.join(' ')}`, {stdio: STDIO}); }
    catch(e) {}
  }
  for(var t of spc)
    show(t, pkg, o);
};
if(require.main===module) shell(process.argv);
