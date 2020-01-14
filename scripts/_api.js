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

// Get ranking from field.
function ranking(fld) {
  return RANKING.get(fld)||null;
};

// Get main.
function main(nam) {
  getSearch(nam, null, 0, 1).then(as => as[0]);
};

// Get registry info from npmjs.com.
function getRegistry(nam, ver) {
  return getJson(`https://registry.npmjs.com/${nam}/${ver||''}`);
}

// Get package info from npmjs.com.
function getPackage(nam) {
  return getJson(`https://www.npmjs.com/package/${nam}`, NPMJSOPT);
}

// Get search results from npmjs.com.
async function getSearch(qry, off=0, lim=1, rnk='optimal') {
  var {objects, total} = await getSearchPage(qry, off, rnk);
  var pages = Math.floor((total-1)/20)+1, w = [];
  pages = lim<0? pages : Math.min(pages, lim);
  for(var p=off+1; p<pages; p++)
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
async function getDownloads(nam, range='year') {
  var a = await getJson(`https://api.npmjs.org/downloads/range/last-${range}/${nam}`);
  var detail = a.downloads;
  var day = 0, week = 0, month = 0, year = 0;
  day = detail[0].downloads;
  for(var d of detail.slice(0, 7))
    week += d.downloads;
  for(var d of detail.slice(0, 30))
    month += d.downloads;
  for(var d of detail)
    year += d.downloads;
  return {day, week, month, year, detail};
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

exports.getRegistry = getRegistry;
exports.getPackage = getPackage;
exports.getSearch = getSearch;
exports.getDownloads = getDownloads;
exports.getDependents = getDependents;
exports.getJson = getJson;
exports.getBody = getBody;
