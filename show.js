const listNpmContents = require('list-npm-contents');
const moduleDependents = require('module-dependents');


// Get contents of package.
async function contents(pkg, o={}) {
  var nam = pkg.replace(/@.*/, '');
  var ver = pkg.includes('@')? pkg.replace(/.*?@/, ''):null;
  try {
    var a = await listNpmContents(nam, ver);
    if(!o.raw) return console.log(a);
    for(var f of a)
      console.log(f);
  }
  catch(e) { console.error(`error: package "${pkg}" not found`); }
};

// Get dependents of package.
function dependents(pkg, o={}) {
  var a = [];
  moduleDependents(pkg).on('error', err => {
    console.error('error:', err);
  }).on('data', p => a.push(p.name)).on('end', () => {
    if(!o.raw) return console.log(a);
    for(var p of a)
      console.log(p);
  });
};

exports.contents = contents;
exports.dependents = dependents;
