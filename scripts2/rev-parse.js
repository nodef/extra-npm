#!/usr/bin/env node
const kleur = require('kleur');
const path = require('path');
const fs = require('fs');
require('extra-boolean');

// Global variables.
const E = process.env;
const OPTIONS = {
  help: false,
  parameter: null,
  args: null,
  silent: Boolean.parse(E['ENPM_SILENT']||'0')
};
const STDIO = [0, 1, 2];



// CONSOLE
// Run on shell.
function main(a) {
  var o = {};
  for(var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  if(o.help) return cp.execSync('less rev-parse.md', {cwd: __dirname, stdio: STDIO});
  revParse(o.parameter||'', o.args, o);
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

// Get value of parameter.
function revParse(par, args, o) {
  var o = Object.assign({}, OPTIONS, o);
  switch(par.toLowerCase().replace(/-/g, '')) {
    case 'package': return package(args[0]).then(console.log, () => error('no package.json found', o));
    case 'rootpackage': return rootPackage(args[0]).then(console.log, () => error('no package.json found', o));
    default: return error('unknown parameter', o);
  }
};

// Log error message.
function error(err, o) {
  if(o.silent) console.log(-1);
  else console.error(kleur.red('error:'), err);
};



// JAVASCRIPT
/**
 * Gets node.js package directory path.
 * @param {string?} dir where to look from
 * @returns {Promise<string>} null if not found, else path
 */
function package(dir) {
  return new Promise((fres, frej) => _package(dir||'.', p => p? fres(p):frej()));
};
function _package(dir, fn) {
  dir = dir.startsWith('/')? dir:path.resolve(dir);
  var pkg = path.join(dir, 'package.json');
  fs.access(pkg, err => {
    if(!err) return fn(dir);
    if(path.isAbsolute(dir)) return fn(null);
    _package(path.dirname(dir), fn);
  });
}


/**
 * Gets root node.js package directory path.
 * @param {string?} dir where to look from
 * @returns {Promise<string>} null if not found, else path
 */
function rootPackage(dir) {
  return new Promise((fres, frej) => _rootPackage(dir||'.', p => p? fres(p):frej()));
};
function _rootPackage(dir, fn) {
  _package(dir, p => {
    if(!p) return fn(null);
    _rootPackage(path.dirname(p), q => fn(!q? p:q));
  });
}

exports.package = package;
exports.rootPackage = rootPackage;
if(require.main===module) main(process.argv);
