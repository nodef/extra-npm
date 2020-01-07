#!/usr/bin/env node
const revParse = require('./rev-parse.js');
const kleur = require('kleur');
const fs = require('extra-fs');
const cp = require('child_process');
const path = require('path');
require('extra-boolean');

// Global variables.
const E = process.env;
const PATHS = (E['PATH']||'').split(path.delimiter);
const OPTIONS = {
  help: false,
  cwd: null,
  command: null,
  silent: Boolean.parse(E['ENPM_SILENT']||'0')
};
const STDIO = [0, 1, 2];



// Run on shell.
function main(a) {
  var o = {};
  for(var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  if(o.help) return cp.execSync('less which.md', {cwd: __dirname, stdio: STDIO});
  $which(o.command, o);
}

// Get options from arguments.
function options(o, k, a, i) {
  if(k==='--help') o.help = true;
  else if(k==='--silent') o.silent = true;
  else o.command = a[i];
  return i+1;
}

// Get path of local bin.
function $which(cmd, o) {
  var o = Object.assign({}, OPTIONS, o);
  which(cmd, o).then(console.log, err => error(err, o));
}

// Log error message.
function error(err, o) {
  if(o.silent) console.log(-1);
  else console.error(kleur.red('error:'), err.message);
};


// TODO: include global dirs
/**
 * Locates executable path of programs, including in node_modules.
 * @param {string|RegExp|function} prog program name to look for
 * @param {object?} opt options {cwd, platform}
 */
function which(prog, opt=null) {
  var o = Object.assign({cwd: process.cwd()}, opt);
  o.paths = [o.cwd, ..._bins(o.cwd), ...PATHS];
  return fs.which(prog, o);
}
async function _bins(dir) {
  var ans = [];
  while(true) {
    var pkg = await revParse.package(dir);
    if(!pkg) return ans;
    ans.push(path.join(pkg, 'node_modules', '.bin'));
    dir = path.dirname(dir);
  }
}
which.options = options;
module.exports = which;
if(require.main===module) main(process.argv);
