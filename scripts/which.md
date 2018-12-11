Locate a program or locally installed node module executable.
<br>


## usage

```bash
npm install -g extra-googletts
enpm-which googletts
# get path of globally installed "googletts"
## C:\Users\wolfram77\AppData\Roaming\npm\googletts.CMD

npm install extra-stillvideo
enpm-which stillvideo
# get path of locally installed "stillvideo"
## C:\Base\Forge\wikipedia-tts\node_modules\.bin\stillvideo.CMD

enpm-which youtubeuploader --silent
# "youtubeuploader" isn't installed locally or globally
## -1
```
> With [extra-npm] try `enpm which` instead.

### reference

```bash
enpm-which <command> [options]
# command: name of program / node module

# Options:
# --help: view this help
# --silent: enable showing only -1 on error (0)

# Environment variables:
$ENPM_WHICH_COMMAND # set name of program / node module
$ENPM_WHICH_SILENT  # enable showing only -1 on error (0)
```
<br>


## similar

Do you need anything similar?
- [enpm-validate] can validate package fields.
- [enpm-rev-parse] can get local package details.

Suggestions are welcome. Please [create an issue].


[![nodef](https://i.imgur.com/8rbhhqI.jpg)](https://nodef.github.io)
> References: [npm-which], [which].

[extra-npm]: https://www.npmjs.com/package/extra-npm

[enpm-validate]: https://www.npmjs.com/package/@extra-npm/validate
[enpm-rev-parse]: https://www.npmjs.com/package/@extra-npm/rev-parse
[create an issue]: https://github.com/nodef/extra-npm/issues

[npm-which]: https://www.npmjs.com/package/npm-which
[which]: https://en.wikipedia.org/wiki/Which_(Unix)
