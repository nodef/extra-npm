#!/usr/bin/env node
const npmWhich = require('npm-which');
const boolean = require('extra-boolean').parse;
const kleur = require('kleur');
const cp = require('child_process');


// Global variables.
const E = process.env;
const OPTIONS = {
  help: false,
  cwd: null,
  command: null,
  silent: boolean(E['ENPM_SILENT']||'0')
};
const STDIO = [0, 1, 2];


// Log error message.
function error(err, o) {
  if(o.silent) console.log(-1);
  else console.error(kleur.red('error:'), err.message);
};

// Get path of local bin.
function which(cmd, o) {
  var o = Object.assign({}, OPTIONS, o);
  var cwd = o.cwd||process.cwd();
  npmWhich(cwd)(cmd, (err, pth) => {
    if(err) return error(err, o);
    console.log(pth);
  });
};

// Get options from arguments.
function options(o, k, a, i) {
  if(k==='--help') o.help = true;
  else if(k==='--silent') o.silent = true;
  else o.command = a[i];
  return i+1;
};

which.options = options;
module.exports = which;

// Run on shell.
function shell(a) {
  var o = {};
  for(var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  if(o.help) return cp.execSync('less which.md', {cwd: __dirname, stdio: STDIO});
  which(o.command, o);
};
if(require.main===module) shell(process.argv);
