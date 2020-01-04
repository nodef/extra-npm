#!/usr/bin/env node
const npmWhich = require('npm-which');
const kleur = require('kleur');
const cp = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
require('extra-boolean');


// Global variables.
const E = process.env;
const PATH = E['PATH']||'';
const PATHEXT = (E['PATHEXT']||'').toLowerCase();
const WIN32 = os.platform()==='win32';
const PATHSEP = WIN32? ';':':';
const OPTIONS = {
  help: false,
  cwd: null,
  command: null,
  silent: Boolean.parse(E['ENPM_SILENT']||'0')
};
const STDIO = [0, 1, 2];


// Log error message.
function error(err, o) {
  if(o.silent) console.log(-1);
  else console.error(kleur.red('error:'), err.message);
};

// Get path of local bin.
// function which(cmd, o) {
//   var o = Object.assign({}, OPTIONS, o);
//   var cwd = o.cwd||process.cwd();
//   npmWhich(cwd)(cmd, (err, pth) => {
//     if(err) return error(err, o);
//     console.log(pth);
//   });
// };

function _package(dir, fn) {
  dir = dir.startsWith('/')? dir:path.resolve(dir);
  var pkg = path.join(dir, 'package.json');
  fs.access(pkg, err => {
    if(!err) return fn(dir);
    if(path.isAbsolute(dir)) return fn(null);
    _package(path.dirname(dir), fn);
  });
}


function which(prog) {
  return new Promise((fres, frej) => whichOs(prog, fres));
}

function whichNode() {

}

function whichOs(prog, fn) {
  var map = new Map();
  var ps = PATH.split(PATHSEP);
  for(var i=0, j=0, I=ps.length; i<I; i++) {
    whichDir(prog, ps[i], map, err => {
      if(++j>=I) fn(map.values());
    });
  }
}



function whichDir(prog, dir, map, fn) {
  var isExe = WIN32? isExeWin32:isExeNix;
  fs.readdir(dir, {withFileTypes: true}, (err, files) => {
    if(err) return fn(err);
    for(var f of files) {
      if(!f.isFile()) continue;
      var base = path.basename(f.name);
      var p = path.join(dir, f.name);
      var p0 = map.get(base)||null;
      if(!prog.test(base)) continue;
      if(isExe(p, p0)) map.set(base, p);
    }
    fn(null);
  });
}
function isExeWin32(p1, p0) {
  var i0 = PATHEXT.indexOf(path.extname(p0||'f.zzz').toLowerCase());
  var i1 = PATHEXT.indexOf(path.extname(p1).toLowerCase());
  return i1>=0 && (i0<0 || i1<i0);
}
function isExeNix(p1) {
  return path.extname(p1)==='';
}

// Get options from arguments.
function options(o, k, a, i) {
  if(k==='--help') o.help = true;
  else if(k==='--silent') o.silent = true;
  else o.command = a[i];
  return i+1;
};

which.options = options;
module.exports = which;

// Run on shell.
function shell(a) {
  var o = {};
  for(var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  if(o.help) return cp.execSync('less which.md', {cwd: __dirname, stdio: STDIO});
  which(o.command, o);
};
if(require.main===module) shell(process.argv);
