const execute = require('./execute_from_npm');
const validate = require('./validate');
const fs = require('fs');

const OPTIONS = {};

// Gets package name of create-* initializer.
function getCreate(x) {
  if(x[0]!=='@') return 'create-'+x;
  var i = x.indexOf('/');
  if(i<0) return x+'/create';
  return x.substring(0, i)+'/create-'+x.substring(i+1);
}

// Use an initializer.
async function initWith(initer, args=[], opt=null) {
  var create = getCreate(initer);
  var e = validate.name(create);
  if(e) throw new Error('Bad initializer '+initer+': '+e);
  return execute(create, args, opt);
}

// Gets init options.
function getInit() {

}

async function initDefault(val=null, opt=null) {
  val = Object.assign({}, VALUES, getInit(), val);
  // generate some default keywords
  return fs.promises.writeFile('package.json', jsonStringify(val));
}

function init(opt) {
  {call-init}
  {init-options}
  {cwd}
}
// update bin
// update keywords
// update version
