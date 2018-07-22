const GitHub = require('@octokit/rest');
const promptly = require('promptly');


// I. global variables
const E = process.env;
const A = process.argv;
var github = new GitHub();
var username = E['GITHUB_USERNAME'];
var password = E['GITHUB_PASSWORD'];
var action = E['GITHUB_ACTION']||'';
var target = E['GITHUB_TARGET']||'';
var owner = E['GITHUB_OWNER']||'';
var repo = E['GITHUB_REPO']||'';
var description = E['GITHUB_DESCRIPTION'];
var homepage = E['GITHUB_HOMEPAGE'];
var topics = E['GITHUB_TOPICS'];
var auto_init = E['GITHUB_AUTO_INIT'];
var gitignore_template = E['GITHUB_GITIGNORE_TEMPLATE'];
var license_template = E['GITHUB_LICENSE_TEMPLATE'];
var ready = Promise.resolve();


function authenticate() {
  var r = Promise.resolve();
  if(!username) r = r.then(() => promptly.prompt('GitHub username: ')).then((v) => username = v);
  if(!password) r = r.then(() => promptly.prompt('GitHub password: ', {silent: true})).then((v) => password = v); 
  return r = r.then(() => github.authenticate({type: 'basic', username, password}));
};

function repoExists() {
  return github.repos.get({owner, repo}).then(() => true, () => false);
};

function repoCreate() {
  var rdy = [];
  auto_init = auto_init==='1'? true:false;
  if(owner===username) rdy.push(github.repos.create({name: repo, description, homepage, auto_init, gitignore_template, license_template}));
  else rdy.push(github.repos.createForOrg({org: owner, name: repo, description, homepage, auto_init, gitignore_template, license_template}));
  if(topics!=null) rdy.push(github.repos.replaceTopics({owner, repo, names: topics.split(/[,\s]+/g)}));
  return Promise.all(rdy);
};

function repoEdit() {
  var rdy = [github.repos.edit({owner, repo, name: repo, description, homepage})];
  if(topics!=null) rdy.push(github.repos.replaceTopics({owner, repo, names: topics.split(/[,\s]+/g)}));
  return Promise.all(rdy);
};

// II. parse arguments
for(var i=2, I=A.length; i<I; i++) {
  if(A[i]==='-t' || A[i]==='--target')  target = A[++i];
  else if(A[i]==='-u' || A[i]==='--username') username = A[++i];
  else if(A[i]==='-p' || A[i]==='--password') password = A[++i];
  else if(A[i]==='-o' || A[i]==='--owner') owner = A[++i];
  else if(A[i]==='-r' || A[i]==='--repo') repo = A[++i];
  else if(A[i]==='-h' || A[i]==='--homepage') homepage = A[++i];
  else if(A[i]==='-d' || A[i]==='--description') description = A[++i];
  else if(A[i]==='-a' || A[i]==='--auto_init') auto_init = A[++i];
  else if(A[i]==='-g' || A[i]==='--gitignore_template') gitignore_template = A[++i];
  else if(A[i]==='-l' || A[i]==='--license_template') license_template = A[++i];
  else action = A[i];
}


// II. perform action
ready = ready.then(() => {
  action = action.toLocaleLowerCase();
  var p = target.replace(/^((git|https?):\/\/)?(github.com\/)?/, '').split('/');
  if(p.length!==2 && (!owner || !repo)) return null;
  var owner = owner||p[0], repo = (repo||p[1]||'').replace(/.git$/, '');
  if(action==='repocreate') return repoExists().then((exists) => {
    if(!exists) return authenticate().then(repoCreate);
    else return authenticate().then(repoEdit);
  });
}).catch((e) => console.error(e));
