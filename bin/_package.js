const dotProp = require('dot-prop');
const got = require('got');
const packageJson = require('package-json');
const npmPackageVersions = require('npm-package-versions');
const listNpmContents = require('list-npm-contents');
const npmPackageStars = require('npm-package-stars');
// const moduleDependents = require('module-dependents');

const FSEARCH = new Set([
  'name', 'scope', 'version', 'description', 'keywords', 'date', 'links',
  'author', 'publisher', 'maintainers', 'score', 'searchScore'
]);
const FSPECIAL = new Set([
  'stars', 'versions', 'contents', 'readme', 'dependents', 'downloads'
]);
const FGET = new Map([
  ['name',        a => a.package.name],
  ['scope',       a => a.package.scope],
  ['version',     a => a.package.version],
  ['description', a => a.package.description],
  ['keywords',    a => a.package.keywords],
  ['date',        a => a.package.date.ts],
  ['date.rel',    a => a.package.date.rel],
  ['links',            a => a.package.links.npm],
  ['links.npm',        a => a.package.links.npm],
  ['links.homepage',   a => a.package.links.homepage],
  ['links.repository', a => a.package.links.repository],
  ['links.bugs',       a => a.package.links.bugs],
  ['author',               a => user(a.package.author)],
  ['publisher',            a => user(a.package.publisher)],
  ['publisher.name',       a => a.package.publisher.name],
  ['publisher.username',   a => a.package.publisher.name],
  ['publisher.email',      a => a.package.publisher.email],
  ['maintainers',          a => a.package.maintainers.map(v => user(v))],
  ['maintainers.username', a => a.package.maintainers.map(v => v.username)],
  ['maintainers.email', a => a.package.maintainers.map(v => v.email)],
  ['score',             a => a.score.final],
  ['optimal',           a => a.score.final],
  ['score.quality',     a => a.score.detail.quality],
  ['quality',           a => a.score.detail.quality],
  ['score.popularity',  a => a.score.detail.popularity],
  ['popularity',        a => a.score.detail.popularity],
  ['score.maintenance', a => a.score.detail.maintenance],
  ['maintenance',       a => a.score.detail.maintenance],
  ['searchScore',       a => a.searchScore],
  ['stars',             a => a.special.stars],
  ['versions',          a => a.special.versions],
  ['contents',          a => a.special.contents],
  ['readme',            a => a.special.readme],
  ['dependents',        a => a.special.dependents],
  ['downloads',         a => a.special.downloads.month],
  ['downloads.day',     a => a.special.downloads.day],
  ['downloads.week',    a => a.special.downloads.week],
  ['downloads.month',   a => a.special.downloads.month],
  ['downloads.detail',  a => a.special.downloads.detail],
]);
const RANKING = new Map([
  ['score',             'optimal'],
  ['optimal',           'optimal'],
  ['score.quality',     'quality'],
  ['quality',           'quality'],
  ['score.popularity',  'popularity'],
  ['popularity',        'popularity'],
  ['score.maintenance', 'maintenance'],
  ['maintenance',       'maintenance'],
  ['searchScore',       'optimal'],
]);
const DOWNLOADS = {day: 0, week: 0, month: 0, detail: []};
const SPECIAL = {
  stars:      0,
  versions:   null,
  contents:   null,
  readme:     null,
  dependents: null,
  downloads:  null
};




function sleep(t) {
  return new Promise((fres, frej) => setTimeout(fres, t));
}

// Get user info string.
function user(dat) {
  var dat = dat||'';
  if (typeof dat==='string') return dat;
  var a = dat.name||dat.username;
  if (dat.email) a += ` <${dat.email}>`;
  if (dat.url)   a += ` (${dat.url})`;
  return a;
}




