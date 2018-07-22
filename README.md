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
NPM_PUSH_PREFIX=:+1:
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

```bash
it should work
```
