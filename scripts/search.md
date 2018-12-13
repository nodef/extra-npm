Search for packages.
> Do you want to:
- List all search results?
- List special fields like `#dependents`?
- Sort packages by `downloads`?
<br>


## usage

```bash
enpm-search javascript parser
# search for "javascript parser"

enpm-search +javascript +parser
# search for keywords "javascript", "parser"

enpm-search =ariya
# search for maintainer "ariya"

enpm-search parser --sortby downloads
## search for "parser" with highest downloads last month

enpm-search parser --sortby downloads.day
## search for "parser" with highest downloads last day

enpm-search parser --sortby "#dependencies"
## search for "parser" with highest number of dependencies

enpm-search parser --sortby "#dependents" --ascending
## search for "parser" with lowest number of dependents

enpm-search parser --sortby "#maintainers" --ascending
## search for "parser" with lowest number of maintainers

enpm-search parser --fields "name,version,#maintainers"
## search for "parser" showing name, version, and number of maintainers
```
> With [extra-npm] try `enpm search` instead.

### reference

```bash
enpm-view <package> [field]... [options]
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
