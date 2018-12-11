#!/usr/bin/env bash
# require('./_github.js')

# global variables
cr="\033[0m"
cfby="\033[1;33m"
cm="${cm:-$cfby}"
no="$ENPM_PUSH_NO"
ver="$ENPM_PUSH_VERSION"
pre="$ENPM_PUSH_PREFIX"
msg="$ENPM_PUSH_MESSAGE"
gth="$ENPM_PUSH_GITHUB"
usr="$GITHUB_USERNAME"
pwd="$GITHUB_PASSWORD"
inpm="false"; nver=""

psd() {
  # present script directory
  z="${BASH_SOURCE[0]}"
  if [ -h "$z" ]; then z="$(readlink "$z")"; fi
  cd "$(dirname "$0")" && cd "$(dirname "$z")" && pwd
}

# read arguments
dp0="$(psd)/"
while [[ "$#" != "0" ]]; do
  if [[ "$1" == "--help" ]]; then less "${dp0}push.md" && exit
  elif [[ "$1" == "-n" ]] || [[ "$1" == "--no" ]]; then no="1"
  elif [[ "$1" == "-1" ]] || [[ "$1" == "--patch" ]]; then ver="patch"
  elif [[ "$1" == "-2" ]] || [[ "$1" == "--minor" ]]; then ver="minor"
  elif [[ "$1" == "-3" ]] || [[ "$1" == "--major" ]]; then ver="major"
  elif [[ "$1" == "-v" ]] || [[ "$1" == "--version" ]]; then ver="$2"; shift
  elif [[ "$1" == "-g" ]] || [[ "$1" == "--github" ]]; then gth="1"
  elif [[ "$1" == "-u" ]] || [[ "$1" == "--username" ]]; then usr="$2"; shift
  elif [[ "$1" == "-p" ]] || [[ "$1" == "--password" ]]; then pwd="$2"; shift
  else msg="$1"
  fi
  shift
done

# check npm, git
if [ -f "package.json" ]; then inpm="true"; fi
igit=$(git rev-parse --is-inside-work-tree 2>&1)

# save changes
if [[ "$ver" == "" ]]; then ver="patch"; fi
if [[ "$inpm" == "true" ]]; then nver=$(npm --no-git-tag-version version ${ver}); fi
if [[ "$msg" == "" ]]; then msg="$nver"; fi
if [[ "$pre" != "" ]]; then msg="$pre $msg"; fi
# if [[ "$gth" == "1" ]]; then repurl="$(git config --get remote.origin.url)"; fi
# pver=$(node "${dp0}_version" ${ver} ${repurl})
if [[ "$igit" == "true" ]]; then git add . >/dev/null 2>&1; fi

# publish to npm
if [[ "$inpm" == "true" ]] && [[ "$no" != "1" ]]; then
  printf "${cm}npm publish${cr}\n"
  npm publish
fi

# push to github
if [[ "$igit" == "true" ]]; then
  printf "${cm}git push${cr}\n"
  git commit -m "$msg"
  git push
fi

# replace remote details
if [[ "$inpm" == "true" ]] && [[ "$igit" == "true" ]] && [[ "$gth" == "1" ]]; then
  printf "${cm}github edit${cr}\n"
  rep=$(git config --get remote.origin.url)
  node "${dp0}_github" -r "$rep" -u "$usr" -p "$pwd" -i "package.json" repoedit
fi
