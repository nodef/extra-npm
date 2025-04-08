Common utility commands for [npm] packages.<br>
:package: [NPM](https://www.npmjs.com/package/extra-npm),
:smiley_cat: [GitHub](https://github.com/orgs/nodef/packages?repo_name=extra-npm),
:scroll: [Files](https://unpkg.com/extra-npm/),
:blue_book: [Wiki](https://github.com/nodef/extra-npm/wiki/).

Do you want to?<br>
- Clone NPM package to local or GitHub?
- Initialize Node.js reporitory on GitHub?
- Push changes to both Git and NPM?
- Get root package path?
- Search for packages, with special fields?
- Validate Node.js package fields?
- View registry info about a package?
- Locate a program or locally installed node module executable?

This is an extension of [npm] with some commonly used commands. Some
improvements are still needed here. You can install this with
`npm install -g extra-npm`.

> Stability: Experimental.

<br>

```bash
enpm [command] [options]
# all existing commands of npm supported

# push change to git, npm
$ enpm push "commit message"

# clone all versions of "package" to local
$ enpm clone -a package

# install "package"
$ enpm install package
```

<br>
<br>


## Index

| Command         | Action                       |
| --------------- | ---------------------------- |
| [clone] | Clones NPM package to local or remote. |
| [help] | Prints usage details of a command. |
| [init] | Initializes a Node.js repository. |
| [push] | Pushes changes to both Git and NPM. |
| [rev-parse] | Picks out and massages parameters. |
| [search] | Searches for packages. |
| [validate] | Validates Node.js package field. |
| [view] | Views registry info about a package. |
| [which] | Locates a program or locally installed node module executable. |

<br>
<br>


## References

- [Get path of current script when executed through a symlink](https://unix.stackexchange.com/a/17500/166668)

<br>
<br>

[![](https://img.youtube.com/vi/d0PkB45Hda4/maxresdefault.jpg)](https://www.youtube.com/watch?v=d0PkB45Hda4)
![](https://ga-beacon.deno.dev/G-RC63DPBH3P:SH3Eq-NoQ9mwgYeHWxu7cw/github.com/nodef/extra-npm)

[npm]: https://en.wikipedia.org/wiki/Npm_(software)
[clone]: https://github.com/nodef/extra-npm/wiki/clone
[help]: https://github.com/nodef/extra-npm/wiki/help
[init]: https://github.com/nodef/extra-npm/wiki/init
[push]: https://github.com/nodef/extra-npm/wiki/push
[rev-parse]: https://github.com/nodef/extra-npm/wiki/rev-parse
[search]: https://github.com/nodef/extra-npm/wiki/search
[validate]: https://github.com/nodef/extra-npm/wiki/validate
[view]: https://github.com/nodef/extra-npm/wiki/view
[which]: https://github.com/nodef/extra-npm/wiki/which
