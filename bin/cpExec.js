const cp = require('child_process');

const stdio = [0, 1, 2];


function cpExec(cmd, o) {
  var o = Object.assign({stdio}, o);
  var a = cp.execSync(cmd.replace(/^\./, ''), o);
  return a;
}
module.exports = cpExec;