// Get root of a field.
function froot(fld) {
  return fld.replace(/^#/, '').replace(/\..*/, '');
}


// Get value of a field.
function fget(a, fld) {
  var b = fld.replace(/^#/, '');
  var v = FGET.has(b)? FGET.get(b)(a):dotProp(a.json, b);
  if (fld[0]!=='#')        return v;
  if (Array.isArray(v))    return v.length;
  if (typeof v==='string') return v.length;
  if (typeof v==='object') return Object.keys(v).length;
  return v;
}


// Get field as string.
function fstring(a, fld) {
  var v = fget(a, fld);
  return typeof v==='object'? JSON.stringify(v) : ''+v;
}




// Get runnable query.
function query(txt, inc=[], exc=[]) {
  txt += inc.join(' ')+exc.map(v => '-'+v).join(' ');
  return txt.replace(/=/g, 'maintainer:').replace(/\+/g, 'keyword:').replace(/[^\w\-\/:@]+/, '');
}


// Get ranking from field.
function ranking(fld) {
  return RANKING.get(fld)||null;
}




// Search a page.
async function searchPage(qry, rnk, pag) {
  var opt = {headers: {'x-spiferack': 1}}, rnk = rnk||'optimal';
  var url = `https://www.npmjs.com/search?ranking=${rnk}&perPage=20&page=${pag}&q=${qry}`;
  var a = JSON.parse((await got(url, opt)).body);
  return a.ghapi? JSON.parse((await got(url+'*', opt)).body) : a;
}


// Search all packages.
async function search(qry, rnk=null, off=0, lim=Number.MAX_SAFE_INTEGER) {
  var aps = [], as = [];
  var tot = -1, off = off, end = off+lim;
  do {
    var ap = searchPage(qry, rnk, Math.floor(off/20));
    await sleep(200);
    if (tot<0) { aps.push(await ap); tot = aps[0].total; }
    else aps.push(ap);
    off += 20-(off%20);
  } while(off<end && off<tot);
  for (var a of await Promise.all(aps))
    Array.prototype.push.apply(as, a.objects);
  return as;
}


// Get main.
function main(nam) {
  search(nam, null, 0, 1).then(as => as[0]);
}




// Get json.
function json(nam, ver) {
  return packageJson(nam, {version: ver, fullMetadata: true});
}

// Get stars.
function stars(nam) {
  return npmPackageStars(nam);
}

// Get versions.
function versions(nam) {
  return new Promise((fres, frej) => npmPackageVersions(nam, (e, v) => e? frej(e):fres(v)));
}

// Get contents.
function contents(nam, ver) {
  return listNpmContents(nam, ver);
}


// Get readme.
async function readme(nam, ver) {
  var pkg = ver? nam+'@'+ver : nam;
  for (var f of (await listNpmContents(nam, ver)))
    if (/^readme(\..+)?/i.test(f)) { fil = f; break; }
  if (fil==null) throw new Error(pkg+' has no readme');
  return (await got(`https://unpkg.com/${pkg}/${fil}`)).body;
}


// Get dependents.
function dependents(nam) {
  return [];
  // var deps = [], req = moduleDependents(nam);
  // return new Promise((fres, frej) => {
  //   req.on('error', frej)
  //   req.on('data', p => deps.push(p.name));
  //   req.on('end', () => fres(deps));
  // });
}


// Get downloads.
async function downloads(nam) {
  var res = await got('https://api.npmjs.org/downloads/range/last-month/'+nam);
  var a = JSON.parse(res.body), detail = a.downloads;
  var day = 0, week = 0, month = 0;
  for (var i=detail.length-1, j=0; i>=0; i--, j++) {
    if (j<1) day += detail[i].downloads;
    if (j<7) week += detail[i].downloads;
    month += detail[i].downloads;
  }
  return {day, week, month, detail};
}


// Get special.
function special(nam, ver, flds) {
  var a = Object.assign({}, SPECIAL), ps = [];
  if (flds.has('stars'))            ps.push(stars(nam).then(v => a.stars=v,      () => a.stars=0));
  if (flds.has('versions'))      ps.push(versions(nam).then(v => a.versions=v,   () => a.versions=[]));
  if (flds.has('contents')) ps.push(contents(nam, ver).then(v => a.contents=v,   () => a.contents=[]));
  if (flds.has('readme'))     ps.push(readme(nam, ver).then(v => a.readme=v,     () => a.readme=''));
  if (flds.has('dependents'))  ps.push(dependents(nam).then(v => a.dependents=v, () => a.dependents=[]));
  if (flds.has('downloads'))    ps.push(downloads(nam).then(v => a.downloads=v,  () => a.downloads=DOWNLOADS));
  return Promise.all(ps).then(() => a);
}




// Populate json for a search result.
function populateJson(a) {
  var {name, version} = a.package;
  return json(name, version).then(v => a.json = v, () => {
    return json(name).then(v => a.json = v);
  });
}


// Populate special for a search result.
function populateSpecial(a, flds) {
  var {name, version} = a.package;
  return special(name, version, flds).then(v => a.special = v, () => {
    return special(name, undefined, flds).then(v => a.special = v);
  });
}


// Populate search results with necessary fields.
function populate(as, flds) {
  var spc = new Set(), jsn = false;
  for (var f of flds) {
    var r = froot(f);
    if (FSEARCH.has(r)) continue;
    if (FSPECIAL.has(r)) spc.add(r);
    else jsn = true;
  }
  var aps = [];
  for (var a of as) {
    if (jsn) aps.push(populateJson(a));
    if (spc.size) aps.push(populateSpecial(a, spc));
  }
  return Promise.all(aps);
}


// Sort search results by field.
function sortBy(as, fld) {
  return as.sort((a, b) => {
    var y = fget(a, fld), x = fget(b, fld);
    if (Array.isArray(x))    return x.join().localeCompare(y.join());
    if (typeof x==='string') return x.localeCompare(y);
    if (typeof x==='object') return JSON.stringify(x).localeCompare(JSON.stringify(y));
    return x-y;
  });
}
exports.froot = froot;
exports.fget = fget;
exports.fstring = fstring;
exports.query = query;
exports.ranking = ranking;
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
exports.populate = populate;
exports.sortBy = sortBy;
