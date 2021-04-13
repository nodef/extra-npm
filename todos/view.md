Views registry info about a package.

```bash
enpm view esprima
# get basic info about "esprima"
## ...

enpm view esprima version
# get latest version of "esprima"
## 4.0.1

enpm view esprima author license
# get author and license of "esprima"
## author = 'Ariya Hidayat <ariya.hidayat@gmail.com>'
## license = 'BSD-2-Clause'

enpm view esprima stars
# get stars of "esprima"
## 73

enpm view esprima contents
# get contents of "esprima"
## package.json
## ChangeLog
## LICENSE.BSD
## README.md
## bin\esparse.js
## bin\esvalidate.js
## dist\esprima.js

enpm view esprima "#dependents"
# get number of dependents of "esprima"
## 1379
```
> With [@extra-npm/view] try `enpm-view` instead.

### reference

```bash
enpm view <package> [field]... [options]
# package: name of the package
# field: package field to view
## fields in package.json (name, version, dependencies, ...)
## scope, stars, contents, readme, dependents
## available, downloads, downloads.month, downloads.week, downloads.day
## date, date.rel, publisher, maintainers, maintainers.username, maintainers.email
## score, score.quality, score.popularity, score.maintenance
# -> value of package field(s)
# -> empty if not available

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
> References: [npm view].

[extra-npm]: https://www.npmjs.com/package/extra-npm

[enpm-search]: https://www.npmjs.com/package/@extra-npm/search
[enpm-rev-parse]: https://www.npmjs.com/package/@extra-npm/rev-parse
[create an issue]: https://github.com/nodef/extra-npm/issues

[npm view]: https://docs.npmjs.com/cli/view.html
