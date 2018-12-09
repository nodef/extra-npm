#!/usr/bin/env node
const validateNpmPackageName = require('validate-npm-package-name');
const validateNpmPackageLicense = require('validate-npm-package-license');
const npmUserValidate = require('npm-user-validate');
const semver = require('semver');
const boolean = require('boolean');


// Global variables.
const OPTIONS = {
  type: null,
  value: null,
  log: boolean(E['ENPM_VALIDATE_LOG']||E['ENPM_LOG']||'1')
};
const FUNCTION = new Map([
  ['name', name],
  ['version', version],
  ['license', license],
  ['email', email],
  ['username', username],
]);


// Validate package name.
function name(txt, o) {
  var a = validateNpmPackageName(txt);
  if(a.validForNewPackages) return console.log(1);
  if(a.validForOldPackages) return console.log(0);
  if(!o.log) return console.log(-1);
  for(var m of a.errors||[])
    console.error('error:', m);
  for(var m of a.warnings||[])
    console.warn('warning:', m);
};

// Validate package version.
function version(txt, o) {
  var a = semver.valid(txt);
  if(a) return console.log(1);
  if(!o.log) return console.log(-1);
  console.error('error: invalid semver format');
};

// Validate package license.
function license(txt, o) {
  var a = validateNpmPackageLicense(txt);
  if(a.validForNewPackages) return console.log(1);
  if(a.validForOldPackages) return console.log(0);
  if(!o.log) return console.log(-1);
  for(var m of a.warnings||[])
    console.warn('warning:', m);
};

// Validate email.
function email(txt, o) {
  var e = npmUserValidate.email(txt);
  if(e==null) return console.log(1);
  if(!o.log) return console.log(-1);
  console.error('error:', e.message);
};

// Validate username.
function username(txt, o) {
  var e = npmUserValidate.username(txt);
  if(e==null) return console.log(1);
  if(!o.log) return console.log(-1);
  console.error('error:', e.message);
};

// Validate something, dont leave to chance!
function validate(typ, txt, o) {
  var o = Object.assign({}, OPTIONS, o);
  var fn = FUNCTION.get(typ);
  return fn? fn(txt, o):console.log('error: cannot validate '+typ)
};

// Get options from arguments.
function options(o, k, a, i) {
  if(k==='-help') o.help = true;
  else if(k==='-l' || k==='--log') o.log = true;
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
  validate(o.type, o.value, o);
};
if(require.main===module) shell(process.argv);
