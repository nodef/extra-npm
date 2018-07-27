// 1. process .js -> single .js
// 2. process .js + package.json -> package.json
// 3. process .js + README.md -> README.md
// 4. create package and publish
const recast = require('recast');
const fs = require('fs');


function functionGetParams(ast, set) {
  for(var p in ast.params) {
    if(p.type==='Identifier') set.add(p.name);
    else if(p.type==='RestElement') set.add(p.argument.name);
    else if(p.type==='AssignmentPattern') set.add(p.left.name);
  }
  return set;
};
function bodyGetWindow(ast, map) {
  for(var s of ast) {
    if(s.type==='FunctionDeclaration') map.set(s.id.name, []);
    else if(s.type==='VariableDeclaration') {
      for(var d of s.declarations)
        map.set(d.id.name, []);
    }
  }
  return map;
};
function bodyScanWindow(ast, map, exc) {
  if(ast==null || typeof ast!=='object') return map;
  if(/Function(Declaration|Expression)/.test(ast.type)) {
    var excn = functionGetParams(ast, new Set(exc));
    return bodyScanWindow(ast.body, map, excn);
  }
  if(ast.type==='Identifier') {
    if(!map.has(ast.name) || exc.has(ast.name)) return map;
    map.get(ast.name).push(ast); return map;
  }
  for(var k in ast) bodyScanWindow(ast[k], map, exc);
  return map;
};
function astScanWindow(ast) {
  var body = ast.program.body;
  var map = bodyGetWindow(body, new Map());
  return bodyScanWindow(body, map, new Set());
};

function windowRename(win, frm, to) {
  for(var ast of win.get(frm))
    ast.name = to;
  return win;
};
function globalsRename(glo, win, add) {
  for(var [k, v] of win) {
    if(!glo.has(k)) { glo.add(k); continue; }
    else if(!glo.has(k+add)) {
      windowRename(win, k, k+add);
      glo.add(k+add); continue;
    }
    for(var i=0; glo.has(k+add+i); i++) {}
    windowRename(win, k, k+add,+i);
    glo.add(k+add+i);
  }
  return glo;
};

function isIdentifierUnique(sym, val) {
  return sym.window.has(val);
};

function addIdentifier(sym, val) {
  sym.window.add(val);
};

function newIdentifier(sym, pre='exports') {
  return pre+(sym.identifiers.size());
};

function addModuleExports(sym, mod, val) {
  var id = sym.exports.size();
  sym.exports.set(mod, {id, value: val});
};

function doModuleExports(mod, ast, sym, del=false) {
  var body = ast.program.body, idx = -1;
  for(var i=0, I=body.length; i<I; i++) {
    var s = body[i];
    if(s.type!=='ExpressionStatement') continue;
    if(s.expression.left.type!=='MemberExpression') continue;
    if(s.expression.left.object.name!=='module') continue;
    if(s.expression.left.property.name!=='exports') continue;
    idx = i;
  }
  if(idx<0) return false;
  if(s.expression.right.type==='Identifier') {
    var name = s.expression.right.name;
    if(!isIdentifierUnique(sym, name)) name = renameIdentifier(name, ast, sym);
    addModuleExports(sym, mod, name);
    if(del) body.splice(idx, 1);
  }
  else {
    var name = newIdentifier(sym);
    addModuleExports(sym, mod, name);
    var bodyg = recast.parse(`const ${name} = 0;`).program.body;
    bodyg[0].declarations[0].init = s.expression.right;
    body[idx] = bodyg[0];
  }
  return true;
};

// I. global variables
const A = process.argv;


var src = fs.readFileSync(A[2]);
var ast = recast.parse(src);
var body = ast.program.body;

for(var i=0, I=0; i<I; i++) {
  var s = body[i];
  if(s.type!=='ExpressionStatement') continue;
  if(s.expression.left.type!=='MemberExpression') continue;
  if(s.expression.left.object.name!=='module') continue;
  if(s.expression.left.property.name!=='exports') continue;
  body.splice(i, 1);
}
var mod = recast.print(ast).code;
console.log(astScanWindow(ast));


