const npmPackageVersions = require('npm-package-versions');
const npmPackageStars = require('npm-package-stars');
const listNpmContents = require('list-npm-contents');
const packageJson = require('package-json');
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
  'stars', 'versions', 'contents', 'readme', 'dependents', 'downloads'
]);



// Get root of a field.
function root(fld) {
  return fld.replace(/^#/, '').replace(/\..*/, '');
};

// Populate package json for a search result.
function populateJson(a) {
  var {name, version} = a.package, fullMetadata = true;
  return packageJson(name, {version, fullMetadata}).then(v => a.json = v, () => {
    return packageJson(name, {fullMetadata}).then(v => a.json = v);
  });
};

function populateSpecial(a, set) {
  var {name, version} = a.package;
  var ps = [], b = (a.special=a.special||{});
  if(set.has('stars')) ps.push(npmPackageStars(name).then(v => b.stars = v));
  if(set.has('versions')) ps.push(new Promise((fres, frej) => {
    npmPackageVersions(name, (e, v) => e? frej(e):fres(b.versions = v))
  }));
  if(set.has('contents')) ps.push(listNpmContents(name, version).then(v => b.contents = v, () => {
    return listNpmContents(name).then(v => b.contents = v);
  }));
  
};

// Populate search results with necessary fields.
function populate(as, flds) {
  var aps = [];
  var spc = new Set(), jsn = false;
  for(var f of flds) {
    var r = root(f);
    if(SEARCH.has(r)) continue;
    if(SPECIAL.has(r)) pop.add(r);
    else jsn = true;
  }
  if(spc.size) {
    for(var a of as) a.special = a.special||{};
  }
  if(jsn) { for(var a of as) aps.push(populateJson(a)); }
  return Promise.all(aps);
};

async function shell() {
  var as = await search('maintainer:wolfram77', 0, 1000000);
  await populate(as, ['license']);
  console.log(as.length, as[0]);
};
shell();
