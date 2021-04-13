Overwrites config to npmrc file.

```javascript
npm.npmrc.write(ini, [opt]);
// ini: config to write, in INI format
// opt: options
// .project: write project config (false)
// .global:  write global config (false)
// .projectconfig: path to project npmrc
// .userconfig:    path to user npmrc
// .globalconfig:  path to global npmrc
```

```javascript
const npm = require('extra-npm');

var ini = npm.npmrc.read();
// read user config

ini += 'access=public\n'
npm.npmrc.write(ini);
// write user config (set access=public)

ini = npm.npmrc.read({global: true});
// read global config

ini += 'init-license=MIT\n';
npm.npmrc.write(ini, {global: true});
// write global config (set init-license=MIT)
```
<br>

### reference

- [npmrc Files: npm-config](https://docs.npmjs.com/misc/config#npmrc-files)
- [npmrc](https://docs.npmjs.com/files/npmrc)
