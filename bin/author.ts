function author(x: any): string {
  if(typeof x.author==='string') return x;
  var a = x.name? `${x.name}` : '';
  a += x.email? ` <${x.email}>` : '';
  a += x.url? ` (${x.url})` : '';
  return a;
}
export default author;
