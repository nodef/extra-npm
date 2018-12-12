const GETFN = new Map([
  ['keywords', p => p.package.keywordsJoin],
  ['dependencies.length', p => p.package.dependenciesLength],
  ['devDependencies.length']
]);

const SORTFN = new Map([
  ['name', (a, b) => a.package.name.localeCompare(b.package.name)],
  ['name.length', (a, b) => a.package.name.length-b.package.name.length],
  ['version', (a, b) => semver.compare(a.package.version, b.package.version)],
  ['version.length', (a, b) => a.package.version.length-b.package.version.length],
  ['description', (a, b) => a.package.description.localeCompare(b.package.description)],
  ['description.length', (a, b) => a.package.description.length-b.package.description.length],
  ['author', (a, b) => a.package.author.name.localeCompare(b.package.author.name)],
  ['author.length', (a, b) => a.package.author.name.length-b.package.author.name.length],
  ['keywords', (a, b) => a.package.keywords.join().localeCompare(b.package.keywords.join())],
  ['keywords.length', (a, b) => a.package.keywords.length-b.package.keywords.length],
  [':scope', (a, b) => a.package.scope.localeCompare(b.package.scope)],
  [':date', (a, b) => a.package.date.ts-b.package.date.ts],
  [':publisher', (a, b) => a.package.publisher.name.localeCompare(b.package.publisher.name)],
  [':publisher.length', (a, b) => a.package.publisher.name.length-b.package.publisher.name.length],
  [':maintainers', (a, b) => a.package.maintainers.map(m => m.username).join().localeCompare(b.package.maintainers.map(m => m.username).join())],
  [':maintainers.length', (a, b) => a.package.maintainers.length-b.package.maintainers.length],
  [':score', (a, b) => a.score.final-b.score.final],
  [':score.quality', (a, b) => a.score.detail.quality-b.score.detail.quality],
  [':score.popularity', (a, b) => a.score.detail.popularity-b.score.detail.popularity],
  [':score.maintenance', (a, b) => a.score.detail.maintenance-b.score.detail.maintenance],
  [':stars', (a, b) => a.stars-b.stars],
  [':versions', (a, b) => a.versions.length-b.versions.length],
  [':readme', (a, b) => a.readme.localeCompare(b.readme)],
  [':readme.length', (a, b) => a.readme.length-b.readme.length],
]);
const STDIO = [0, 1, 2];


// Add all values to set.
function setAddAll(set, vals) {
  for(var v of vals)
    set.add(v);
  return set;
};

// Get RegExp from expression.
function getRegexp(pos) {
  return new RegExp(pos.replace(/\*/g, '.*?').replace(/\?/g, '.'), 'i');
};

// Process packages before sorting.
function sortProcess(pkgs) {
  for(var p of pkgs) {
    p.package.description = p.package.description||'';
    p.package.keywords = p.package.keywords||[];
    p.package.keywordsJoin = p.package.keywords.join();
    p.package.dependencies = p.package.dependencies||{};
    p.package.dependenciesKeys = Object.keys(p.package.dependencies).join();
    p.package.dependenciesLength = Object.keys(p.package.dependencies).length;
    p.package.devDependencies = p.package.devDependencies||{};
    p.package.devDependenciesKeys = Object.keys(p.package.devDependencies).join();
    p.package.devDependenciesLength = Object.keys(p.package.devDependencies).length;
    p.package.bundledDependencies = p.package.bundledDependencies||{};
  }
};

// Show parseable output.
function outputSilent(pkgs, o) {
  for(var p of pkgs) {
    console.log(p.package.name);
  }
};

function outputNormal(pkgs, o) {
  
};

// Sort package details.
function sort(pkgs, by) {
};

async function searchAuthors(qry, o) {
  var flts = [], aths = [], pkgs = new Set();
  for(var q of qry.split(/\s+/)) {
    if(!q.startsWith('=')) flts.add(getRegexp(q));
    else aths.add(npmListAuthorPackages({username: q.substring(1), registry: o.registry}));
  }
  for(var a of (await Promise.all(aths)))
    setAddAll(pkgs, a);
  if(o.silent) { for(var p of pkgs) { console.log(p); } return; }
  pkgs = Array.from(pkgs);
};

// Get search results.
async function search(qrys, o) {
  console.log(o);
  var o = Object.assign({}, OPTIONS, o);
  var qry = '', flts = [];
  qry = qrys.join(' ');
  var ans = await libnpmsearch(qry, o);
  console.log(ans);
};

async function searchAll(qry, o) {
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
  if(o.help) return cp.execSync('less search.md', {cwd: __dirname, stdio: STDIO});
  search(o.querys, o);
};
if(require.main===module) shell(process.argv);
