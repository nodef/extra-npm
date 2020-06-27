const view = require('./view');
const GitHub = require('extra-github');

const github = GitHub({auth: ''});



// Gets full repository URL from partial.
function repoUrl(x, usr='') {
  if(/^git:\/\/|^https?:\/\/|/.test(x)) return x;
  if(/^github\.com/.test(x)) return 'https://'+x;
  if(x.includes('/')) return 'https://github.com/'+x;
  return `https://github.com/${usr}/`+x;
}

function pkgDetails(pkg) {
  var x =  await view(pkg);
  if(/github\.com/.test(x.homepage)) x.homepage = 'https://www.npmjs.com/package/'+x;
}

function fetchPkg(pkg) {
  var tmp = tempDir();
  npmPack(pkg, {cwd: tmp});
  //   tgz=$(ls *.tgz)
  //   tar -xvzf "$tgz"
}

// movePkg() {
//   # move temp-dir/package to packagedir
//   rm -rf "$2/"*
//   shopt -s dotglob nullglob
//   mv "$1/package/"* "$2/".
//   shopt -u dotglob nullglob
//   rm -rf "$1"
// }

// gitPush() {
//   # push packagedir with message
//   git add .
//   git commit -m "$2"
//   git push
// }
