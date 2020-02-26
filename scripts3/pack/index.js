function tarballUrl(nam, ver) {
  if(!isOrg(nam)) return `https://registry.npmjs.org/${nam}/-/${nam}-${ver}.tgz`;
  var sub = nam.substring(nam.indexOf('/')+1);
  return `https://registry.npmjs.org/${nam}/-/${sub}-${ver}.tgz`;
}

function pack(pkg, opt) {
  // download
  // tar pack if not remote
}
