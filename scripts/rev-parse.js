#!/usr/bin/env node
const boolean = require('boolean');
const pkgDir = require('pkg-dir');
const kleur = require('kleur');
const path = require('path');


// Global variables.
const E = process.env;
const OPTIONS = {
  help: false,
  parameter: null,
  args: null,
  silent: boolean(E['ENPM_SILENT']||'0')
};
const FUNCTION = new Map([
  ['--package', package],
  ['--root-package', rootPackage]
]);
const STDIO = [0, 1, 2];


// Log error message.
function error(err, o) {
  if(o.silent) console.log(-1);
  else console.error(kleur.red('error:'), err.message);
};

// Get path of nearest package.json.
function package(args, o) {
  var a = pkgDir.sync();
  if(!a) return error(new Error('no package.json found'), o);
  console.log(a);
};

// Get root directory of package.
function rootPackage(args, o) {
  for(var a=pkgDir.sync(), b=null; a!=null;)
    a = pkgDir.sync(path.dirname(b=a));
  if(!b) return error(new Error('no package.json found'), o);
  console.log(b);
};

// Get value of parameter.
function revParse(par, args, o) {
  var o = Object.assign({}, OPTIONS, o);
  var fn = FUNCTION.get(par);
  if(!fn) return error(new Error('unknown parameter '+par), o);
  fn(args, o);
};

// Get options from arguments.
function options(o, k, a, i) {
  o.args = o.args||[];
  if(k==='--help') o.help = true;
  else if(k==='--silent') o.silent = true;
  else if(k.startsWith('--') && !o.parameter) o.parameter = k;
  else o.args.push(a[i]);
  return i+1;
};

revParse.options = options;
module.exports = revParse;

// Run on shell.
function shell(a) {
  var o = {};
  for(var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  if(o.help) return cp.execSync('less rev-parse.md', {cwd: __dirname, stdio: STDIO});
  revParse(o.parameter, o.args, o);
};
if(require.main===module) shell(process.argv);
