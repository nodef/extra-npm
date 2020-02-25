'use strict';
const fs = require('fs');
const os = require('os');


// I. global variables
const A = process.argv;
const PWD = process.cwd();
const NOP = () => 0;


// Update version with given type.
function versionUpdate(ver, typ) {
  var s = ver.split('.'), n = [];
  for(var i=0, I=s.length; i<I; i++)
    n[i] = parseInt(s[i], 10);
  if(typ==='patch') n[2]++;
  else if(typ==='minor') { n[1]++; n[2] = 0; }
  else if(typ==='major') { n[0]++; n[1] = n[2] = 0; }
  return n.join('.');
};

// Update repository URL.
function repoUpdate(z, url) {
  if(!url) return z;
  url = url.endsWith('.git')? url.substring(0, url.length-4):url;
  url = url.startsWith('git+')? url.substring(4):url;
  url = url.startsWith('git://')? 'https://'+url.substring(6):url;
  z['repository'] = {
    type: 'git',
    url: `git+${url}.git`
  };
  z['bugs'] = {
    url: `${url}/issues`
  };
  z['homepage'] = `${url}#readme`;
  return z;
};

// Stringify JSON.
function jsonStringify(jsn) {
  return JSON.stringify(jsn, null, 2).replace(/\n/g, os.EOL)+os.EOL;
};

// Promisify fs.readFile().
const readFile = (pth) => new Promise((fres, frej) => {
fs.readFile(pth, {encoding: 'utf8'}, (err, data) => err? frej(err):fres(data));
});

// Promisify fs.writeFile().
const writeFile = (pth, data) => new Promise((fres, frej) => {
  fs.writeFile(pth, data, (err) => err? frej(err):fres());
});


// II. main
// 1. read package.json, update version in memory
var out = '', version = A[2]||'patch', repository = A[3]||'';
var pRead = readFile(`${PWD}/package.json`).then((data) => {
  var p = JSON.parse(data);
  p.version = out = versionUpdate(p.version, version);
  return repoUpdate(p, repository);
});
var w = version==='check'? pRead:null;
// 2. write updated to package.json
var pWrite = w||pRead.then((p) => writeFile(`${PWD}/package.json`, jsonStringify(p)));
// 3. read package-lock.json, update version in memory
var plRead = w||readFile(`${PWD}/package-lock.json`).then((data) => {
  var pl = JSON.parse(data);
  return pRead.then((p) => (pl.version = p.version) && pl);
});
// 4. write updated to package-lock.json
var plWrite = w||plRead.then((pl) => writeFile(`${PWD}/package-lock.json`, jsonStringify(pl)), NOP);
// 5. log new verion to stdout
pRead.then(() => console.log('v'+out));
