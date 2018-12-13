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
  limit: parseInt(E['ENPM_SEARCH_LIMIT']||'20', 10),
  offset: parseInt(E['ENPM_SEARCH_OFFSET']||'0', 10),
  detailed: boolean(E['ENPM_SEARCH_DETAILED']||'1'),
  sortBy: E['ENPM_SEARCH_SORTBY']||'optimal'
};

// pre: sortBy
// progress 10%, 80%, 10%
async function search(qry, o) {
  var qry = _package.query(qry, o.searchopts||[], o.searchexclude||[]), rnk = _package.ranking(o.sortBy);
  var as = await _package.search(qry, rnk, o.offset||0, o.limit||Number.MAX_SAFE_INTEGER);
  var flds = (o.output||'').split(','); flds.push(o.sortBy);
  await _package.populate(as, flds);
  if(!rnk) _package.sortBy(as, o.sortBy);
  for (var a of as.slice(0, 10))
    console.log(a.package.name, a.special.downloads.month);
};
search('=wolfram77 ', {sortBy: 'downloads'});
