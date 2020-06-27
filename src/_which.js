const revParse = require('./rev-parse.js');
const fs = require('extra-fs');
const path = require('path');



// TODO: include global dirs
/**
 * Locates executable path of programs, including in node_modules.
 * @param {string|RegExp|function} prog program name to look for
 * @param {object?} opt options {cwd, platform}
 */
function which(prog, opt=null) {
  var o = Object.assign({cwd: process.cwd()}, opt);
  o.paths = [o.cwd, ..._bins(o.cwd), ...PATHS];
  return fs.which(prog, o);
}
async function _bins(dir) {
  var ans = [];
  while(true) {
    var pkg = await revParse.package(dir);
    if(!pkg) return ans;
    ans.push(path.join(pkg, 'node_modules', '.bin'));
    dir = path.dirname(dir);
  }
}
module.exports = which;
