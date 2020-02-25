Validate Node.js package field.
<br>


## usage

```bash
enpm validate name boolean
# is name "boolean" is valid?
## 1

enpm validate version 0.1.1.exe
# is version "0.1.1.exe" valid?
## error: invalid semver format

enpm validate license hyd-license --silent
# is license "hyd-license" valid?
## -1
```
> With [@extra-npm/validate] try `enpm-validate` instead.

### reference

```bash
enpm validate <field> <value> [options]
# field: package field to validate
## name, version, license, email, username
# value: value of field
# -> 1 if valid for new packages
# -> 0 if valid for old packages
# -> -1 otherwise (error)

# Options:
# --help: view this help
# --silent: enable showing only -1 on error (0)

# Environment variables:
$ENPM_SILENT # enable showing only -1 on error (0)
```
<br>


## similar

Do you need anything similar?
- [enpm-search] can search for NPM packages.
- [enpm-rev-parse] can get local package details.

Suggestions are welcome. Please [create an issue].


[![nodef](https://i.imgur.com/8rbhhqI.jpg)](https://nodef.github.io)
> References: [validate-npm-package-name], [semver], [validate-npm-package-license], [npm-user-validate].

[extra-npm]: https://www.npmjs.com/package/extra-npm

[enpm-search]: https://www.npmjs.com/package/@extra-npm/search
[enpm-rev-parse]: https://www.npmjs.com/package/@extra-npm/rev-parse
[create an issue]: https://github.com/nodef/extra-npm/issues

[validate-npm-package-name]: https://www.npmjs.com/package/validate-npm-package-name
[semver]: https://www.npmjs.com/package/semver
[validate-npm-package-license]: https://www.npmjs.com/package/validate-npm-package-license
[npm-user-validate]: https://www.npmjs.com/package/npm-user-validate
