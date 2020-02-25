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
enpm-view <query>... [options]
# query: search query (text / +keyword / =maintainer)

# Options:
# --help:   view this help
# --silent: enable showing only -1 on error (0)
# --json:      enable showing output as JSON (0)
# --parseable: enable showing output as tab separated fields (0)
# --limit:     set search results limit (20)
# --offset:    set search results offset (0)
# --sortby:    set field used to sort
# --ascending: enable ascending order sorting (0)
# --fields:    set fields to show (name,version,description,author)

# Environment variables:
$ENPM_SEARCH_JSON      # enable showing output as JSON (0)
$ENPM_SEARCH_PARSEABLE # enable showing output as tab separated fields (0)
$ENPM_SEARCH_LIMIT     # set search results limit (20)
$ENPM_SEARCH_OFFSET    # set search results offset (0)
$ENPM_SEARCH_SORTBY    # set field used to sort
$ENPM_SEARCH_ASCENDING # enable ascending order sorting (0)
$ENPM_SEARCH_FIELDS    # set fields to show (name,version,description,author)

# Fields:
# name, version, dependencies, ... (package.json)
# scope, stars, contents, readme, dependents
# downloads, downloads.month, downloads.week, downloads.day
# date, date.rel, publisher, maintainers, maintainers.username, maintainers.email
# score, score.quality, score.popularity, score.maintenance
# (all fields can be prefixed with "#" to get its length)
```
<br>


## similar

Do you need anything similar?
- [enpm-validate] can validate package fields.
- [enpm-rev-parse] can get local package details.

Suggestions are welcome. Please [create an issue].


[![nodef](https://i.imgur.com/8rbhhqI.jpg)](https://nodef.github.io)
> References: [npm search].

[extra-npm]: https://www.npmjs.com/package/extra-npm

[enpm-validate]: https://www.npmjs.com/package/@extra-npm/validate
[enpm-rev-parse]: https://www.npmjs.com/package/@extra-npm/rev-parse
[create an issue]: https://github.com/nodef/extra-npm/issues

[npm search]: https://docs.npmjs.com/cli/search.html
