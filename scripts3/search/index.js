#!/usr/bin/env node
const kleur = require('kleur');
const cp = require('child_process');
const _package = require('./_api.js/index.js');
require('extra-boolean');

// Global variables.
const E = process.env;
const OPTIONS = {
  help: false,
  query: null,
  silent: Boolean.parse(E['ENPM_SILENT']||'0'),
  long: Boolean.parse(E['ENPM_SEARCH_LONG']||'0'),
  json: Boolean.parse(E['ENPM_SEARCH_JSON']||'0'),
  parseable: Boolean.parse(E['ENPM_SEARCH_PARSEABLE']||'0'),
  description: Boolean.parse(E['ENPM_SEARCH_DESCRIPTION']||'1'),
  searchopts: E['ENPM_SEARCH_SEARCHOPTS']||'',
  searchexclude: E['ENPM_SEARCH_SEARCHEXCLUDE']||'',
  searchstaleness: parseInt(E['ENPM_SEARCH_SEARCHSTALELESS']||'900', 10),
  limit: parseInt(E['ENPM_SEARCH_LIMIT']||'20', 10),
  offset: parseInt(E['ENPM_SEARCH_OFFSET']||'0', 10),
  detailed: Boolean.parse(E['ENPM_SEARCH_DETAILED']||'1'),
  sortBy: E['ENPM_SEARCH_SORTBY']||'optimal',
  ascending: Boolean.parse(E['ENPM_SEARCH_ASCENDING']||'0'),
  fields: E['ENPM_SEARCH_FIELDS']||'name,version,description,author',
};
const STDIO = [0, 1, 2];



// CONSOLE
// Run on shell.
function main(a) {
  var o = {};
  for(var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  if(o.help) return cp.execSync('less search.md', {cwd: __dirname, stdio: STDIO});
  search(o.query.trim(), o);
}

// Get options from arguments.
function options(o, k, a, i) {
  o.query = o.query||'';
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
  else if(k==='--ascending') o.ascending = true;
  else if(k==='--fields') o.fields = a[++i];
  else o.query += a[i]+' ';
  return i+1;
}

// Get ellipsis text.
function ellipsis(txt, len) {
  return txt.length>len? txt.substring(0, len-3)+'...':txt.padEnd(len, ' ');
}

// Get map from arrays.
function mapFrom(a, b) {
  var map = new Map();
  for(var i=0, I=a.length; i<I; i++)
    map.set(a[i], b[i]);
  return map;
}

// Get output sizes.
function outputSizes(as, flds) {
  var cols = (process.stdout.columns||Number.MAX_SAFE_INTEGER)-3*flds.length-1;
  var sizs = flds.map(f => Math.max.apply(null, as.map(a => Math.min(_package.fstring(a, f).length, 32)).concat([f.length])));
  var sizt = sizs.reduce((a, v) => a+v);
  return sizt>cols? sizs.map(v => Math.floor(v*(cols/sizt))):sizs;
}

// Get highlighted text.
function highlight(out, qry, fn) {
  for(var re of qry.replace(/\W+/g, ' ').split(' ').map(v => new RegExp(v, 'gi')))
    out = out.replace(re, m => fn(m));
  return out;
}

// Output in default mode.
function outputDefault(as, flds, qry) {
  var sizm = mapFrom(flds, outputSizes(as, flds));
  var top = '| '+flds.map(f => ellipsis(f, sizm.get(f))).join(' | ')+' |';
  console.log(top); console.log('-'.repeat(top.length));
  for(var a of as) {
    var lin = '| '+flds.map(f => ellipsis(_package.fstring(a, f), sizm.get(f))).join(' | ')+' |';
    console.log(highlight(lin, qry, kleur.red));
  }
}

// Output in parseable mode.
function outputParseable(as, flds) {
  for(var a of as)
    console.log(flds.map(f => _package.fstring(a, f).join('\t')));
}

// Output in JSON mode.
function outputJson(as) {
  console.log('[');
  for(var i=0, I=as.length-1; i<I; i++)
    console.log(JSON.stringify(as[i])+',');
  console.log(as[I]);
  console.log(']');
}

async function $search(qry, o) {
  var a = await search(qry, o);
  var flds = o.fields.split(',');
  if(o.sortBy) flds.push(o.sortBy);
  if(o.json) outputJson(a);
  else if(o.parseable) outputParseable(a, flds);
  else outputDefault(a, flds, qry);
}

// pre: sortBy
// progress 10%, 80%, 10%
async function search(qry, o) {
  var o = Object.assign({}, OPTIONS, o);
  var rnk = $npm.ranking(o.sortBy);
  var qry = query(qry, o.searchopts||[], o.searchexclude||[]);
  var rows = await $npm.getSearch(qry, o.offset||0, o.limit||-1, rnk);
  var cols = getColumns(o.fields, rnk? null:o.sortBy);
  await _package.populate(rows, cols);
  if(!rnk) _package.sortBy(rows, o.sortBy);
  if(o.ascending) rows = rows.reverse();
  if(!rnk) rows = rows.slice(o.offset, o.limit);
  if(o.json) outputJson(rows);
  else if(o.parseable) outputParseable(rows, cols);
  else outputDefault(rows, cols, qry);
}

// Get columns for each row.
function getColumns(cols, sortby) {
  var a = cols? cols.slice():[];
  if(!a.includes('name')) a.unshift('name');
  if(!a.includes('version')) a.unshift('version');
  if(sortby) a.push(sortby);
  return a;
}

// Get APIs needed for the columns.
function getApis(cols) {
  var a = new Set();
  for(var c of cols)
    a.add(FAPI.get(c));
  return a;
}

function getRows(rows, apis) {
  
}

// Populate search results with necessary fields.
function populate(rs, flds) {
  return rs.map(r => {
    var a = {};
    for(var f of flds)
      a[f] = fget(r, f);
  });
}

// Sort search results by field.
function sortBy(rs, fld) {
  return rs.sort((a, b) => {
    var y = fget(a, fld), x = fget(b, fld);
    if(Array.isArray(x)) return x.join().localeCompare(y.join());
    if(typeof x==='string') return x.localeCompare(y);
    if(typeof x==='object') return JSON.stringify(x).localeCompare(JSON.stringify(y));
    return x-y;
  });
}

// Get runnable query.
function query(x, inc, exc) {
  x += inc.join(' ')+exc.map(v => '-'+v).join(' ');
  return x.replace(/=/g, 'maintainer:').replace(/\+/g, 'keyword:').replace(/[^\w\-\/:@]+/, '');
}
module.exports = search;
if(require.main===module) main(process.argv);
