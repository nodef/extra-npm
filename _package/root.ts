const pkgDir = require('pkg-dir');

// Get root directory of package.
function rootPackage(args, o) {
  for(var a=pkgDir.sync(), b=null; a!=null;)
    a = pkgDir.sync(path.dirname(b=a));
  if(!b) return error(new Error('no package.json found'), o);
  console.log(b);
};
