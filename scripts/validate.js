#!/usr/bin/env node
const validateNpmPackageName = require('validate-npm-package-name');
const validateNpmPackageLicense = require('validate-npm-package-license');
const npmUserValidate = require('npm-user-validate');
const boolean = require('boolean');
const semver = require('semver');
const kleur = require('kleur');
const cp = require('child_process');


// Global variables.
const E = process.env;
const OPTIONS = {
  help: false,
  type: null,
  value: null,
  silent: boolean(E['ENPM_SILENT']||'0')
};
const FUNCTION = new Map([
  ['name', name],
  ['version', version],
  ['license', license],
  ['email', email],
  ['username', username],
]);
const STDIO = [0, 1, 2];


// Validate package name.
function name(txt, o) {
  var a = validateNpmPackageName(txt);
  if(a.validForNewPackages) return console.log(1);
  if(a.validForOldPackages) return console.log(0);
  if(o.silent) return console.log(-1);
  for(var m of a.errors||[])
    console.error(kleur.red('error:'), m);
  for(var m of a.warnings||[])
    console.warn(kleur.yellow('warning:'), m);
};

// Validate package version.
function version(txt, o) {
  var a = semver.valid(txt);
  if(a) return console.log(1);
  if(o.silent) return console.log(-1);
  console.error(kleur.red('error:'), 'invalid semver format');
};

// Validate package license.
function license(txt, o) {
  var a = validateNpmPackageLicense(txt);
  if(a.validForNewPackages) return console.log(1);
  if(a.validForOldPackages) return console.log(0);
  if(o.silent) return console.log(-1);
  for(var m of a.warnings||[])
    console.warn(kleur.yellow('warning:'), m);
};

// Validate email.
function email(txt, o) {
  var e = npmUserValidate.email(txt);
  if(e==null) return console.log(1);
  if(o.silent) return console.log(-1);
  console.error(kleur.red('error:'), e.message);
};

// Validate username.
function username(txt, o) {
  var e = npmUserValidate.username(txt);
  if(e==null) return console.log(1);
  if(o.silent) return console.log(-1);
  console.error(kleur.red('error:'), e.message);
};

// Validate something, dont leave to chance!
function validate(typ, txt, o) {
  var o = Object.assign({}, OPTIONS, o);
  var fn = FUNCTION.get(typ);
  if(fn!=null) return fn(txt, o);
  if(o.silent) return console.log(-1);
  console.error(kleur.red('error:'), 'cannot validate '+typ);
};

// Get options from arguments.
function options(o, k, a, i) {
  if(k==='-help') o.help = true;
  else if(k==='--silent') o.silent = true;
  else if(!o.type) o.type = a[i];
  else o.value = a[i];
  return i+1;
};

validate.options = options;
module.exports = validate;

// Run on shell.
function shell(a) {
  var o = {};
  for(var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  if(o.help) return cp.execSync('less validate.md', {cwd: __dirname, stdio: STDIO});
  validate(o.type, o.value, o);
};
if(require.main===module) shell(process.argv);
