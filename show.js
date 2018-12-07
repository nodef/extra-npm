const npmPackageVersions = require('npm-package-versions');
const listNpmContents = require('list-npm-contents');
const moduleDependents = require('module-dependents');
const boolean = require('boolean');
const cp = require('child_process');


// Global variables.
const E = process.env;
const FUNCTION = new Map([
  ['versions', versions],
  ['contents', contents],
  ['dependents', dependents]
]);
const OPTIONS = {
  log: boolean(E['ENPM_LOG']||'0'),
  count: boolean(E['ENPM_COUNT']||'0')
};
const STDIO = [0, 1, 2];


// Get versions of package.
function versions(pkg, fn) {
  if(pkg.includes('@')) fn(null, [pkg.replace(/.*?@/, '')]);
  npmPackageVersions(pkg, fn);
};

// Get contents of package.
function contents(pkg, fn) {
  var nam = pkg.replace(/@.*/, '');
  var ver = pkg.includes('@')? pkg.replace(/.*?@/, ''):null;
  listNpmContents(nam, ver).then((fils) => fn(null, fils), fn);
};

// Get dependents of package.
function dependents(pkg, fn) {
  var a = [];
  var r = moduleDependents(pkg)
  r.on('error', fn)
  r.on('data', p => a.push(p.name));
  r.on('end', () => fn(null, a));
};

// Show details of package.
function show(typ, pkg, o) {
  var fn = FUNCTION.get(typ);
  if(fn==null) return console.error(`error: unknown field "${typ}"`);
  fn(pkg, (err, ans) => {
    if(err) return console.error('error:', err.message||`package "${pkg}" not found`);
    if(o.log) console.log(`${pkg} has ${ans.length} ${typ}`);
    if(o.count) { if(!o.log) console.log(ans.length); return; }
    if(o.log) return console.log(ans);
    for(var v of ans)
      console.log(v);
  });
};

show.versions = versions;
show.contents = contents;
show.dependents = dependents;
module.exports = show;

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
  if(def.length>0) cp.execSync('npm view '+def.join(' '), {stdio: STDIO});
  for(var t of spc)
    show(t, pkg, o);
};
if(require.main===module) shell(process.argv);
