function stars(x: string, pkg: string): string[] {
  return fetch(x, pkg).users;
}
// https://github.com/gillstrom/npm-package-stars/blob/master/index.js
