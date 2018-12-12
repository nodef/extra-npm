const boolean = require('boolean');
const cp = require('child_process');
const _package = require('./_package');


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


async function shell() {
  var as = await _package.search('maintainer:wolfram77', 0, 1000000);
  await _package.populate(as, ['license']);
  console.log(as.length, as[0]);
};
shell();
