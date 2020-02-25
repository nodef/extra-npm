#!/usr/bin/env node
const validate = require('./');
const boolean = require('extra-boolean');
const kleur = require('kleur');
const cp = require('child_process');

const E = process.env;
const OPTIONS = {
  help: false,
  field: null,
  value: null,
  silent: boolean.parse(E['ENPM_SILENT']||'0')
};
const STDIO = [0, 1, 2];



// Run on shell.
function main(a) {
  var o = {};
  for(var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  if(o.help) return cp.execSync('less validate.md', {cwd: __dirname, stdio: STDIO});
  validate(o.field, o.value, o);
};

// Get options from arguments.
function options(o, k, a, i) {
  if(k==='--help') o.help = true;
  else if(k==='--silent') o.silent = true;
  else if(!o.field) o.field = a[i];
  else o.value = a[i];
  return i+1;
};

// Validate something, dont leave to chance!
function validate(fld, val, o) {
  var o = Object.assign({}, OPTIONS, o);
  var fn = validate[fld];
  if(!fn) return error('cannot validate '+fld, o);
  var ans = fn(val, o);
  if(ans) error(ans, o);
  else console.log(1);
};


// Log error message.
function error(msg, o) {
  if(o.silent) console.log(-1);
  else console.error(kleur.red('error:'), msg);
};
if(require.main===module) main(process.argv);
