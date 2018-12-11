Validate Node.js package field.
<br>


## usage

```bash
enpm-validate name boolean
# is name "boolean" is valid?
## 1

enpm-validate version 0.1.1.exe
# is version "0.1.1.exe" valid?
## error: invalid semver format

enpm-validate license hyd-license --silent
# is license "hyd-license" valid?
## -1
```
> With [extra-npm] try `enpm validate` instead.

### reference

```bash
enpm-validate <field> [options]
# command: package field to validate
## name, version, license, email, username
# -> 1 if valid for new packages
# -> 0 if valid for old packages
# -> -1 otherwise (error)

# Options:
# --help: view this help
# --silent: enable showing only -1 on error (0)

# Environment variables:
$ENPM_WHICH_COMMAND # set name of program / node module
$ENPM_SILENT        # enable showing only -1 on error (0)
```
<br>


## similar

Do you need anything similar?
- [enpm-validate] can validate package fields.
- [enpm-rev-parse] can get local package details.

Suggestions are welcome. Please [create an issue].


[![nodef](https://i.imgur.com/8rbhhqI.jpg)](https://nodef.github.io)
> References: [npm-which], [which].

[extra-npm]: https://www.npmjs.com/package/extra-npm

[enpm-validate]: https://www.npmjs.com/package/@extra-npm/validate
[enpm-rev-parse]: https://www.npmjs.com/package/@extra-npm/rev-parse
[create an issue]: https://github.com/nodef/extra-npm/issues

[npm-which]: https://www.npmjs.com/package/npm-which
[which]: https://en.wikipedia.org/wiki/Which_(Unix)
