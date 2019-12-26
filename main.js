'use strict';
const semver = require('semver');

// taken from:
// juliangruber/builtins
var builtins = [
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
  'zlib'
];

if (semver.lt(version, '6.0.0')) builtins.push('freelist')
if (semver.gte(version, '1.0.0')) builtins.push('v8')
if (semver.gte(version, '1.1.0')) builtins.push('process')
if (semver.gte(version, '8.1.0')) builtins.push('async_hooks')
if (semver.gte(version, '8.4.0')) builtins.push('http2')
if (semver.gte(version, '8.5.0')) builtins.push('perf_hooks')
