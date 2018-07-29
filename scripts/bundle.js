// 1. process .js -> single .js
// 2. process .js + package.json -> package.json
// 3. process .js + README.md -> README.md
// 4. create package and publish
const recast = require('recast');
const fs = require('fs');



// Get last value in array.
function last(arr, i=1) {
  return arr[arr.length-i];
};

// Remove value from array.
function remove(arr, val) {
  var i = arr.indexOf(val);
  if(i>=0) arr.splice(i, 1);
  return arr;
};

// Remove values at all indexes.
function removeAtAll(arr, idx) {
  for(var i=idx.length-1; i>=0; i--)
    arr.splice(idx[i], 1);
  return arr;
};

// Get key of value in object.
function keyOf(obj, val) {
  for(var k in obj)
    if(obj[k]===val) return k;
  return null;
};

// Check if node is function.
function nodeIsFunction(ast) {
  return /Function(Declaration|Expression)/.test(ast.type);
};

// Check if node is assignment.
function nodeIsAssignment(ast) {
  if(ast.type==='VariableDeclarator') return true;
  return ast.type==='AssignmentExpression';
};

// Check if node is require().
function nodeIsRequire(ast) {
  if(ast.type!=='CallExpression') return false;
  return ast.callee.name==='require';
};

// Check if node is exports.
function nodeIsExports(ast) {
  if(ast.type!=='ExpressionStatement') return false;
  if(ast.expression.left.type!=='MemberExpression') return false;
  return ast.expression.left.object.name==='exports';
};

// Check if node is module.exports.
function nodeIsModuleExports(ast) {
  if(ast.type!=='ExpressionStatement') return false;
  if(ast.expression.left.type!=='MemberExpression') return false;
  if(ast.expression.left.object.name!=='module') return false;
  return ast.expression.left.property.name==='exports';
};

// Get assignment name.
function assignmentName(ast) {
  if(ast.type==='VariableDeclarator') return ast.id.name;
  else if(ast.type==='AssignmentExpression') return ast.left.name;
  return null;
};

// Get function parameter name.
function paramName(ast) {
  if(ast.type==='Identifier') return ast.name;
  else if(ast.type==='RestElement') return ast.argument.name;
  else if(ast.type==='AssignmentPattern') return ast.left.name;
  return null;
};

// Get function parameter names.
function functionParams(ast, set=new Set()) {
  for(var p of ast.params)
    set.add(paramName(p));
  return set;
};

// Get variable declaration names.
function variableDeclarationNames(ast, set=new Set()) {
  for(var d of ast.declarations)
    set.add(d.id.name);
  return set;
};

// Get declaration names.
function declarationNames(ast, set=new Set()) {
  if(ast.type==='FunctionDeclaration') set.set(ast.id.name);
  else if(ast.type==='VariableDeclaration') variableDeclarationNames(ast, set);
  return set;
};

// Get global identifier names.
function bodyGlobals(ast, set=new Set()) {
  for(var s of ast)
    declarationNames(s, set);
  return set;
};

// Get empty window identifier map.
function bodyEmptyWindow(ast, win=new Map()) {
  for(var nam of bodyGlobals(ast))
    win.set(nam, []);
  return win;
};

// Get (scanned) window identifier map.
function bodyWindow(ast, win=bodyEmptyWindow(ast), exc=new Set()) {
  if(ast==null || typeof ast!=='object') return win;
  if(nodeIsFunction(ast)) {
    var excn = functionParams(ast, new Set(exc));
    return bodyWindow(ast.body, win, excn);
  }
  if(ast.type==='Identifier') {
    if(!win.has(ast.name) || exc.has(ast.name)) return win;
    win.get(ast.name).push(ast); return win;
  }
  for(var k in ast)
    bodyWindow(ast[k], win, exc);
  return win;
};

// Rename a window identifier.
function windowRename(win, nam, to) {
  for(var ast of win.get(nam))
    ast.name = to;
  return win;
};

// Add window identifier to globals.
function globalsAdd(glo, win, nam, suf) {
  if(!glo.has(nam)) return glo.add(nam);
  if(!glo.has(nam+suf)) {
    windowRename(win, nam, nam+suf);
    return glo.add(nam+suf);
  }
  for(var i=0; glo.has(nam+suf+i); i++) {}
  windowRename(win, nam, nam+suf+i);
  return glo.add(nam+suf+i);
};

// Add all window identifiers to globals.
function globalsAddAll(glo, win, suf) {
  for(var nam of win.keys())
    globalsAdd(glo, win, nam, suf);
  return glo;
};

// Update exports to given name.
function bodyUpdateExports(ast, nam) {
  for(var i=ast.length-1, idx=-1; i>=0; i--) {
    if(!nodeIsExports(ast[i])) continue;
    ast[idx=i].expression.left.object.name = nam;
  }
  if(idx<0) return null;
  var astn = recast.parse(`\nconst ${nam} = {};`);
  ast.splice(idx, 0, astn.program.body[0]);
  return nam;
};

// Update module.exports to given name, if possible.
function bodyUpdateModuleExports(ast, nam) {
  for(var i=ast.length-1, idx=-1, rgt=null; i>=0; i--) {
    if(!nodeIsModuleExports(ast[i])) continue;
    if(idx>=0) ast.splice(idx, 1);
    rgt = ast[idx=i].expression.right;
  }
  if(idx<0) return null;
  if(rgt.type==='Identifier') return rgt.name;
  var astn = recast.parse(`\nconst ${nam} = 0;`);
  astn.program.body[0].declarations[0].init = rgt;
  ast.splice(idx, 0, astn.program.body[0]);
  return nam;
};

// Update require() using module load function.
function bodyUpdateRequire(ast, astp, paths, fn) {
  if(ast==null || typeof ast!=='object') return ast;
  if(!nodeIsRequire(ast)) {
    astp.push(ast);
    for(var k in ast)
      bodyUpdateRequire(ast[k], astp, paths, fn);
    return astp.pop();
  }
  var id = require.resolve(ast.arguments[0].value, {paths});
  var nam = fn(id), ast1 = last(astp);
  if(!nodeIsAssignment(ast1) || assignmentName(ast1)!==nam) {
    var astr = recast.parse(`const a = ${right};`);
    ast1[keyOf(ast1, ast)] = astr.program.body[0].declarations[0].init;
    return ast;
  }
  var ast2 = last(astp, 2), ast3 = last(astp, 3);
  if(ast1.type==='VariableDeclarator') {
    if(ast2.length>1) remove(ast2, ast1);
    else remove(last(astp, 4), ast3);
  }
  else if(ast1.type==='AssignmentExpression') remove(ast3, ast2);
  return ast;
};

function scriptProcess(sym, ast, add, del=false) {
  var win = scriptScanWindow(ast);
  console.log('win', win);
  var exp = bodyUpdateExports(ast, add);
  exp = exp||bodyUpdateModuleExports(ast, add);
  console.log('exp', exp);
  globalsAddAll(sym.globals, win, add);
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
console.log(require.resolve('./divisors', {paths: [process.cwd()]}));
