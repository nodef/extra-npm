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
const OPTIONS = {
  help: false,
  package: null,
  fields: null,
  silent: boolean(E['ENPM_VIEW_SILENT']||E['ENPM_SILENT']||'0'),
  count: boolean(E['ENPM_COUNT']||'0')
};
const STDIO = [0, 1, 2];


// Log array result.
function logArray(pkg, ans, o) {
  if(o.log) console.log(`${pkg} has ${ans.length} ${typ}`);
  if(o.count) { if(!o.log) console.log(ans.length); return; }
  if(o.log) return console.log(ans);
  for(var v of ans)
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

// Get scope of package.
function scope(pkg, o) {
  if((pkg=package(pkg, o))==null) return;
  if(!pkg.startsWith('@')) console.log('unscoped');
  else console.log(pkg.substring(1).replace(/\/.*/, ''));
};

// Get last publish date of package.
function date(pkg, fn) {
  var nam = pkg.replace(/@.*/, '');
  
};

// Get stars of package.
function stars(pkg, fn) {
  var nam = pkg.replace(/@.*/, '');
  npmPackageStars(nam).then(num => fn(null, num), fn);
};

// Get versions of package.
function versions(pkg, fn) {
  if(pkg.includes('@')) fn(null, [pkg.replace(/.*?@/, '')]);
  npmPackageVersions(pkg, fn);
};

// Get contents of package.
function contents(pkg, fn) {
  var nam = pkg.replace(/@.*/, '');
  var ver = pkg.includes('@')? pkg.replace(/.*?@/, ''):null;
  listNpmContents(nam, ver).then(fils => fn(null, fils), fn);
};

// Get readme of package.
function readme(pkg, fn) {
  contents(pkg, (err, fils) => {
    if(err) fn(err);
    var fil = null;
    for(var f of fils)
      if(/^readme(\..+)?/i.test(f)) { fil = f; break; }
    if(fil==null) return fn(new Error(`${pkg} has no readme`));
    got(`https://unpkg.com/${pkg}/${fil}`).then(res => fn(null, res.body), fn);
  });
};

// Get dependents of package.
function dependents(pkg, fn) {
  var a = [];
  var r = moduleDependents(pkg)
  r.on('error', fn)
  r.on('data', p => a.push(p.name));
  r.on('end', () => fn(null, a));
};

// Get downloads of package.
function downloads(pkg, fn, o) {
  var period = (o||{}).type.split('.')[1]||'month';
  pkgDownloads(pkg, {period}).then(ans => fn(null, ans), fn);
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
  scope(pkg, o);
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
