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

// Get function parameter names.
// : helps exclude local identifiers.
function functionParams(ast, set) {
  for(var p of ast.params)
    set.add(paramName(p));
  return set;
};

// Get empty map of window identifiers.
// : first step of getting their locations.
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

// Scan locations of window identifiers.
// : helps rename when necessary.
function bodyScanWindow(ast, map, exc) {
  if(ast==null || typeof ast!=='object') return map;
  if(/Function(Declaration|Expression)/.test(ast.type)) {
    var excn = functionParams(ast, new Set(exc));
    return bodyScanWindow(ast.body, map, excn);
  }
  if(ast.type==='Identifier') {
    if(!map.has(ast.name) || exc.has(ast.name)) return map;
    map.get(ast.name).push(ast); return map;
  }
  for(var k in ast) bodyScanWindow(ast[k], map, exc);
  return map;
};

// Rename a window identifier.
// : help maintain unique globals.
function windowRename(win, frm, to) {
  for(var ast of win.get(frm))
    ast.name = to;
  return win;
};

// Add window identifiers to globals.
// : they are renamed as necessary.
function globalsAdd(glo, win, suf) {
  for(var k of win.keys()) {
    if(!glo.has(k)) glo.add(k);
    else if(!glo.has(k+suf)) {
      windowRename(win, k, k+suf);
      glo.add(k+suf);
    }
    else {
      for(var i=0; glo.has(k+suf+i); i++) {}
      windowRename(win, k, k+suf+i);
      glo.add(k+suf+i);
    }
  }
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
  var map = bodyGetWindow(body, new Map());
  return bodyScanWindow(body, map, new Set());
};

function scriptProcess(sym, ast, add, del=false) {
  var win = scriptScanWindow(ast);
  console.log('win', win);
  var exp = scriptUpdateExports(ast, add);
  exp = exp||scriptUpdateModuleExports(ast, add);
  console.log('exp', exp);
  globalsAdd(sym.globals, win, add);
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
