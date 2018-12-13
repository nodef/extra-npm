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
dp0="$(psd)/"; sp0="${dp0}scripts/"
if [[ "$1" == "--help" ]]; then less "${dp0}README.md"; exit
elif [[ "$1" == "clone" ]]; then shift; source "${sp0}clone.sh" "$@"
elif [[ "$1" == "init" ]]; then shift; source "${sp0}init.sh" "$@"
elif [[ "$1" == "push" ]]; then shift; source "${sp0}push.sh" "$@"
elif [[ "$1" == "rev-parse" ]]; then shift; node "${sp0}rev-parse.js" "$@"
elif [[ "$1" == "s" ]] || [[ "$1" == "se" ]] || [[ "$1" == "search" ]] || [[ "$1" == "find" ]]; then shift; node "${sp0}search.js" "$@"
elif [[ "$1" == "up" ]] || [[ "$1" == "update" ]] || [[ "$1" == "upgrade" ]]; then shift; ncu "$@"
elif [[ "$1" == "validate" ]]; then shift; node "${sp0}validate.js" "$@"
elif [[ "$1" == "v" ]] || [[ "$1" == "view" ]] || [[ "$1" == "info" ]] || [[ "$1" == "show" ]]; then shift; node "${sp0}view.js" "$@"
elif [[ "$1" == "which" ]]; then shift; node "${sp0}which.js" "$@"
else npm "$@"
fi
