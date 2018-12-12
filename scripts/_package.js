const npmPackageVersions = require('npm-package-versions');
const moduleDependents = require('module-dependents');
const npmPackageStars = require('npm-package-stars');
const listNpmContents = require('list-npm-contents');
const packageJson = require('package-json');
const got = require('got');


// Global variables.
const SPECIAL = {
  stars: 0,
  versions: null,
  contents: null,
  readme: null,
  dependents: null,
  downloads: null
};


// Search a page.
async function searchPage(qry, pag) {
  var opt = {headers: {'x-spiferack': 1}};
  var url = `https://www.npmjs.com/search?perPage=20&page=${pag}&q=${qry}`;
  var a = JSON.parse((await got(url, opt)).body);
  return a.ghapi? JSON.parse((await got(url+'*', opt)).body):a;
};

// Search all packages.
async function search(qry, off=0, lim=Number.MAX_SAFE_INTEGER) {
  var aps = [], as = [];
  var tot = -1, off = off, end = off+lim;
  do {
    var ap = searchPage(qry, Math.floor(off/20));
    if(tot<0) { aps.push(await ap); tot = aps[0].total; }
    else aps.push(ap);
    off += 20-(off%20);
  }while(off<end && off<tot);
  for(var a of await Promise.all(aps))
    Array.prototype.push.apply(as, a.objects);
  return as;
};

// Get main.
function main(nam) {
  search(nam, 0, 1).then(as => as[0]);
};

// Get json.
function json(nam, ver) {
  return packageJson(nam, {version: ver, fullMetadata: true});
};

// Get stars.
function stars(nam) {
  return npmPackageStars(nam);
};

// Get versions.
function versions(nam) {
  return new Promise((fres, frej) => npmPackageVersions(nam, (e, v) => e? frej(e):fres(v)));
};

// Get contents.
function contents(nam, ver) {
  return listNpmContents(nam, ver);
};

// Get readme.
async function readme(nam, ver) {
  var pkg = ver? nam+'@'+ver:nam;
  for(var f of (await listNpmContents(nam, ver)))
    if(/^readme(\..+)?/i.test(f)) { fil = f; break; }
  if(fil==null) throw new Error(pkg+' has no readme');
  return (await got(`https://unpkg.com/${pkg}/${fil}`)).body;
};


// Get dependents.
function dependents(nam) {
  var deps = [], req = moduleDependents(nam);
  return new Promise((fres, frej) => {
    req.on('error', frej)
    req.on('data', p => deps.push(p.name));
    req.on('end', () => fres(deps));
  });
};

// Get downloads.
async function downloads(nam) {
  var res = await got('https://api.npmjs.org/downloads/range/last-month/'+nam);
  var a = JSON.parse(res.body), detail = a.downloads;
  var day = 0, week = 0, month = 0;
  for(var i=detail.length-1, j=0; i>=0; i--, j++) {
    if(j<1) day += detail[i].downloads;
    if(j<7) week += detail[i].downloads;
    month += detail[i].downloads;
  }
  return {day, week, month, detail};
};

// Get special.
function special(nam, ver, flds) {
  var a = Object.assign({}, SPECIAL), ps = [];
  if(flds.has('stars')) ps.push(stars(nam).then(v => a.stars=v));
  if(flds.has('versions')) ps.push(versions(nam).then(v => a.versions=v));
  if(flds.has('contents')) ps.push(contents(nam, ver).then(v => a.contents=v));
  if(flds.has('readme')) ps.push(readme(nam, ver).then(v => a.readme=v));
  if(flds.has('dependents')) ps.push(dependents(nam).then(v => a.dependents=v));
  if(flds.has('downloads')) ps.push(downloads(nam).then(v => a.downloads=v));
  return Promise.all(ps).then(() => a);
};

exports.search = search;
exports.main = main;
exports.json = json;
exports.stars = stars;
exports.versions = versions;
exports.contents = contents;
exports.readme = readme;
exports.dependents = dependents;
exports.downloads = downloads;
exports.special = special;
