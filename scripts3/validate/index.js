const BUILTINS = require('../BUILTINS');
const semver = require('semver');



/**
 * Validates full package name.
 * @param {string} x full package name (with version)
 * @returns {string} null if valid, else error message
 */
function full(x) {
  var nam = x.replace(/(.)@.*/, '$1');
  var ver = x.substring(nam.length+1);
  return name(nam)||(ver? version(ver):null);
}

/**
 * Validates package name.
 * @param {string} x package name
 * @returns {string} null if valid, else error message
 */
function name(x) {
  if(!x.startsWith('@')) return _name(x);
  var i = x.indexOf('/');
  var org = x.substring(1, i);
  var nam = x.substring(i+1);
  return _name(org) || _name(nam);
}
function _name(x) {
  if (x.length === 0)               return 'Package name length should be greater than zero';
  if (x.length > 214)               return 'Package name length cannot exceed 214';
  if (x !== x.toLowerCase())        return 'All the characters in the package name must be lowercase';
  if (x !== encodeURIComponent(x))  return 'Package name must not contain any non-url-safe characters';
  if (/^[_\.]/.test(x))             return 'Package name should not start with . or _'; 
  if (x !== x.trim())               return 'Package name should not contain any leading or trailing spaces';
  if (/[~)('!*]/.test(x))           return 'Package name should not contain any of the following characters: ~)(\'!*';
  if (BUILTINS.includes(x))         return 'Package name cannot be the same as a core module nor a reserved/blacklisted name';
  return null;
}

/**
 * Validates package version.
 * @param {string} x package version
 * @returns {string} null if valid, else error message
 */
function version(x) {
  if (!semver.valid(x)) return 'Invalid semver format';
  return null;
}

/**
 * Validates package license.
 * @param {string} x package license id
 * @returns {string} null if valid, else error message
 */
function license(x) {
  return null; // TODO: after this millenium
}


/**
 * Validates username.
 * @param {string} x username
 * @returns {string} null if valid, else error message
 */
function username(x) {
  if(x.length > 214)               return 'Name length must be less than or equal to 214 characters long';
  if(x.startsWith('.'))            return 'Name may not start with "."';
  if(x.includes("'"))              return 'Name may not contain illegal character';
  if(x !== encodeURIComponent(x))  return 'Name may not contain non-url-safe chars';
  if(x !== x.toLowerCase())        return 'Name must be lowercase';
  return null;
}

/**
 * Validates email.
 * @param {string} x email address
 * @returns {string} null if valid, else error message
 */
function email(x) {
  if (!/^.+@.+\..+$/.test(x)) return 'Email must be an email address';
  return null;
}
exports.full = full;
exports.name = name;
exports.version = version;
exports.license = license;
exports.username = username;
exports.email = email;
