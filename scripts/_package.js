const dotProp = require('dot-prop');
const https = require('https');


// Global variables.
const FSEARCH = new Set([
  'name', 'scope', 'version', 'description', 'keywords', 'date', 'links',
  'author', 'publisher', 'maintainers', 'score', 'searchScore'
]);
const FSPECIAL = new Set([
  'versions', 'contents', 'readme', 'dependents', 'downloads'
]);
const FGET = new Map([
  ['name', a => a.package.name],
  ['scope', a => a.package.scope],
  ['version', a => a.package.version],
  ['description', a => a.package.description],
  ['keywords', a => a.package.keywords],
  ['date', a => a.package.date.ts],
  ['date.rel', a => a.package.date.rel],
  ['links', a => a.package.links.npm],
  ['links.npm', a => a.package.links.npm],
  ['links.homepage', a => a.package.links.homepage],
  ['links.repository', a => a.package.links.repository],
  ['links.bugs', a => a.package.links.bugs],
  ['author', a => user(a.package.author)],
  ['publisher', a => user(a.package.publisher)],
  ['publisher.name', a => a.package.publisher.name],
  ['publisher.username', a => a.package.publisher.name],
  ['publisher.email', a => a.package.publisher.email],
  ['maintainers', a => a.package.maintainers.map(v => user(v))],
  ['maintainers.username', a => a.package.maintainers.map(v => v.username)],
  ['maintainers.email', a => a.package.maintainers.map(v => v.email)],
  ['score', a => a.score.final],
  ['optimal', a => a.score.final],
  ['score.quality', a => a.score.detail.quality],
  ['quality', a => a.score.detail.quality],
  ['score.popularity', a => a.score.detail.popularity],
  ['popularity', a => a.score.detail.popularity],
  ['score.maintenance', a => a.score.detail.maintenance],
  ['maintenance', a => a.score.detail.maintenance],
  ['searchScore', a => a.searchScore],
  ['versions', a => a.special.versions],
  ['contents', a => a.special.contents],
  ['readme', a => a.special.readme],
  ['dependents', a => a.special.dependents],
  ['downloads', a => a.special.downloads.month],
  ['downloads.day', a => a.special.downloads.day],
  ['downloads.week', a => a.special.downloads.week],
  ['downloads.month', a => a.special.downloads.month],
  ['downloads.detail', a => a.special.downloads.detail],
]);
const RANKING = new Map([
  ['score', 'optimal'],
  ['optimal', 'optimal'],
  ['score.quality', 'quality'],
  ['quality', 'quality'],
  ['score.popularity', 'popularity'],
  ['popularity', 'popularity'],
  ['score.maintenance', 'maintenance'],
  ['maintenance', 'maintenance'],
  ['searchScore', 'optimal'],
]);
const DOWNLOADS = {day: 0, week: 0, month: 0, detail: []};
const SPECIAL = {
  versions: null,
  contents: null,
  readme: null,
  dependents: null,
  downloads: null
};
const DAYS = new Map([
  ['day', 1],
  ['week', 7],
  ['month', 30],
  ['year', 365]
]);
const NPMJSOPT = {
  headers: {'x-spiferack': 1}
};
const NPMJSPAGE = 36;





// Get user info string.
function user(x) {
  x = x||'';
  if(typeof x==='string') return x;
  var a = x.name||x.username;
  if(x.email) a += ` <${x.email}>`;
  if(x.url) a += ` (${x.url})`;
  return a;
};

