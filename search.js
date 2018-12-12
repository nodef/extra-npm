const boolean = require('boolean');
const got = require('got');
const cp = require('child_process');


// Global variables.
const E = process.env;
const OPTIONS = {
  help: false,
  querys: null,
  silent: boolean(E['ENPM_SEARCH_SILENT']||E['ENPM_SILENT']||'0'),
  long: boolean(E['ENPM_SEARCH_LONG']||'0'),
  json: boolean(E['ENPM_SEARCH_JSON']||'0'),
  parseable: boolean(E['ENPM_SEARCH_PARSEABLE']||'0'),
  description: boolean(E['ENPM_SEARCH_DESCRIPTION']||'1'),
  searchopts: E['ENPM_SEARCH_SEARCHOPTS']||'',
  searchexclude: E['ENPM_SEARCH_SEARCHEXCLUDE']||'',
  searchstaleness: parseInt(E['ENPM_SEARCH_SEARCHSTALELESS']||'900', 10),
  registry: E['ENPM_REGISTRY']||'https://registry.npmjs.org/',
  limit: parseInt(E['ENPM_SEARCH_LIMIT']||'20', 10),
  offset: parseInt(E['ENPM_SEARCH_OFFSET']||'0', 10),
  detailed: boolean(E['ENPM_SEARCH_DETAILED']||'1'),
  sortBy: E['ENPM_SEARCH_SORTBY']||'optimal',
  maintenance: parseFloat(E['ENPM_SEARCH_MAINTENAMCE']||'0.65'),
  popularity: parseFloat(E['ENPM_SEARCH_POPULARITY']||'0.98'),
  quality: parseFloat(E['ENPM_SEARCH_QUALITY']||'0.5')
};
const SEARCH = new Set([
  'name', 'scope', 'version', 'description', 'keywords', 'date', 'links',
  'author', 'publisher', 'maintainers', 'score', 'searchScore'
]);
const SPECIAL = new Set([
  'stars', 'versions', 'contents', 'readme', 'dependents', 'downloads', 'available'
]);



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

// Populate search results with necessary fields.
async function populate(as, flds) {
  
};

async function shell() {
  var as = await search('maintainer:wolfram77', 0, 1000000);
  console.log(as.length, as[0]);
};
shell();
