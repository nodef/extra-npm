Pick out and massage parameters.
> Do you want to:
> - Get nearest package path?
> - Get root package path?

<br>
<br>

## console

```bash
enpm-rev-parse --package
# get nearest package path

enpm-rev-parse --root-package
# get root package path
```
> With [extra-npm] try `enpm rev-parse` instead.

### reference

```bash
enpm-rev-parse <parameter> [args] [options]
# parameter: name of parameter to get
## --package, --root-package
# args: arguments for parameter
# -> value of parameter
# -> -1 otherwise (error)

# Options:
# --help: view this help
# --silent: enable showing only -1 on error (0)

# Environment variables:
$ENPM_SILENT # enable showing only -1 on error (0)
```
<br>
<br>

## javascript

```javascript
const revParse = require('@extra-npm/rev-parse');
// revParse.package([dir]): nearest package path (promise)
// revParse.rootPackage([dir]): root package path (promise)

process.cwd();
// cd D:\Documents\extra-npm\node_modules\kleur

await revParse.package();
// D:\Documents\extra-npm\node_modules\kleur

await revParse.rootPackage();
// D:\Documents\extra-npm
```
<br>
<br>

## similar

Do you need anything similar?
- [enpm-search] can search for NPM packages.
- [enpm-validate] can validate package fields.

Suggestions are welcome. Please [create an issue].


[![nodef](https://i.imgur.com/8rbhhqI.jpg)](https://nodef.github.io)
> References: [pkg-dir].

[extra-npm]: https://www.npmjs.com/package/extra-npm

[enpm-search]: https://www.npmjs.com/package/@extra-npm/search
[enpm-validate]: https://www.npmjs.com/package/@extra-npm/validate
[create an issue]: https://github.com/nodef/extra-npm/issues

[pkg-dir]: https://www.npmjs.com/package/pkg-dir
