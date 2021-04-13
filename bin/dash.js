const util = require('util');
const kleur = require('kleur');




function fixup(m) {
  m = m||'';
  m = typeof m !== 'string'? util.inspect(m) : m;
  return m.replace(/^\w+:/, m => kleur.bold(m));
}


function error(m, o={}) {
  if (!o.silent) console.error(kleur.red(fixup(m)));
  else console.error(-1);
}

function warn(m, o={}) {
  if (!o.silent) console.warn(kleur.yellow(fixup(m)));
}

function log(m, o={}) {
  if (!o.silent) console.log(kleur.cyan(fixup(m)));
}

function info(m, o={}) {
  if (!o.silent) console.log(kleur.grey(fixup(m)));
}
module.exports = {error, warn, log, info};
