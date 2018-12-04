const validateNpmPackageName = require('validate-npm-package-name');
const validateNpmPackageLicense = require('validate-npm-package-license');
const npmUserValidate = require('npm-user-validate');
const semver = require('semver');


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

// Validate username.
function user(txt, o) {
  var e = npmUserValidate.username(txt);
  if(e==null) return console.log(1);
  if(!o.log) return console.log(-1);
  console.error('error:', e.message);
};

// Validate email.
function email(txt, o) {
  var e = npmUserValidate.email(txt);
  if(e==null) return console.log(1);
  if(!o.log) return console.log(-1);
  console.error('error:', e.message);
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

// Validate package version.
function version(txt, o) {
  var a = semver.valid(txt);
  if(a) return console.log(1);
  if(!o.log) return console.log(-1);
  console.error('error: invalid semver format');
};

exports.name = name;
exports.user = user;
exports.email = email;
exports.license = license;
exports.version = version;
