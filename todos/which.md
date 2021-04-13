Locates a program or locally installed node module executable.

```bash
npm install -g rollup
enpm which rollup
# C:\Users\wolfram77\AppData\Roaming\npm\rollup.CMD (where installed)

npm install rollup
enpm which rollup
# C:\Base\Forge\wikipedia-tts\node_modules\.bin\rollup.CMD (local bin)

enpm which webpack --silent
# -1 (not installed)
```
> With [@extra-npm/which] try `enpm-which` instead.

### reference

```bash
enpm which <command> [options]
# command: name of program / node module
# --> path of program / node module
# --> -1 otherwise (error)

# Options:
# --help: view this help
# --silent: enable showing only -1 on error (0)

# Environment variables:
$ENPM_SILENT # enable showing only -1 on error (0)
```
<br>


### references

- [npm-which: @timoxley](https://www.npmjs.com/package/npm-which)
- [which: Wikipedia](https://en.wikipedia.org/wiki/Which_(Unix))

[![nodef](https://i.imgur.com/8rbhhqI.jpg)](https://nodef.github.io)

[@extra-npm/which]: https://www.npmjs.com/package/@extra-npm/which
