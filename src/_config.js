'use strict';
const ini = require('ini');
const path = require('path');
const cp = require('child_process');
const fs = require('fs');
const os = require('os');

const E = process.env;
var PBUILTIN = null;
var PGLOBAL = null;
var PUSER = null;
var CBUILTIN = null;
var CGLOBAL = null;
var CUSER = null;
var ready = false;



// https://github.com/sindresorhus/global-dirs/blob/master/index.js
function npmPath() {
  var ep = process.execPath;
  // Windows: `C:\Program Files\nodejs\node_modules\npm\npmrc`
  if(process.platform==='win32') {
    var dir = path.dirname(ep);
    return path.join(dir, 'node_modules', 'npm');
  }
	// Homebrew special case: `$(brew --prefix)/lib/node_modules/npm/npmrc`
	else if(ep.includes('/Cellar/node')) {
		var dir = ep.slice(0, ep.indexOf('/Cellar/node'));
		return path.join(dir, 'lib', 'node_modules', 'npm');
	}
	else {
    var nodeDir = path.dirname(ep);
    var npmPath = cp.execSync('readlink -f '+path.join(nodeDir, 'npm'), {encoding: 'utf8'});
    return path.dirname(path.dirname(npmPath.replace(/[\s\n]+$/g, '')));
  }
}

// https://github.com/sindresorhus/global-dirs/blob/master/index.js
function readRc(p) {
	try {
		return ini.parse(fs.readFileSync(p, 'utf8'));
	} catch (_) {}
}

function writeRc(p, dat) {
	try {
		return fs.writeFileSync(p, ini.stringify(dat));
	} catch (_) {}
}

// https://docs.npmjs.com/misc/config#npmrc-files
function setup() {
  PBUILTIN = path.join(npmPath(), 'npmrc');
  PGLOBAL = E.NPM_CONFIG_GLOBALCONFIG||path.join(E.PREFIX, 'etc', 'npmrc');
  PUSER = E.NPM_CONFIG_USERCONFIG||path.join(os.homedir(), '.npmrc');
  CBUILTIN = readRc(PBUILTIN);
  CGLOBAL = readRc(PGLOBAL);
  CUSER = readRc(PUSER);
  ready = true;
}

/**
 * Lists npmrc config.
 * @param {object?} opt options (globalconfig, userconfig)
 */
function list(opt=null) {
  if(!ready) setup();
  var o = Object.assign({
    globalconfig: PGLOBAL,
    userconfig: PUSER
  }, opt);
  var cglobal = o.globalconfig===PGLOBAL? CGLOBAL : readRc(o.globalconfig);
  var cuser = o.userconfig===PUSER? CUSER : readRc(o.userconfig);
  return Object.assign({}, CBUILTIN, cglobal, cuser);
}

/**
 * Modifies npmrc config.
 * @param {object} cfg new config values
 * @param {object?} opt options (userconfig)
 */
function edit(cfg, opt=null) {
  if(!ready) setup();
  var o = Object.assign({
    userconfig: PUSER
  }, opt);
  var cuser = o.userconfig===PUSER? CUSER : readRc(o.userconfig);
  writeRc(o.userconfig, Object.assign(cuser, cfg));
}


function envPrefix() {
  return E['NPM_CONFIG_PREFIX']||E['npm_config_prefix']||null;
};

function defaultPrefix() {
  var ep = process.execPath;
  // `c:\node\node.exe` → `prefix=c:\node\`
  if (ISWIN) return path.dirname(ep);
	// `/usr/local/bin/node` → `prefix=/usr/local`
	return path.dirname(path.dirname(ep));
}

/**
 * Gets prefix path.
 */
function prefix() {
	var p = envPrefix();
	if(p) return p;
	p = list().prefix;
  if(p) return p;
  p = E.PREFIX;
  if(p) return p;
  p = defaultPrefix();
	return p;
};

/**
 * Gets packages path.
 */
function packages() {
  var p = prefix();
  return ISWIN? path.join(p, 'node_modules') : path.join(p, 'lib', 'node_modules');
}

/**
 * Gets binaries path.
 */
function binaries() {
  var p = prefix();
  return ISWIN? p : path.join(p, 'bin');
}
exports.list = list;
exports.edit = edit;
exports.prefix = prefix;
exports.packages = packages;
exports.binaries = binaries;
