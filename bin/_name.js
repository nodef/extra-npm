const validateNpmPackageName = require('validate-npm-package-name');

const A = process.argv;
var old = false, name='';



// Parse arguments.
for (var i=2, I=A.length; i<I; i++) {
  if (A[i]==='-o' || A[i]==='--old') old = true;
  else name = A[i];
}

// Check the name.
var ans = validateNpmPackageName(name);
if (old) console.log(ans.validForOldPackages);
else console.log(ans.validForNewPackages);
