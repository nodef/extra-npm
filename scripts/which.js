#!/usr/bin/env node
const npmWhich = require('npm-which');
const boolean = require('boolean');
const kleur = require('kleur');
const cp = require('child_process');


// Global variables.
const E = process.env;
const OPTIONS = {
  help: false,
  cwd: null,
  command: E['ENPM_WHICH_COMMAND']||null,
  silent: boolean(E['ENPM_WHICH_SILENT']||E['ENPM_SILENT']||'0')
};
const STDIO = [0, 1, 2];


// Get path of local bin.
function which(cmd, o) {
  var o = Object.assign({}, OPTIONS, o);
  var cwd = o.cwd||process.cwd();
  return new Promise((fres, frej) => npmWhich(cwd)(cmd, (err, pth) => {
    return err? frej(err):fres(pth);
  }));
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
  which(o.command, o).then(console.log, err => {
    if(o.silent) return console.log(-1);
    console.error(kleur.red('error:'), err.message);
  });
};
if(require.main===module) shell(process.argv);
