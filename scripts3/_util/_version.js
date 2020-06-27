'use strict';
const fs = require('fs');
const os = require('os');


// I. global variables
const A = process.argv;
const PWD = process.cwd();
const NOP = () => 0;


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
