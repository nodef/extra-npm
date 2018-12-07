const npmPackageVersions = require('npm-package-versions');
const npmPackageStars = require('npm-package-stars');
const listNpmContents = require('list-npm-contents');
const moduleDependents = require('module-dependents');
const pkgDownloads = require('pkg-downloads');
const npmAvailable = require('npm-available');
const libnpmsearch = require('libnpmsearch');
const boolean = require('boolean');
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
  log: boolean(E['ENPM_LOG']||'0'),
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

// Command line.
function shell(a) {
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
