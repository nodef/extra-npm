const pkgDir = require('pkg-dir');

// Get path of nearest package.json.
function package(args, o) {
  var a = pkgDir.sync();
  if(!a) return error(new Error('no package.json found'), o);
  console.log(a);
};
