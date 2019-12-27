#!/usr/bin/env node
const validateNpmPackageLicense = require('validate-npm-package-license');
const boolean = require('boolean');
const semver = require('semver');
const kleur = require('kleur');
const cp = require('child_process');


// Global variables.
const E = process.env;
const OPTIONS = {
  help: false,
  field: null,
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
const BUILTINS = [];


// Log error message.
function error(err, o) {
  if(o.silent) console.log(-1);
  else console.error(kleur.red('error:'), err.message);
};

/**
 * Validates username.
 * @param {string} x username
 * @returns {string} null if valid, else error message
 */
function username(x) {
  if (x.length > 214)               return 'Name length must be less than or equal to 214 characters long';
  if (x.startsWith('.'))            return 'Name may not start with "."';
  if (x.includes("'"))              return 'Name may not contain illegal character';
  if (x !== encodeURIComponent(x))  return 'Name may not contain non-url-safe chars';
  if (x !== x.toLowerCase())        return 'Name must be lowercase';
  return null;
}


/**
 * Validates package name.
 * @param {string} x package name
 * @returns {string} null if valid, else error message
 */
function name(x) {
  if (x.length === 0)               return 'Package name length should be greater than zero';
  if (x.length > 214)               return 'Package name length cannot exceed 214';
  if (x !== x.toLowerCase())        return 'All the characters in the package name must be lowercase';
  if (x !== encodeURIComponent(x))  return 'Package name must not contain any non-url-safe characters';
  if (/^[_\.]/.test(x))             return 'Package name should not start with . or _'; 
  if (x !== x.trim())               return 'Package name should not contain any leading or trailing spaces';
  if (/[~)('!*]/.test(x))           return 'Package name should not contain any of the following characters: ~)(\'!*';
  if (BUILTINS.includes(x))         return 'Package name cannot be the same as a core module nor a reserved/blacklisted name';
  return null;
};


/**
 * Validates package version.
 * @param {string} x package version
 * @returns {string} null if valid, else error message
 */
function version(x) {
  if (!semver.valid(x)) return 'Invalid semver format';
  return null;
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


/**
 * Validates email.
 * @param {string} x email address
 * @returns {string} null if valid, else error message
 */
function email(x) {
  if (!/^.+@.+\..+$/.test(x)) return 'Email must be an email address';
  return null;
}


// Validate something, dont leave to chance!
function validate(fld, val, o) {
  var o = Object.assign({}, OPTIONS, o);
  var fn = FUNCTION.get(fld);
  if(!fn) return error(new Error('cannot validate '+fld), o);
  fn(val, o);
};

// Get options from arguments.
function options(o, k, a, i) {
  if(k==='--help') o.help = true;
  else if(k==='--silent') o.silent = true;
  else if(!o.field) o.field = a[i];
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
  validate(o.field, o.value, o);
};
if(require.main===module) shell(process.argv);
