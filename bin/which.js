#!/usr/bin/env node
const npmWhich = require('npm-which');
const boolean = require('extra-boolean').parse;
const dash = require('./_dash');

const E = process.env;
const OPTIONS = {
  help:    false,
  cwd:     null,
  command: null,
  silent:  boolean(E['NPM_SILENT']||'0')
};




// Get path of local bin.
function which(cmd, o) {
  var o = Object.assign({}, OPTIONS, o);
  var cwd = o.cwd||process.cwd();
  npmWhich(cwd)(cmd, (err, pth) => {
    if (err) return dash.error('error: '+err.message, o);
    console.log(pth);
  });
}
module.exports = which;




// Get options from arguments.
function options(o, k, a, i) {
  if (k==='--silent') o.silent = true;
  else o.command = a[i];
  return i+1;
}

// Run on shell.
function shell(a) {
  var o = {};
  for (var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  which(o.command, o);
}
if (require.main===module) shell(process.argv);
