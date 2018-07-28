// 1. process .js -> single .js
// 2. process .js + package.json -> package.json
// 3. process .js + README.md -> README.md
// 4. create package and publish
const recast = require('recast');
const fs = require('fs');



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

// Check if statement is exports.
function statementIsExports(ast) {
  if(ast.type!=='ExpressionStatement') return false;
  if(ast.expression.left.type!=='MemberExpression') return false;
  return ast.expression.left.object.name==='exports';
};

function statementIsModuleExports(ast) {
  if(ast.type!=='ExpressionStatement') return false;
  if(ast.expression.left.type!=='MemberExpression') return false;
  if(ast.expression.left.object.name!=='module') return false;
  return ast.expression.left.property.name==='exports';
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
  if(/Function(Declaration|Expression)/.test(ast.type)) {
    var excn = functionParams(ast, new Set(exc));
    return bodyWindow(ast.body, win, excn);
  }
  if(ast.type==='Identifier') {
    if(!win.has(ast.name) || exc.has(ast.name)) return win;
    win.get(ast.name).push(ast); return win;
  }
  for(var k in ast) bodyWindow(ast[k], win, exc);
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

function scriptUpdateExports(ast, exp) {
  var body = ast.program.body, idx = -1;
  for(var i=0, I=body.length; i<I; i++) {
    var s = body[i];
    if(!statementIsExports(s)) continue;
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
    if(!statementIsModuleExports(s)) continue;
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

function bodyUpdateRequire(exp, astp, astc, paths) {
  if(astc==null || typeof astc!=='object') return exp;
  if(astc.type==='CallExpression' && astc.callee.name==='require') {
    var id = require.resolve(astc.arguments[0].value, {paths}), left = null;
    if(astp.type==='VariableDeclarator') left = astp.id.name;
    else if(astp.type==='AssignmentExpression') left = astp.left.name;
    if(!exp.has(id)) {
      var txt = fs.readFileSync(id, 'utf8');
      var astr = recast.parse(txt);
      
      // load require here
    }
    if(astp.type==='VariableDeclarator') astp.init = exp.get(id);
    else if(astp.type==='AssignmentExpression') astp.right = exp.get(id);
  }
  for(var k in astc) bodyUpdateRequire(exp, astc, astc[k], paths);
  return exp;
};

function scriptScanWindow(ast) {
  var body = ast.program.body;
  var map = bodyEmptyWindow(body, new Map());
  return bodyWindow(body, map, new Set());
};

function scriptProcess(sym, ast, add, del=false) {
  var win = scriptScanWindow(ast);
  console.log('win', win);
  var exp = scriptUpdateExports(ast, add);
  exp = exp||scriptUpdateModuleExports(ast, add);
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
