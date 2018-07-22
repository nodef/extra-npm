**Prograde Node Package Manager (NPM)** built for *professionals* and *enthusiasts*.
- [Push](#feet-push): push changes to both git and npm.
- [Clone](#feet-clone): clone package to local or github.

```bash
> enpm [command] [options]
# all existing commands of npm supported

# push change to git, npm
enpm push -p "commit message"

# clone all versions of "package" to local
enpm clone -a package

# install "package"
enpm install package
```

<br>
<hr>
<br>

### :feet: Push

**Push** changes to both *git* and *npm*.

```bash
# say:
# package=pg@7.0.0

# commit "v7.0.1"
enpm push

# commit "v7.0.1", publish 7.0.1
enpm push -p

# commit "patch update", publish 7.0.1
enpm push -p "patch update"

# commit ":+1: major update", publish 8.0.0
ENPM_PUSH_PREFIX=:+1:
enpm push -v major -p "major update"
```

```bash
> enpm push [flags] [message]
# [-p|--publish]: publish to npm
# [-v|--version]: update version (default: patch)
# [message]: commit message (default: package version)
# [--help]: show this help

# [environment variables]
# ENPM_PUSH_PUBLISH: publish to npm (0/1)
# ENPM_PUSH_VERSION: update which version (patch/minor/major/pre...)
# ENPM_PUSH_PREFIX: commit message prefix
# ENPM_PUSH_MESSAGE: commit message
```

<br>
<hr>
<br>

### :feet: Clone

**Clone** package to *local* or *github*.

```bash
# clone "natural@latest" to "natural" 
enpm clone natural
 
# clone "long@3.2.0" to "long@3.2" 
enpm clone long@3.2
 
# clone all versions of "long" to local
enpm clone long -a
 
# update repo "pkg0" with "long@latest"
enpm clone long -t https://github.com/user/pkg0
 
# create new repo "pkg1" with "long@latest"
enpm clone long -t user/pkg1 -u user -p **** -d "description"
 
# create new repo "pkg2" with all versions of "long"
ENPM_CLONE_PREFIX=":+1:"
enpm clone long -a -t user/pkg2 -u user -p **** -d "description"
```

```bash
enpm clone <package@version> [flags]
# <package@version>: name of package, optionally with @version 
# [-u|--username]: github username for authentication 
# [-p|--password]: github password for authentication 
# [-h|--homepage]: homepage to set if new repository created 
# [-d|--description]: description to set if new repository created 
# [-t|--target]: target github repository path 
# [-m|--message]: message for commit to repository 
# [-a|--all]: use all versions of package instead of just one 
# [--help]: show help  

# [environment variables] 
# GITHUB_USERNAME: github username for authentication 
# GITHUB_PASSWORD: github password for authentication 
# GITHUB_HOMEPAGE: homepage to set if new repository created 
# GITHUB_DESCRIPTION: description to set if new repository created 
# ENPM_CLONE_TARGET: target github repository path 
# ENPM_CLONE_PACKAGE: name of package, optionally with @version 
# ENPM_CLONE_PREFIX: optional message prefix for all commits 
# ENPM_CLONE_MESSAGE: message for all commits 
# ENPM_CLONE_ALL: use all versions of package instead of just one (0/1) 
```
