Lists config from npmrc files.

```javascript
npm.npmrc.read([opt]);
// opt: options
// .long:    include overridden configs (false)
// .project: read project config (false)
// .global:  read global config (false)
// .projectconfig: path to project npmrc
// .userconfig:    path to user npmrc
// .globalconfig:  path to global npmrc
```

```javascript
const npm = require('extra-npm');

npm.npmrc.read();
// user config

npm.npmrc.read({long: true});
// user config, including overridden

npm.npmrc.read({global: true});
// global config
```
<br>

### reference

- [npmrc Files: npm-config](https://docs.npmjs.com/misc/config#npmrc-files)
- [npmrc](https://docs.npmjs.com/files/npmrc)
