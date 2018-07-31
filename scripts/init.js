const OctoKit = require('@octokit/rest');
const promptly = require('promptly');


// I. global variables
const E = process.env;
const A = process.argv;
var octokit = new OctoKit();
var action = '', repository = '', owner = '', repo = '';
var input = '', description = '', homepage = '', topics = '';
var auto_init = '', gitignore_template = '', license_template = '';
var username = E['GITHUB_USERNAME'], password = E['GITHUB_PASSWORD'];
var headers = {accept: 'application/vnd.github.mercy-preview+json'};
var ready = Promise.resolve();


async function authenticate() {
  if(!username) username = await promptly.prompt('GitHub username: ');
  if(!password) password = await promptly.prompt('GitHub password: ', {silent: true});
  return octokit.authenticate({type: 'basic', username, password});
};

function repoExists() {
  return octokit.repos.get({owner, repo}).then(() => true, () => false);
};

async function repoCreate() {
  auto_init = auto_init==='1' || auto_init==='true'? true:false;
  if(owner===username) await octokit.repos.create({name: repo, description, homepage, auto_init, gitignore_template, license_template});
  else await octokit.repos.createForOrg({org: owner, name: repo, description, homepage, auto_init, gitignore_template, license_template});
  return topics!=null? octokit.repos.replaceTopics({owner, repo, names: topics.split(/[,\s]+/g), headers}):null;
};

function repoEdit() {
  var rdy = [octokit.repos.edit({owner, repo, name: repo, description, homepage})];
  if(topics!=null) rdy.push(octokit.repos.replaceTopics({owner, repo, names: topics.split(/[,\s]+/g), headers}));
  return Promise.all(rdy);
};

// II. parse arguments
for(var i=2, I=A.length; i<I; i++) {
  if(A[i]==='-r' || A[i]==='--repository')  repository = A[++i];
  else if(A[i]==='-u' || A[i]==='--username') username = A[++i];
  else if(A[i]==='-p' || A[i]==='--password') password = A[++i];
  else if(A[i]==='-i' || A[i]==='--input') input = A[++i];
  else if(A[i]==='-d' || A[i]==='--description') description = A[++i];
  else if(A[i]==='-h' || A[i]==='--homepage') homepage = A[++i];
  else if(A[i]==='-t' || A[i]==='--topics') topics = A[++i];
  else if(A[i]==='-ai' || A[i]==='--auto_init') auto_init = A[++i];
  else if(A[i]==='-gt' || A[i]==='--gitignore_template') gitignore_template = A[++i];
  else if(A[i]==='-lt' || A[i]==='--license_template') license_template = A[++i];
  else action = A[i];
}

// III. read input
if(input) {
  var f = require(input);
  description = f.description||description;
  homepage = f.homepage||homepage;
  topics = f.keywords.join()||topics;
}

// IV. perform action
ready = ready.then(() => {
  var p = repository.replace(/^((git|https?):\/\/)?(github.com\/)?/, '').split('/');
  if(p.length!==2) return console.error('bad repository: '+repository);
  owner = p[0]; repo = (p[1]||'').replace(/.git$/, '');
  return repoExists().then(e => {
    if(!e) return authenticate().then(repoCreate);
    else return authenticate().then(repoEdit);
  });
}).catch((e) => console.error(e));
