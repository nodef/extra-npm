#!/bin/bash
# global variables
cr="\033[0m"
ci="\033[1m"
cm="\033[2m"

psd() {
  # present script directory
  z="${BASH_SOURCE[0]}"
  if [ -h "$z" ]; then z="$(readlink "$z")"; fi
  cd "$(dirname "$0")" && cd "$(dirname "$z")" && pwd
}

# read arguments
dp0="$(psd)/"
if [[ "$1" == "--help" ]]; then less "${dp0}README.md"; exit
elif [[ "$1" == "init" ]]; then shift; source "${dp0}scripts/init.sh" "$@"
elif [[ "$1" == "push" ]]; then shift; source "${dp0}scripts/push.sh" "$@"
elif [[ "$1" == "clone" ]]; then shift; source "${dp0}scripts/clone.sh" "$@"
elif [[ "$1" == "bundle" ]]; then shift; node "${dp0}scripts/bundle" "$@"
else npm "$@"
fi
