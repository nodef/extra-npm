#!/usr/bin/env node
const semver = require('semver');
const validateNpmPackageName = require('validate-npm-package-name');
const validateNpmPackageLicense = require('validate-npm-package-license');
const npmUserValidate = require('npm-user-validate');
const boolean = require('extra-boolean').parse;
const dash = require('./dash');

const E = process.env;
const OPTIONS = {
  help:   false,
  field:  null,
  value:  null,
  silent: boolean(E['NPM_SILENT']||'0')
};
const FUNCTION = new Map([
  ['name',     name],
  ['version',  version],
  ['license',  license],
  ['email',    email],
  ['username', username],
]);




// Validate package name.
function name(txt, o) {
  var a = validateNpmPackageName(txt);
  if (a.validForNewPackages) return console.log(1);
  if (a.validForOldPackages) return console.log(0);
  if (o.silent) return console.log(-1);
  for (var m of a.errors||[])
    dash.error('error: '+m);
  for (var m of a.warnings||[])
    dash.warn('warning: '+m);
}

// Validate package version.
function version(txt, o) {
  var a = semver.valid(txt);
  if (a) console.log(1);
  else dash.error('error: invalid semver format', o);
}

// Validate package license.
function license(txt, o) {
  var a = validateNpmPackageLicense(txt);
  if (a.validForNewPackages) return console.log(1);
  if (a.validForOldPackages) return console.log(0);
  if (o.silent) return console.log(-1);
  for(var m of a.warnings||[])
    dash.warn('warning: '+m);
}

// Validate email.
function email(txt, o) {
  var e = npmUserValidate.email(txt);
  if (!e) console.log(1);
  else dash.error('error: '+e.message, o);
}

// Validate username.
function username(txt, o) {
  var e = npmUserValidate.username(txt);
  if (!e) console.log(1);
  else dash.error('error: '+e.message, o);
}


// Validate something, dont leave to chance!
function validate(fld, val, o) {
  var o = Object.assign({}, OPTIONS, o);
  var fn = FUNCTION.get(fld);
  if (fn) fn(val, o);
  else dash.error(`error: cannot validate "${fld}"`, o);
}
module.exports = validate;


// Get options from arguments.
function options(o, k, a, i) {
  if (k === '--silent') o.silent = true;
  else if (!o.field)    o.field = a[i];
  else o.value = a[i];
  return i+1;
}

// Run on shell.
function shell(a) {
  var o = {};
  for (var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  validate(o.field, o.value, o);
}
if(require.main === module) shell(process.argv);
