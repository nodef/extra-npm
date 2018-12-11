**Clone** *NPM* package to *local* or *remote*.
> Do you want to:<br>
> - Clone specific version of NPM package?<br>
> - Clone all versions of NPM package?<br>
> - Or, Clone entire NPM package to GitHub repository?
<br>


## setup

```bash
# install enpm 
npm install -g extra-npm
 
# install only enpm-clone 
npm install -g @extra-npm/clone
```
<br>


## usage

```bash
enpm-clone natural
# "natural@latest" cloned to "natural"

enpm-clone long@3.2
# "long@3.2.0" cloned to "long@3.2"

enpm-clone long --all
# "long@1.0.0" cloned to "long@1.0.0"
# "long@1.0.1" cloned to "long@1.0.1"
# ... (all versions of long)

enpm-clone long --repository https://github.com/myusername/npmpackage1
# existing repository "npmpackage1" cloned to "npmpackage1"
# "long@latest" cloned to "npmpackage1"
# change is pushed back to remote repository

enpm-clone long -r myusername/npmpackage2 --username myusername --password **** --description "test"
# new repository "npmpackage2" created (using authentication)
# repository "npmpackage2" cloned to "npmpackage2"
# "long@latest" cloned to "npmpackage2"
# change is pushed back to remote repository

ENPM_CLONE_PREFIX=":+1:"
enpm-clone mynpmpackage -a -r myusername/npmpackage3 -u myusername -p **** -d "test all"
# new repository "npmpackage3" created (using authentication)
# repository "npmpackage3" cloned to "npmpackage3"
# "long@1.0.0" cloned to "npmpackage3"
# change ":+1: v1.0.0" is pushed back to remote repository
# "long@1.0.1" cloned to "npmpackage3"
# change ":+1: v1.0.1" is pushed back to remote repository
# ... (all versions of long)
```

### reference

```bash
enpm-clone [options] <package@version>
# package@version: name of package, optionally with version

# Options:
# --help:    show this help 
# -a, --all: use all versions of package
# -m, --message:     commit message
# -r, --repository:  target github repository
# -d, --description: description for repository
# -h, --homepage:    homepage for repository
# -k, --keywords:    keywords for repository
# -ai, --auto_init:  auto initialize repository
# -gt, --gitignore_template: gitignore template for repository
# -lt, --license_template:   license template for repository
# -u, --username: github username
# -p, --password: github password

# Environment variables:
# ENPM_CLONE_PACKAGE: name of package, optionally with version
# ENPM_CLONE_ALL:     use all versions of package (0/1)
# ENPM_CLONE_PREFIX:      commit message prefix
# ENPM_CLONE_MESSAGE:     commit message
# ENPM_CLONE_TARGET:      target github repository
# ENPM_CLONE_DESCRIPTION: description for repository
# ENPM_CLONE_HOMEPAGE:    homepage for repository
# ENPM_CLONE_KEYWORDS:    keywords for repository
# ENPM_CLONE_AUTO_INIT:   auto initialize repository (0/1)
# ENPM_CLONE_GITIGNORE_TEMPLATE: gitignore template for repository
# ENPM_CLONE_LICENSE_TEMPLATE:   license template for repository
# GITHUB_USERNAME: github username
# GITHUB_PASSWORD: github password
```
<br>


[![extra-npm](https://i.imgur.com/8rbhhqI.jpg)](https://www.npmjs.com/package/extra-npm)
