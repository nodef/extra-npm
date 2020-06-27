function from(o: any=null): any {
  var o = o||{};
  return {
    name: o.name||'package',
    version: o.version||'0.0.0',
    description: o.description||'',
    main: o.main||'index.js',
    scripts: o.scripts||{test: 'exit'},
    keywords: [],
    author: {},
    license: o.license||'ISC',
  };
}
export default from;
