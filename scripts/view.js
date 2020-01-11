#!/usr/bin/env node
const kleur = require('kleur');
const cp = require('child_process');
const https = require('https');
require('extra-boolean');

// Global variables.
const E = process.env;
const FUNCTION = new Map([
  ['scope', $scope],
  ['time', $time],
  ['date', $time],
  ['publisher', $author],
  ['maintainers', $maintainers],
  ['score', $score],
  ['versions', $versions],
  ['files', $files],
  ['contents', $files],
  ['readme', $readme],
  ['dependents', $dependents],
  ['downloads', $downloads],
  ['available', $available]
]);
const VIEWOPT = {
  score: true,
  downloads: 'last-year',
  dependents: true
};
const OPTIONS = {
  help: false,
  package: null,
  fields: null,
  name: null,
  field: null,
  silent: Boolean.parse(E['ENPM_SILENT']||'0')
};
const STDIO = [0, 1, 2];



// CONSOLE
// Run on shell.
function main(a) {
  var o = {};
  for(var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  if(o.help) return cp.execSync('less view.md', {cwd: __dirname, stdio: STDIO});
  $view(o.package, o.fields, o);
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

// Get infomation on a package.
async function $view(pkg, flds, o) {
  var o = Object.assign({}, OPTIONS, o);
  if(!pkg) return error(new Error('No package mentioned'), o);
  var fbas = [], fspc = [];
  o.name = flds.length>1;
  for(var f of flds) {
    if(pkg==='.' || !FUNCTION.has(f.replace(/^#/, '').replace(/\..*/, ''))) fbas.push(f);
    else fspc.push(f);
  }
  if(flds.length===0 || fbas.length>0) cp.execSync('npm view '+pkg+' '+fbas.join(' '), {stdio: STDIO});
  var json = await view(pkg, {
    score: fspc.includes($score),
    downloads: fspc.includes($downloads)? 'last-year': null,
    dependents: flds.includes('dependents')
  });
  for(var f of fspc) {
    var fn = FUNCTION.get(f.replace(/^#/, '').replace(/\..*/, ''));
    if(fn!=null) fn(json, Object.assign({}, o, {field: f}));
  }
};


// Get scope of package.
function $scope(json, o) {
  log(scope(json.name)||'unscoped', o);
}

// Get package name, with validation.
function $name(json, o) {
  log(name(json.name)||'unscoped', o);
};

// Get versions of package.
function $versions(json, o) {
  log(Object.keys(json.versions||[]), o);
};

// Get publish time of package.
function $time(json, o) {
  var {time} = json;
  if(!time) return log('', o);
  log(o.field.includes('created')? time.created:time.modified, o);
};

// Get author of package.
function $author(json, o) {
  var a = json.author;
  if(o.field.includes('.name')) log(a.name, o);
  else if(o.field.includes('.username')) log(a.username, o);
  else if(o.field.includes('.email')) log(a.email, o);
  else log(`${a.name||a.username} <${a.email}>`, o);
};

// Get maintainers of package.
function $maintainers(json, o) {
  var {maintainers} = json;
  if(o.count) return log(maintainers.length, o);
  if(o.field.includes('.name')) log(maintainers.map(m => m.name), o);
  else if(o.field.includes('.username')) log(maintainers.map(m => m.username), o);
  else if(o.field.includes('.email')) log(maintainers.map(m => m.email), o);
  else log(maintainers.map(m => `${m.name||m.username} <${m.email}>`), o);
};

// Get score of package.
function $score(json, o) {
  var {score} = json, {final, detail} = score;
  if(o.field.includes('.quality')) log(detail.quality, o);
  else if(o.field.includes('.popularity')) log(detail.popularity, o);
  else if(o.field.includes('.maintenance')) log(detail.maintenance, o);
  else log(final, o);
};

// Get files of package.
function $files(json, o) {
  if(json.files) return log(json.files, o);
  var vers = Object.keys(json.versions);
  var latest = vers[vers.length-1];
  log(json.versions[latest].files, o);
};

// Get readme of package.
function $readme(json, o) {
  if(json.readme) log(json.readme, o);
  else error(new Error(json.name+' has no readme'), o);
};

// Get dependents of package.
function $dependents(json, o) {
  if(o.field.startsWith('#')) return log({length: json.dependentsCount}, o);
  var names = json.dependents.map(p => p? p.name:p);
  log(names, o);
};

// Get downloads of package.
function $downloads(json, o) {
  var period = o.field.split('.')[1]||'year';
  var days = DAYS.get(period)||365, total = 0;
  for(var i=0; i<days; i++)
    total += json.downloads[i];
  log(total, o);
};

// Check if package name is available.
function $available(pkg, o) {
  var ans = view(pkg).then(() => true, () => false);
  log(ans, o);
};

// Log output value.
function log(val, o) {
  if(o.field.startsWith('#')) {
    if(val.length) val = val.length;
    else if(typeof val==='string') val = val.length;
    else if(typeof val==='object') val = Object.keys(val).length;
  }
  if(Array.isArray(val)) {
    if(o.name) console.log(kleur.green(o.field+' ='));
    for(var v of val) console.log(v);
  }
  else {
    if(o.name) console.log(kleur.green(o.field+' ='), val);
    else console.log(val);
  }
};

// Log error message.
function error(err, o) {
  if(o.silent) console.log(-1);
  else console.error(kleur.red('error:'), err.message);
};



// JAVASCRIPT
/**
 * Gives package scope (organization).
 * @param {string} pkg full package name
 * @returns {string} null if unscoped, else scope
 */
function scope(pkg) {
  if(!pkg.startsWith('@')) return null;
  return pkg.substring(1).replace(/\/.*/, '');
}

/**
 * Gives package name (excluding version).
 * @param {string} pkg full package name
 * @returns {string} package name
 */
function name(pkg) {
  return pkg.replace(/(.)@.*/, '$1');
}

/**
 * Gives package version.
 * @param {string} pkg full package name
 * @returns {string} package version
 */
function version(pkg) {
  return pkg.substring(name(pkg).length+1);
}

/**
 * Gives package details from npmjs.com.
 * @param {string} pkg full package name
 * @param {object?} opt options {score, downloads, dependents}
 * @returns {object} package details
 */
async function view(pkg, opt) {
  var o = Object.assign({}, VIEWOPT, opt);
  var nam = name(pkg), ver = version(pkg);
  var [x, package, search, downloads] = await Promise.all([
    getJson(`https://registry.npmjs.com/${nam}/${ver}`),
    getJson(`https://www.npmjs.com/package/${nam}`, NPMJSOPT),
    o.score? getJson(`https://www.npmjs.com/search?q=${nam}`, NPMJSOPT):null,
    o.downloads? getJson(`https://api.npmjs.org/downloads/range/${o.downloads}/${nam}`):null,
  ]);
  var depCount = package.dependents.dependentsCount;
  x.dependents = o.dependents? (await getDependents(nam, depCount)):null;
  x.dependentsCount = depCount;
  ver = x.versions? last(Object.keys(x.versions)):ver;
  Object.assign(x, x.versions[ver]);
  x.private = package.private;
  var {author, maintainers, versions} = package.packument;
  Object.assign(x.author, author);
  var i = 0; for(var m of x.maintainers)
    Object.assign(m, maintainers[i++]);
  Object.assign(x, versions.find(v => v===ver));
  i = 0; for(var v in x.versions)
    Object.assign(v, versions[i++]);
  if(search && search.objects) x.score = search.objects[0].score;
  if(downloads) x.downloads = downloads.downloads;
  return x;
}
module.exports = view;
if(require.main===module) main(process.argv);
