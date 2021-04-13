Gets path to npmrc file (project/user/global/builtin).

```javascript
npm.npmrc.path(typ, [opt]);
// typ: path type (project/user/global/builtin)
// opt: options
// .projectconfig: path to project npmrc
// .userconfig:    path to user npmrc
// .globalconfig:  path to global npmrc
```

```javascript
const npm = require('extra-npm');

npm.npmrc.path('user');
// path to user npmrc

npm.npmrc.path('global');
// path to global npmrc
```
<br>

### reference

- [npmrc Files: npm-config](https://docs.npmjs.com/misc/config#npmrc-files)
- [npmrc](https://docs.npmjs.com/files/npmrc)
