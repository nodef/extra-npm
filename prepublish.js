const tempy = require('tempy');
const cp = require('child_process');
const path = require('path');
const fs = require('fs');


// Global variables.
const STDIO = [0, 1, 2];


// Get requires from code.
function requires(txt) {
  var pkgs = [], re = /require\(\'(.*?)\'\)/g;
  for(var m=null; (m=re.exec(txt))!=null;)
    pkgs.push(m[1]);
  return pkgs;
};

// Run on shell.
function shell() {
  var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  var lic = fs.readFileSync('LICENSE', 'utf8');
  var rdm = fs.readFileSync('scripts/which.md', 'utf8');
  var idx = fs.readFileSync('scripts/which.js', 'utf8');
  pkg.name = '@extra-npm/which';
  pkg.description = rdm.replace(/\r?\n[\s\S]*/, '');
  pkg.bin = {'enpm-which': 'index.js'};
  pkg.scripts = {test: 'exit'};
  pkg.keywords.push('which');
  var req = requires(idx);
  for(var d of Object.keys(pkg.dependencies))
    if(!req.includes(d)) pkg.dependencies = undefined;
  pkg.devDependencies = undefined;
  var dir = tempy.directory();
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2));
  fs.writeFileSync(path.join(dir, 'LICENSE'), lic);
  fs.writeFileSync(path.join(dir, 'README.md'), rdm);
  fs.writeFileSync(path.join(dir, 'index.js'), idx);
  cp.execSync('npm publish', {cwd: dir, stdio: STDIO});
  cp.execSync(`rm -rf ${dir}`, {stdio: STDIO});
};
shell();
