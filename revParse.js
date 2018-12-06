const pkgDir = require('pkg-dir');
const path = require('path');


// Get path of nearest package.json.
function package() {
  var a = pkgDir.sync();
  if(a!=null) return console.log(a);
  console.error('error: no package.json found');
};

// Get root directory of package.
function topPackage() {
  for(var a=pkgDir.sync(), b=null; a!=null;)
    a = pkgDir.sync(path.dirname(b=a));
  if(b!=null) return console.log(b);
  console.error('error: no package.json found');
};

exports.package = package;
exports.topPackage = topPackage;
