#!/bin/bash
# global variables
cr="\033[0m"
cfb="\033[1m"
cfd="\033[2m"
ci="${ci:-$cfb}"
cm="${cm:-$cfd}"
yes="${ENPM_INIT_YES}"
name="${ENPM_INIT_NAME:-${PWD##*/}}"
version="${ENPM_INIT_VERSION:-0.0.0}"
description="${ENPM_INIT_DESCRIPTION}"
main="${ENPM_INIT_MAIN:-index.js}"
scripts_test="${ENPM_INIT_SCRIPTS_TEST:-exit}"
repository="${ENPM_INIT_REPOSITORY}"
keywords="${ENPM_INIT_KEYWORDS}"
author="${ENPM_INIT_AUTHOR}"
license="${ENPM_INIT_LICENSE:-MIT}"
author_name=""; author_email=""; author_url=""
usr="${GITHUB_USERNAME}"
pwd="${GITHUB_PASSWORD}"
trap 'printf "${cr}\n"; exit' SIGINT


psd() {
  # present script directory
  z="${BASH_SOURCE[0]}"
  if [ -h "$z" ]; then z="$(readlink "$z")"; fi
  cd "$(dirname "$0")" && cd "$(dirname "$z")" && pwd
}

# split author -> author_name, author_email, author_url
splitAuthor() {
  if [[ "$author" != "" ]]; then author_name=${author%%[<\(]*}; fi
  if [[ "$author" == *"<"* ]]; then author_email=${author##*<}; author_email=${author_email%%>*}; fi
  if [[ "$author" == *"("* ]]; then author_url=${author##*(}; author_url=${author_url%%)*}; fi
}

# join author_name, author_email, author_url -> author
joinAuthor() {
  author="$author_name"
  if [[ "$author_email" != "" ]]; then author="$author <$author_email>"; fi
  if [[ "$author_url" != "" ]]; then author="$author ($author_url)"; fi
}


# is repository mode?
_repository=""
for a in "$@"; do
  if [[ "$a" == "-r" ]] || [[ "$a" == "--repository" ]]; then _repository="1"; fi
done
if [[ "$repository" == "" ]] && [[ "$_repository" == "" ]]; then npm init "$@"; exit; fi

# get repository from git
isgit=$(git rev-parse --is-inside-work-tree 2>&1)
if [[ "$isgit" == "true" ]]; then repository=$(git config --get remote.origin.url); fi

# read .npmrc
dp0="$(psd)/"
splitAuthor
while read -r l || [[ -n "$l" ]]; do
  l="${l//[$'\r\n']}"
  if [[ "$l" == "init-version="* ]]; then version="${l#init-version=}"; fi
  if [[ "$l" == "init-license="* ]]; then license="${l#init-license=}"; fi
  if [[ "$l" == "init-author-name="* ]]; then author_name="${l#init-author-name=}"; fi
  if [[ "$l" == "init-author-email="* ]]; then author_email="${l#init-author-email=}"; fi
  if [[ "$l" == "init-author-url="* ]]; then author_url="${l#init-author-url=}"; fi
done < "$HOME/.npmrc"
joinAuthor

# read arguments
_name=""; _version=""; _description=""
_main=""; _scripts_test=""; _repository=""
_keywords=""; _author=""; _license=""
while [[ "$#" != "0" ]]; do
  if [[ "$1" == "--help" ]]; then less "${dp0}README.md"; exit
  elif [[ "$1" == "-y" ]] || [[ "$1" == "--yes" ]]; then yes="1"; shift
  elif [[ "$1" == "-n" ]] || [[ "$1" == "--name" ]]; then _name="$2"; shift
  elif [[ "$1" == "-v" ]] || [[ "$1" == "--version" ]]; then _version="$2"; shift
  elif [[ "$1" == "-d" ]] || [[ "$1" == "--description" ]]; then _description="$2"; shift
  elif [[ "$1" == "-m" ]] || [[ "$1" == "--main" ]]; then _main="$2"; shift
  elif [[ "$1" == "-st" ]] || [[ "$1" == "--scripts_test" ]]; then _scripts_test="$2"; shift
  elif [[ "$1" == "-r" ]] || [[ "$1" == "--repository" ]]; then _repository="$2"; shift
  elif [[ "$1" == "-k" ]] || [[ "$1" == "--keywords" ]]; then _keywords="$2"; shift
  elif [[ "$1" == "-a" ]] || [[ "$1" == "--author" ]]; then _author="$2"; shift
  elif [[ "$1" == "-l" ]] || [[ "$1" == "--license" ]]; then _license="$2"; shift
  elif [[ "$1" == "-u" ]] || [[ "$1" == "--username" ]]; then usr="$2"; shift
  elif [[ "$1" == "-p" ]] || [[ "$1" == "--password" ]]; then pwd="$2"; shift
  fi
  shift
done

# read user input
name=$(echo "$name" | tr '[:upper:]' '[:lower:]')
if [[ "$yes" != "1" ]]; then
  printf "This utility will walk you through creating a Node.js repository.\n"
  printf "Press ^C at any time to quit.${ci}\n"
  while : ; do
    if [[ "$_name" == "" ]]; then read -p "package name: ($name) " _name; fi
    _name=$(echo "$_name" | tr '[:upper:]' '[:lower:]')
    name_valid=$(node "${dp0}scripts/name" "$_name")
    if [[ "$name_valid" == "true" ]]; then break; fi
    _name=""; printf "${cr}${cm}Bad package name. "
    printf "Please check https://www.npmjs.com/package/validate-npm-package-name.${cr}${ci}\n"
  done
fi
name="${_name:-$name}"; description="${description:-$name package.}"
if [[ "$repository" == "" ]]; then
  name_noat="${name//@}"; name_nopath="${name_noat//\//-}"
  if [[ "$GITHUB_USERNAME" == "" ]]; then repository="$name_nopath"
  else repository="$GITHUB_USERNAME/$name_nopath"; fi
fi
if [[ "$keywords" == "" ]]; then
  keywords="${name//[^a-z0-9]/,}"; keywords="${keywords#,}"
fi
if [[ "$author" == "" ]]; then
  if [[ "$GITHUB_USERNAME" == "" ]]; then author="id@mail.com"
  else author="$GITHUB_USERNAME@users.noreply.github.com"; fi
fi
if [[ "$yes" != "1" ]]; then
  if [[ "$_version" == "" ]]; then read -p "version: ($version) " _version; fi
  if [[ "$_description" == "" ]]; then read -p "description: ($description) " _description; fi
  if [[ "$_main" == "" ]]; then read -p "entry point: ($main) " _main; fi
  if [[ "$_scripts_test" == "" ]]; then read -p "test command: ($scripts_test) " _scripts_test; fi
  if [[ "$_repository" == "" ]]; then read -p "git repository: ($repository) " _repository; fi
  if [[ "$_keywords" == "" ]]; then read -p "keywords: ($keywords) " _keywords; fi
  if [[ "$_author" == "" ]]; then read -p "author: ($author) " _author; fi
  if [[ "$_license" == "" ]]; then read -p "license: ($license) " _license; fi
  printf "${cr}\n"
fi

# merge user input
version=${_version:-$version}
description=${_description:-$description}
main=${_main:-$main}
scripts_test=${_scripts_test:-$scripts_test}
repository=${_repository:-$repository}
keywords=${_keywords:-$keywords}
author=${_author:-$author}
license=${_license:-$license}

# expand repository to full url
if [[ "$repository" == *"/"* ]]; then
  if [[ "$repository" != *"/"*"/"* ]]; then repository="github.com/$repository"; fi
  if [[ "$repository" != *"://"* ]]; then repository="https://$repository"; fi
elif [[ "$repository" == "." ]]; then repository="$name"
fi

# split repository details
repository_url=""; bugs_url=""; homepage=""
repository_type="git"; repository_name="${repository##*/}"
if [[ "$repository" == *"/"* ]]; then
  if [[ "$repository_name" == *"."* ]]; then repository_type="${repository##*.}"
  elif [[ "$repository" != "http"* ]]; then repository_type="${repository%%://*}"
  else repository_url="git+$repository.git"; fi
  if [[ "$repository_url" == "" ]]; then repository_url="$repository_type+$repository"; fi
  if [[ "${repository##*/}" == *"."* ]]; then repository="${repository%.}"; fi
  repository="https://${repository#*://}"
  bugs_url="$repository/issues"
  homepage="$repository#readme"
fi

# request permission
_s1=""; _s2=""; splitAuthor
json=$(source "${dp0}scripts/json.sh")
if [[ "$repository" == *"github.com"* ]]; then _s1="1"; fi
if [[ "$repository" == *"/"* ]]; then _s2="1"; fi
if [[ "$yes" != "1" ]]; then
  echo "About to:"
  if [[ "$_s1" != "" ]]; then echo "- Initialize repository at GitHub"; fi
  if [[ "$_s2" != "" ]]; then echo "- Clone repository to local"
  else echo "- Initialize repository locally"; fi
  echo "- Create package.json"
  printf "${ci}"
  read -p "OK? (yes) " ok
  printf "${cr}"
  if [[ "$ok" == [nN]* ]]; then exit; fi
fi

# init repository
printf "${cm}\n"
if [[ "$_s1" != "" ]]; then
  printf "Initializing repository $repository ... "
  github_homepage="https://www.npmjs.com/package/$name"
  node "${dp0}scripts/github" -r "$repository" -d "$description" -h "$github_homepage" \
    -t "$keywords" -ai "true" -gt "Node" -lt "$license" -u "$usr" -p "$pwd"
  printf "done.\n"
fi
if [[ "$_s2" != "" ]]; then
  git clone "$repository"
  cd "$repository_name"
else
  printf "Initializing repository $repository ...\n"
  mkdir "$repository_name"
  cd "$repository_name"
  git init
fi
echo "$json" > package.json
printf "Created package.json\n"
printf "${cr}"
