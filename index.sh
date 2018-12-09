#!/bin/bash
# global variables
cr="\033[0m"
#ci="\033[1m"
#cm="\033[2m"

psd() {
  # present script directory
  z="${BASH_SOURCE[0]}"
  if [ -h "$z" ]; then z="$(readlink "$z")"; fi
  cd "$(dirname "$0")" && cd "$(dirname "$z")" && pwd
}

# read arguments
dp0="$(psd)/"; sp0="${dp0}node_modules/@extra-npm/"
if [[ "$1" == "--help" ]]; then less "${dp0}README.md"; exit
elif [[ "$1" == "init" ]]; then shift; source "${sp0}init/index.sh" "$@"
elif [[ "$1" == "push" ]]; then shift; source "${dp0}push.sh" "$@"
elif [[ "$1" == "clone" ]]; then shift; source "${sp0}clone/index.sh" "$@"
elif [[ "$1" == "bundle" ]]; then shift; node "${sp0}bundle" "$@"
elif [[ "$1" == "update" ]]; then shift; ncu "$@"
elif [[ "$1" == "which" ]]; then shift; node "${dp0}which" "$@"
elif [[ "$1" == "v" ]] || [[ "$1" == "view" ]] || [[ "$1" == "info" ]] || [[ "$1" == "show" ]]; then shift; node "${dp0}view" "$@"
else npm "$@"
fi
