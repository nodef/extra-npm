// 1. process .js -> single .js
// 2. process .js + package.json -> package.json
// 3. process .js + README.md -> README.md
// 4. create package and publish
const recast = require('recast');
const fs = require('fs');


function functionGetParams(ast, set) {
  for(var p of ast.params) {
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
function scriptScanWindow(ast) {
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
function scriptUpdateExports(ast, exp) {
  var body = ast.program.body, idx = -1;
  for(var i=0, I=body.length; i<I; i++) {
    var s = body[i];
    if(s.type!=='ExpressionStatement') continue;
    if(s.expression.left.type!=='MemberExpression') continue;
    if(s.expression.left.object.name!=='exports') continue;
    s.expression.left.object.name = exp;
    if(idx<0) idx = i;
  }
  if(idx<0) return null;
  var astn = recast.parse(`\nconst ${exp} = {};`);
  body.splice(idx, 0, astn.program.body[0]);
  return exp;
};
function scriptUpdateModuleExports(ast, exp) {
  var body = ast.program.body, idx = -1, right = null;
  for(var i=0, I=body.length; i<I; i++) {
    var s = body[i];
    if(s.type!=='ExpressionStatement') continue;
    if(s.expression.left.type!=='MemberExpression') continue;
    if(s.expression.left.object.name!=='module') continue;
    if(s.expression.left.property.name!=='exports') continue;
    right = s.expression.right; I--;
    body.splice(idx=i--, 1);
  }
  if(right==null) return null;
  if(right.type==='Identifier') return right.name;
  var astn = recast.parse(`\nconst ${exp} = 0;`);
  astn.program.body[0].declarations[0].init = right;
  body.splice(idx, 0, astn.program.body[0]);
  return exp;
};

function scriptProcess(sym, ast, add, del=false) {
  var win = scriptScanWindow(ast);
  console.log('win', win);
  var exp = scriptUpdateExports(ast, add);
  exp = exp||scriptUpdateModuleExports(ast, add);
  console.log('exp', exp);
  globalsRename(sym.globals, win, add);
  sym.exports.set(add, exp);
  return sym;
};


// I. global variables
const A = process.argv;

var sym = {globals: new Set(), exports: new Map()};
var src = fs.readFileSync(A[2]);
var ast = recast.parse(src);
scriptProcess(sym, ast, '_test_module');
var mod = recast.print(ast).code;
console.log(mod);
