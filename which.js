const npmWhich = require('npm-which');


// Command line interface.
function shell(a) {
  npmWhich(process.cwd())(a[2]||'', (err, pth) => {
    if(err) return console.error('error:', err.message);
    console.log(pth);
  });
};
if(require.main===module) shell(process.argv);
