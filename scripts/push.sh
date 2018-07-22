#!/bin/bash
# global variables
pub="$ENPM_PUSH_PUBLISH"
ver="$ENPM_PUSH_VERSION"
pre="$ENPM_PUSH_PREFIX"
msg="$ENPM_PUSH_MESSAGE"

# read arguments
while [[ "$#" != "0" ]]; do
  if [[ "$1" == "--help" ]]; then less "${dp0}README.md" && exit
  elif [[ "$1" == "-p" ]] || [[ "$1" == "--publish" ]]; then pub="1"
  elif [[ "$1" == "-v" ]] || [[ "$1" == "--version" ]]; then ver="$2" && shift
  else msg="$1"
  fi
  shift
done

# save changes
if [[ "$ver" == "" ]]; then ver="patch"; fi
if [[ "$msg" == "" ]]; then msg="$nver"; fi
if [[ "$pre" != "" ]]; then msg="$pre $msg"; fi
nver=$(npm --no-git-tag-version version ${ver})
igit=$(git rev-parse --is-inside-work-tree 2>&1)
if [[ "$igit" == "true" ]]; then git add . >/dev/null 2>&1; fi

# publish to npm
printf "${cm}npm publish${cr}\n"
if [[ "$pub" == "1" ]]; then npm publish; fi

# push to github
if [[ "$igit" == "true" ]]; then
  printf "${cm}git push${cr}\n"
  git commit -m "$msg"
  git push
fi