// Get root of a field.
function froot(fld) {
  return fld.replace(/^#/, '').replace(/\..*/, '');
};

// Get value of a field.
function fget(a, fld) {
  var b = fld.replace(/^#/, '');
  var v = FGET.has(b)? FGET.get(b)(a):dotProp(a.json, b);
  if(fld[0]!=='#') return v;
  if(Array.isArray(v)) return v.length;
  if(typeof v==='string') return v.length;
  if(typeof v==='object') return Object.keys(v).length;
  return v;
};

// Get field as string.
function fstring(a, fld) {
  var v = fget(a, fld);
  return typeof v==='object'? JSON.stringify(v):''+v;
};

// Get runnable query.
function query(txt, inc=[], exc=[]) {
  txt += inc.join(' ')+exc.map(v => '-'+v).join(' ');
  return txt.replace(/=/g, 'maintainer:').replace(/\+/g, 'keyword:').replace(/[^\w\-\/:@]+/, '');
};

// Get ranking from field.
function ranking(fld) {
  return RANKING.get(fld)||null;
};

// Search all packages.
async function search(qry, rnk=null, off=0, lim=Number.MAX_SAFE_INTEGER) {
  var aps = [], as = [];
  var tot = -1, off = off, end = off+lim;
  do {
    var ap = searchPage(qry, rnk, Math.floor(off/20));
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
  search(nam, null, 0, 1).then(as => as[0]);
};

// Get downloads.
async function downloads(nam) {
  var a = await httpGet('https://api.npmjs.org/downloads/range/last-month/'+nam);
  var detail = a.downloads;
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
  if(flds.has('versions')) ps.push(versions(nam).then(v => a.versions=v, () => a.versions=[]));
  if(flds.has('contents')) ps.push(contents(nam, ver).then(v => a.contents=v, () => a.contents=[]));
  if(flds.has('readme')) ps.push(readme(nam, ver).then(v => a.readme=v, () => a.readme=''));
  if(flds.has('dependents')) ps.push(dependents(nam).then(v => a.dependents=v, () => a.dependents=[]));
  if(flds.has('downloads')) ps.push(downloads(nam).then(v => a.downloads=v, () => a.downloads=DOWNLOADS));
  return Promise.all(ps).then(() => a);
};

// Populate json for a search result.
function populateJson(a) {
  var {name, version} = a.package;
  return json(name, version).then(v => a.json = v, () => {
    return json(name).then(v => a.json = v);
  });
};

// Populate special for a search result.
function populateSpecial(a, flds) {
  var {name, version} = a.package;
  return special(name, version, flds).then(v => a.special = v, () => {
    return special(name, undefined, flds).then(v => a.special = v);
  });
};

// Populate search results with necessary fields.
function populate(as, flds) {
  var spc = new Set(), jsn = false;
  for(var f of flds) {
    var r = froot(f);
    if(FSEARCH.has(r)) continue;
    if(FSPECIAL.has(r)) spc.add(r);
    else jsn = true;
  }
  var aps = [];
  for(var a of as) {
    if(jsn) aps.push(populateJson(a));
    if(spc.size) aps.push(populateSpecial(a, spc));
  }
  return Promise.all(aps);
};

// Sort search results by field.
function sortBy(as, fld) {
  return as.sort((a, b) => {
    var y = fget(a, fld), x = fget(b, fld);
    if(Array.isArray(x)) return x.join().localeCompare(y.join());
    if(typeof x==='string') return x.localeCompare(y);
    if(typeof x==='object') return JSON.stringify(x).localeCompare(JSON.stringify(y));
    return x-y;
  });
};

// Get package info from npmjs.com.
function getPackage(nam) {
  return getJson(`https://www.npmjs.com/search?q=${nam}`, NPMJSOPT);
}

// Get search results from npmjs.com.
async function getSearch(qry, lim=1, rnk='optimal') {
  var {objects, total} = await getSearchPage(qry, 0, rnk);
  var pages = Math.floor((total-1)/20)+1, w = [];
  pages = lim<0? pages : Math.min(pages, lim);
  for(var p=1; p<pages; p++)
    w.push(getSearchPage(qry, p, rnk));
  var searches = await Promise.all(w);
  for(var s of searches)
    Array.prototype.push.apply(objects, s.objects);
  return objects;
}
// Get search results from npmjs.com (one page).
async function getSearchPage(qry, pag, rnk='optimal') {
  var url = `https://www.npmjs.com/search?ranking=${rnk}&perPage=20&page=${pag}&q=${qry}`;
  var a = await getJson(url, NPMJSOPT);
  return a.ghapi? await getJson(url+'*', NPMJSOPT):a;
}

// Get downloads from npmjs.org.
function getDownloads(nam, range='last-year') {
  // add day, week, month, year?
  return getJson(`https://api.npmjs.org/downloads/range/${range}/${nam}`);
}

// Get dependent packages from npmjs.com.
async function getDependents(nam, count) {
  var ans = new Array(count).fill(null), ps = [];
  for(var i=0; i<count; i+=NPMJSPAGE)
    ps.push(getDependentsPage(nam, i, ans));
  await Promise.all(ps);
  for(var i=ans.length-1; i>=0 && !ans[i]; i--);
  ans.length = i+1;
  return ans;
}
// Get dependent packages (one page) from npmjs.com.
async function getDependentsPage(nam, off, ans) {
  var url = `https://www.npmjs.com/browse/depended/${nam}?offset=${off}`;
  var a = await getJson(url, NPMJSOPT);
  for(var p of a.packages)
    ans[off++] = p;
}


// Get JSON response from URL.
function getJson(url, opt) {
  return new Promise((fres, frej) => {
    getBody(url, opt, (err, ans) => err? frej(err):fres(JSON.parse(ans)));
  });
}
// Get text response (body) from URL.
function getBody(url, opt, fn) {
  var req = https.request(url, opt||{}, res => {
    var code = res.statusCode, body = '';
    if(code>=400) { res.resume(); return fn(new Error(`Request to ${url} returned ${code}`)); }
    if(code>=300 && code<400) return getBody(res.headers.location, opt, fn);
    res.on('error', fn);
    res.on('data', b => body+=b);
    res.on('end', () => fn(null, body));
  });
  req.on('error', fn);
  req.end();
}

// Get last value in array.
function last(x) {
  return x[x.length-1];
}
exports.froot = froot;
exports.fget = fget;
exports.fstring = fstring;
exports.query = query;
exports.ranking = ranking;
exports.search = search;
exports.main = main;
exports.json = json;
exports.versions = versions;
exports.contents = contents;
exports.readme = readme;
exports.dependents = dependents;
exports.downloads = downloads;
exports.special = special;
exports.populate = populate;
exports.sortBy = sortBy;
