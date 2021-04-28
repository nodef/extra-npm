#!/usr/bin/env bash
## Common utility commands for Git repositories.
dir="$(dirname "$(readlink -f "$0")")"

cmd="$dir/bin/$1"
if   [[ "$2" == "--help" ]]; then "$dir/bin/help.sh" "$1"
elif [[ "$1" == "--help" ]]; then "$dir/bin/help.sh"
elif [ -f "$cmd.sh" ]; then shift; "$cmd.sh" "$@"
elif [ -f "$cmd.js" ]; then shift; "$cmd.js" "$@"
else npm "$@"; fi
