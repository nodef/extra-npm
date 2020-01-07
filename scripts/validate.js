#!/usr/bin/env node
const semver = require('semver');
const kleur = require('kleur');
const cp = require('child_process');
require('extra-boolean');

// Global variables.
const E = process.env;
const OPTIONS = {
  help: false,
  field: null,
  value: null,
  silent: Boolean.parse(E['ENPM_SILENT']||'0')
};
const FUNCTION = new Map([
  ['name', name],
  ['version', version],
  ['license', license],
  ['email', email],
  ['username', username],
]);
const BUILTINS = [
  'assert',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'https',
  'module',
  'net',
  'os',
  'path',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'tls',
  'tty',
  'url',
  'util',
  'vm',
  'zlib',
  'freelist',
  'v8',
  'process',
  'async_hooks',
  'http2',
  'perf_hooks',
];
const STDIO = [0, 1, 2];


// CONSOLE
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
  var fn = FUNCTION.get(fld);
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


// JAVASCRIPT
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

/**
 * Validates package license.
 * @param {string} x package license id
 * @returns {string} null if valid, else error message
 */
function license(x) {
  return null; // TODO: after this millenium
};


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
exports.name = name;
exports.version = version;
exports.license = license;
exports.username = username;
exports.email = email;
if(require.main===module) main(process.argv);
