const libnpmsearch = require('libnpmsearch');


async function shell(a) {
  var qry = a.slice(2).join(' ');
  var ans = await libnpmsearch(qry);
  for(var p of ans)
    console.log(p.name);
};
if(require.main===module) shell(process.argv);
