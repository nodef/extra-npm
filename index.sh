#!/bin/bash
# global variables
cr="\033[0m"
cm="\033[1;33m"

psd() {
  # present script directory
  z="${BASH_SOURCE[0]}"
  if [ -h "$z" ]; then z="$(readlink "$z")"; fi
  cd "$(dirname "$0")" && cd "$(dirname "$z")" && pwd
}

# read arguments
dp0="$(psd)/"
if [[ "$1" == "push" ]]; then shift && source "${dp0}scripts/push.sh" "$@"
else npm "$@"
fi
