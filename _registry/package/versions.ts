function versions(x: string, pkg: string): string[] {
  return fetch(x, pkg).versions;
}
// https://github.com/gillstrom/npm-package-stars/blob/master/index.js
