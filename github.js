const GitHub = require('@octokit/rest');
const promptly = require('promptly');


// I. global variables
const E = process.env;
const A = process.argv;
var github = new GitHub();
var username = E['GITHUB_USERNAME'];
var password = E['GITHUB_PASSWORD'];
var action = E['GITHUB_ACTION'];
var target = E['GITHUB_TARGET'];
var homepage = E['GITHUB_HOMEPAGE'];
var description = E['GITHUB_DESCRIPTION'];
var ready = Promise.resolve();


function authenticate() {
  // 1. authenticate user
  var r = Promise.resolve();
  if(!username) r = r.then(() => promptly.prompt('GitHub username: ')).then((v) => username = v);
  if(!password) r = r.then(() => promptly.prompt('GitHub password: ', {silent: true})).then((v) => password = v); 
  return r = r.then(() => github.authenticate({type: 'basic', username, password}));
};

function repoExists(owner, repo) {
  // 1. check if a repository exists
  return github.repos.get({owner, repo}).then(() => true, () => false);
};

function repoCreate(org, name) {
  // 1. create a repository (user/organization)
  return (org===username? github.repos.create:github.repos.createForOrg)({org, name, homepage, description});
};


// II. parse arguments
for(var i=2, I=A.length; i<I; i++) {
  if(A[i]==='-t' || A[i]==='--target')  target = A[++i];
  else if(A[i]==='-u' || A[i]==='--username') username = A[++i];
  else if(A[i]==='-p' || A[i]==='--password') password = A[++i];
  else if(A[i]==='-h' || A[i]==='--homepage') homepage = A[++i];
  else if(A[i]==='-d' || A[i]==='--description') description = A[++i];
  else action = A[i];
}


// II. perform action
ready = ready.then(() => {
  var p = target.replace(/^((git|https?):\/\/)?(github.com\/)?/, '').split('/');
  var owner = p[0], repo = p[1];
  action = action.toLocaleLowerCase();
  if(action==='createrepo') return repoExists(owner, repo).then((exists) => {
    if(!exists) return authenticate().then(() => repoCreate(owner, repo));
  });
}).catch((e) => console.error(e));
