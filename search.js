const libnpmsearch = require('libnpmsearch');
const boolean = require('boolean');
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
  detailed: boolean(E['ENPM_SEARCH_DETAILED']||'0'),
  sortBy: E['ENPM_SEARCH_SORTBY']||'optimal',
  maintenance: parseFloat(E['ENPM_SEARCH_MAINTENAMCE']||'0.65'),
  popularity: parseFloat(E['ENPM_SEARCH_POPULARITY']||'0.98'),
  quality: parseFloat(E['ENPM_SEARCH_QUALITY']||'0.5')
};
const STDIO = [0, 1, 2];


// Get search results.
async function search(qrys, o) {
  var o = Object.assign({}, OPTIONS, o);
  var qry = '', flts = [];
  qry = qrys.join(' ');
  var ans = await libnpmsearch(qry, o);
  console.log(ans);
};

// Get options from arguments.
function options(o, k, a, i) {
  o.querys = o.querys||[];
  if(k==='--help') o.help = true;
  else if(k==='--silent') o.silent = true;
  else if(k==='-l' || k==='--long') o.long = true;
  else if(k==='--json') o.json = true;
  else if(k==='--parseable') o.parseable = true;
  else if(k==='--no-description') o.description = false;
  else if(k==='--searchopts') o.searchopts = a[++i];
  else if(k==='--searchexclude') o.searchexclude = a[++i];
  else if(k==='--searchstaleness') o.searchstaleness = parseInt(a[++i], 10);
  else if(k==='--registry') o.registry = a[++i];
  else if(k==='--limit') o.limit = parseInt(a[++i], 10);
  else if(k==='--offset') o.offset = parseInt(a[++i], 10);
  else if(k==='--detailed') o.detailed = true;
  else if(k==='--sortby') o.sortBy = a[++i];
  else if(k==='--maintenance') o.maintenance = parseFloat(a[++i]);
  else if(k==='--popularity') o.popularity = parseFloat(a[++i]);
  else if(k==='--quality') o.quality = parseFloat(a[++i]);
  else o.querys.push(a[i]);
  return i+1;
};

search.options = options;
module.exports = search;

// Run on shell.
function shell(a) {
  var o = {};
  for(var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  if(o.help) return cp.execSync('less README.md', {cwd: __dirname, stdio: STDIO});
  search(o.querys, o);
};
if(require.main===module) shell(process.argv);
