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

This is an extension of [npm] with some commonly used commands. You can
install this with `npm install -g extra-npm`.

> Stability: Experimental.

<br>

```bash
$ enpm [command] [options]
# all existing commands of npm supported

# push change to git, npm
$ enpm push "commit message"

# clone all versions of "package" to local
$ enpm clone -a package

# install "package"
$ enpm install package
```

## References

- [clone]> Clone NPM package to local or GitHub.
- [init]> Initialize Node.js reporitory.
- [push]> Push changes to both Git and NPM?
- [rev-parse]> Pick out and massage parameters.
- [search]> Search for packages.
- [validate]> Validate Node.js package field.
- [view]> View registry info about a package.
- [which]> Locate a program or locally installed node module executable.
<br>


## similar

Do you need anything similar?
- [extra-youtubeuploader] can upload videos with caption to YouTube.
- [extra-stillvideo] can generate video from audio and image.

Suggestions are welcome. Please [create an issue].
<br>


[![nodef](https://i.imgur.com/8rbhhqI.jpg)](https://nodef.github.io)

[init]: https://www.npmjs.com/package/@extra-npm/init
[push]: https://www.npmjs.com/package/@extra-npm/push
[clone]: https://www.npmjs.com/package/@extra-npm/clone
[rev-parse]: https://www.npmjs.com/package/@extra-npm/rev-parse
[search]: https://www.npmjs.com/package/@extra-npm/search
[validate]: https://www.npmjs.com/package/@extra-npm/validate
[view]: https://www.npmjs.com/package/@extra-npm/view
[which]: https://www.npmjs.com/package/@extra-npm/which

[extra-youtubeuploader]: https://www.npmjs.com/package/extra-youtubeuploader
[extra-stillvideo]: https://www.npmjs.com/package/extra-stillvideo
[create an issue]: https://github.com/nodef/extra-npm/issues
