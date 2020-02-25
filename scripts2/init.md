**Initialize** Node.js *repository*.
> Do you want it:
> - Created on GitHub?
> - Cloned to local directory?
> - And, Populated with LICENSE and README.md?
<br>


## usage

```bash
enpm-init --repository
# initialize package.json in current directory

enpm-init --version 0.1.0 --author "Po Po <pp@baking.com> (https://pp.github.io)" -r
# initialize with some prespecified options

enpm-init --yes -v 0.1.0 -a pp@baking.com --username pp --password **** -r https://github.com/pp/paper
# initialize with given options and defaults (include github credentials)

GITHUB_USERNAME=pp
GITHUB_PASSWORD=****
enpm-init --yes -v 0.1.0 -a pp@baking.com -r pp/paper
# initialize with given options and defaults (dont ask)
```
> With [extra-npm] try `enpm init` instead.

### reference

```bash
enpm-init [options]
# --help:    show this help 
# -y, --yes: accept defaults
# -n, --name:          package name
# -v, --version:       start version (0.0.0)
# -d, --description:   package description
# -m, --main:          main script path (index.js)
# -st, --scripts_test: test script (exit)
# -r, --repository: repository path ([https://github.com/]user/repo)
# -k, --keywords:   comma separated keywords
# -a, --author:     author name <email> (url)
# -l, --license:    license type (mit)
# -u, --username: github username
# -p, --password: github password

# Environment variables:
# ENPM_INIT_YES: accept defaults (0/1)
# ENPM_INIT_NAME:         package name
# ENPM_INIT_VERSION:      start version (0.0.0)
# ENPM_INIT_DESCRIPTION:  package description
# ENPM_INIT_MAIN:         main script path (index.js)
# ENPM_INIT_SCRIPTS_TEST: test script (exit)
# ENPM_INIT_REPOSITORY: repository path ([https://github.com/]user/repo)
# ENPM_INIT_KEYWORDS:   comma separated keywords
# ENPM_INIT_AUTHOR:     author name <email> (url)
# ENPM_INIT_LICENSE:    license type (mit)
# GITHUB_USERNAME: github username
# GITHUB_PASSWORD: github password
```
<br>


[![nodef](https://i.imgur.com/8rbhhqI.jpg)](https://nodef.github.io)
> References: [npm init].

[extra-npm]: https://www.npmjs.com/package/extra-npm
[npm init]: https://docs.npmjs.com/cli/init
