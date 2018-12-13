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


// Get ellipsis text.
function ellipsis(txt, len) {
  return txt.length>len? txt.substring(0, len-3)+'...':txt.padEnd(len, ' ');
};

// Get map from arrays.
function mapFrom(a, b) {
  var map = new Map();
  for(var i=0, I=a.length; i<I; i++)
    map.set(a[i], b[i]);
  return map;
};

// Get output sizes.
function outputSizes(as, flds) {
  var cols = (process.stdout.columns||Number.MAX_SAFE_INTEGER)-3*flds.length-1;
  var sizs = flds.map(f => Math.max.apply(null, as.map(a => Math.min(_package.fstring(a, f).length, 32))));
  var sizt = sizs.reduce((a, v) => a+v);
  console.log(cols, sizt, sizs);
  return sizt>cols? sizs.map(v => Math.floor(v*(sizt/cols))):sizs;
};

// Get highlighted text.
function highlight(out, qry, fn) {
  for(var re of qry.replace(/\W+/g, ' ').split(' ').map(v => new RegExp(v, 'gi')))
    out = out.replace(re, m => fn(m));
  return out;
};

// Output in default mode.
function outputDefault(as, flds, qry) {
  var sizm = mapFrom(flds, outputSizes(as, flds));
  var top = '| '+flds.map(f => ellipsis(f, sizm.get(f))).join(' | ')+' |';
  console.log(top); console.log('-'.repeat(top.length));
  for(var a of as) {
    var lin = '| '+flds.map(f => ellipsis(_package.fstring(a, f), sizm.get(f))).join(' | ')+' |';
    console.log(highlight(lin, qry));
  }
};



// pre: sortBy
// progress 10%, 80%, 10%
async function search(qry, o) {
  var qry = _package.query(qry, o.searchopts||[], o.searchexclude||[]), rnk = _package.ranking(o.sortBy);
  console.log('serach');
  var as = await _package.search(qry, rnk, o.offset||0, o.limit||Number.MAX_SAFE_INTEGER);
  var flds = ['name', 'version', 'description']; /*(o.output||'').split(',');*/ flds.push(o.sortBy);
  console.log('populate', as.length);
  await _package.populate(as, flds);
  console.log('sortBy');
  if(!rnk) _package.sortBy(as, o.sortBy);
  console.log('outputDefault');
  outputDefault(as, flds, qry);
};
search('express', {sortBy: 'downloads'});
