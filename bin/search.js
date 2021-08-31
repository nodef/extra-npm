#!/usr/bin/env node
// Searches for packages.
const kleur = require('kleur');
const boolean = require('extra-boolean').parse;
const _package = require('./_package.js');

const E = process.env;
const OPTIONS = {
  query: null,
  silent:      boolean(E['NPM_SILENT']||'0'),
  long:        boolean(E['NPM_SEARCH_LONG']||'0'),
  json:        boolean(E['NPM_SEARCH_JSON']||'0'),
  parseable:   boolean(E['NPM_SEARCH_PARSEABLE']||'0'),
  description: boolean(E['NPM_SEARCH_DESCRIPTION']||'1'),
  searchopts:    E['NPM_SEARCH_SEARCHOPTS']||'',
  searchexclude: E['NPM_SEARCH_SEARCHEXCLUDE']||'',
  searchstaleness:  parseInt(E['NPM_SEARCH_SEARCHSTALELESS']||'900', 10),
  limit:            parseInt(E['NPM_SEARCH_LIMIT']||'20', 10),
  offset:           parseInt(E['NPM_SEARCH_OFFSET']||'0', 10),
  detailed:  boolean(E['NPM_SEARCH_DETAILED']||'1'),
  sortBy:            E['NPM_SEARCH_SORTBY']||'optimal',
  ascending: boolean(E['NPM_SEARCH_ASCENDING']||'0'),
  fields:            E['NPM_SEARCH_FIELDS']||'name,version,description,author'
};




// Get ellipsis text.
function ellipsis(txt, len) {
  return txt.length>len? txt.substring(0, len-3)+'...' : txt.padEnd(len, ' ');
}


// Get map from arrays.
function mapFrom(a, b) {
  var map = new Map();
  for (var i=0, I=a.length; i<I; i++)
    map.set(a[i], b[i]);
  return map;
}


// Get output sizes.
function outputSizes(as, flds) {
  var cols = (process.stdout.columns||Number.MAX_SAFE_INTEGER)-3*flds.length-1;
  var sizs = flds.map(f => Math.max.apply(null, as.map(a => Math.min(_package.fstring(a, f).length, 32)).concat([f.length])));
  var sizt = sizs.reduce((a, v) => a+v);
  return sizt>cols? sizs.map(v => Math.floor(v*(cols/sizt))) : sizs;
}


// Get highlighted text.
function highlight(out, qry, fn) {
  for (var re of qry.replace(/\W+/g, ' ').split(' ').map(v => new RegExp(v, 'gi')))
    out = out.replace(re, m => fn(m));
  return out;
}


// Output in default mode.
function outputDefault(as, flds, qry) {
  var sizm = mapFrom(flds, outputSizes(as, flds));
  var top = '| '+flds.map(f => ellipsis(f, sizm.get(f))).join(' | ')+' |';
  console.log(top); console.log('-'.repeat(top.length));
  for (var a of as) {
    var lin = '| '+flds.map(f => ellipsis(_package.fstring(a, f), sizm.get(f))).join(' | ')+' |';
    console.log(highlight(lin, qry, kleur.red));
  }
}

// Output in parseable mode.
function outputParseable(as, flds) {
  for (var a of as)
    console.log(flds.map(f => _package.fstring(a, f)).join('\t'));
}

// Output in JSON mode.
function outputJson(as) {
  console.log('[');
  for (var i=0, I=as.length; i<I; i++)
    console.log(JSON.stringify(as[i])+(i!=I-1? ',':''));
  console.log(']');
}

// pre: sortBy
// progress 10%, 80%, 10%
async function search(qry, o) {
  var o = Object.assign({}, OPTIONS, o);
  var qry = _package.query(qry, o.searchopts||[], o.searchexclude||[]), rnk = _package.ranking(o.sortBy);
  var as = await _package.search(qry, rnk, rnk? o.offset:0, rnk? o.limit:Number.MAX_SAFE_INTEGER);
  var flds = o.fields.split(','); if (!rnk) flds.push(o.sortBy);
  await     _package.populate(as, flds);
  if (!rnk) _package.sortBy(as, o.sortBy);
  if (o.ascending) as = as.reverse();
  if (!rnk)        as = as.slice(o.offset, o.limit);
  if (o.json)           outputJson(as);
  else if (o.parseable) outputParseable(as, flds);
  else                  outputDefault(as, flds, qry);
}
module.exports = search;




// Get options from arguments.
function options(o, k, a, i) {
  o.query = o.query||'';
  if (k==='--silent') o.silent = true;
  else if (k==='-l' || k==='--long') o.long = true;
  else if (k==='--json')      o.json = true;
  else if (k==='--parseable') o.parseable = true;
  else if (k==='--no-description')  o.description = false;
  else if (k==='--searchopts')      o.searchopts = a[++i];
  else if (k==='--searchexclude')   o.searchexclude = a[++i];
  else if (k==='--searchstaleness') o.searchstaleness = parseInt(a[++i], 10);
  else if (k==='--limit')     o.limit  = parseInt(a[++i], 10);
  else if (k==='--offset')    o.offset = parseInt(a[++i], 10);
  else if (k==='--detailed')  o.detailed = true;
  else if (k==='--sortby')    o.sortBy = a[++i];
  else if (k==='--ascending') o.ascending = true;
  else if (k==='--fields')    o.fields = a[++i];
  else o.query += a[i]+' ';
  return i+1;
}

// Run on shell.
function shell(a) {
  var o = {query: ''};
  for (var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  search(o.query.trim(), o);
}
if (require.main===module) shell(process.argv);
