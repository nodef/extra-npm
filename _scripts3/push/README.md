**Push** changes to both *Git* and *NPM*.
> Do you want to:<br>
> - Update version in package.json?<br>
> - Publish package to NPM registry?<br>
> - Add all changes to repository index?<br>
> - Create a commit with given message?<br>
> - And, Push package to remote Git repository?
<br>


## usage

```bash
# example package: pg
# current version: 7.0.0

# commit "v7.0.1"
enpm-push --no

# commit "v7.0.1", publish 7.0.1
enpm-push

# commit "patch update", publish 7.0.1
enpm-push "patch update"

# commit "minor update", publish 7.1.0
ENPM_PUSH_NO=0
enpm-push "minor update" -v minor

# commit ":+1: major update", publish 8.0.0
ENPM_PUSH_NO=0
ENPM_PUSH_PREFIX=:+1:
enpm-push "major update" -3
```
> With [extra-npm] try `enpm push` instead.

### reference

```bash
$ enpm-push [options] [message]
# message: commit message (version)

# Options:
# --help:   show this help
# -n, --no: no publish to npm
# -v, --version: update version (patch)
# -1, --patch:   update patch version
# -2, --minor:   update minor version
# -3, --major:   update major version
# -g, --github:  update github details
# -u, --username: github username
# -p, --password: github password

# Environment variables:
# ENPM_PUSH_NO: no publish to npm (0/1)
# ENPM_PUSH_VERSION: update which version (patch/minor/major/pre...)
# ENPM_PUSH_PREFIX:  commit message prefix
# ENPM_PUSH_MESSAGE: commit message
# ENPM_PUSH_GITHUB:  update github details (0/1)
# GITHUB_USERNAME: github username
# GITHUB_PASSWORD: github password
```
<br>


[![extra-npm](https://i.imgur.com/8rbhhqI.jpg)](https://www.npmjs.com/package/extra-npm)
> References: [git push], [npm publish].

[extra-npm]: https://www.npmjs.com/package/extra-npm
[git push]: https://git-scm.com/docs/git-push
[npm publish]: https://docs.npmjs.com/cli/publish
