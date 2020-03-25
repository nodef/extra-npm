#!/usr/bin/env node
const cp = require('child_process');
const fs = require('fs');
const path = require('path');


// Gets description from README.
function getDescription() {
  for(var f of fs.readdirSync('.'))
    if(/^README/i.test(f)) break;
  var a = fs.readFileSync(f, 'utf8');
  a = a.replace(/^#.*?\n/, '');
  a = a.replace(/\.[\s\S]*/, '');
  a = a.replace(/\s+|\r?\n/g, ' ').trim();
  return a+'.';
}

// Gets keywords from package name.
function getKeywords(x) {
  return x.replace(/_-/g, ',');
}


// Gets default package.json.
function getPackageDefault() {
  cp.execSync('npm init -y');
  var a = fs.readFileSync('package.json', 'utf8');
  return JSON.parse(a);
}

// Gets actual package.json.
function getPackage(o) {
  var p = getPackageDefault();
  p.name = o.name || p.name;
  p.version = o.version || p.version;
  p.description = o.description || getDescription() || p.description;
  p.keywords = (o.keywords || getKeywords(p.name) || p.keywords.join()).split(',');
  p.author = o.author || p.author;
  p.license = o.license || p.license;
  p.scripts = {test: 'exit'};
  return p;
}


// Writes package.json.
function writePackage(p) {
  var a = JSON.stringify(p, null, 2);
  fs.writeFileSync('package.json', a);
}

// Gets support files.
function writeFiles() {
  var src = path.join(__dirname, 'src');
  for(var f of fs.readdirSync(src)) {
    var g = f.replace(/^_/, '');
    fs.copyFileSync(path.join(src, f), g);
  }
}


/**
 * Initializes an extra-* package.
 * @param {object} o options
 */
function init(o) {
  var p = getPackage(o);
  writePackage(p);
  writeFiles();
}


// Gets options from arguments.
function options(o, k, a, i) {
  if(k==='help') o.help = true;
  else if(k==='-n' || k==='--name') o.name = a[++i];
  else if(k==='-v' || k==='--version') o.version = a[++i];
  else if(k==='-d' || k==='--description') o.description = a[++i];
  else if(k==='-r' || k==='--repository') o.repository = a[++i];
  else if(k==='-k' || k==='--keywords') o.keywords = a[++i];
  else if(k==='-a' || k==='--author') o.author = a[++i];
  else if(k==='-l' || k==='--license') o.license = a[++i];
  return i+1;
}

// Runs on execute.
function main(a) {
  for(var i=2, I=a.length, o={}; i<I;)
    i = options(o, a[i], a, i);
    init(o);
}
if(require.main===module) main(process.argv);
module.exports = init;
