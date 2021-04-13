#!/usr/bin/env bash
## Clone npm package.

# global variables
cr="\033[0m"
cfby="\033[1;33m"
cm="${cm:-$cfby}"
typ="version"
pkg="${NPM_CLONE_PACKAGE}"
all="${NPM_CLONE_ALL}"
pre="${NPM_CLONE_PREFIX}"
msg="${NPM_CLONE_MESSAGE}"
rpp="${NPM_CLONE_REPOSITORY_PREFIX}"
rep="${NPM_CLONE_REPOSITORY}"
dsc="${NPM_CLONE_DESCRIPTION}"
hom="${NPM_CLONE_HOMEPAGE}"
key="${NPM_CLONE_KEYWORDS}"
aio="${NPM_CLONE_AUTO_INIT}"
gto="${NPM_CLONE_GITIGNORE_TEMPLATE}"
lto="${NPM_CLONE_LICENSE_TEMPLATE}"
usr="${GITHUB_USERNAME}"
pwd="${GITHUB_PASSWORD}"
psd="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
if [[ "$all" == "1" ]]; then typ="versions"; fi
if [[ "$rpp" == "" ]]; then rpp="$usr"; fi


fullRep() {
  # get full repository url from partial
  if [[ "$1" == "git://"* ]] || [[ "$1" == "http://"* ]] || [[ "$1" == "https://"* ]]; then echo "$1"
  elif [[ "$1" == "github.com"* ]]; then echo "https://$1"
  elif [[ "$1" == *"/"* ]]; then echo "https://github.com/$1"
  else echo "https://github.com/${rpp}/$1"
  fi
}


pkgDescription() {
  # get description from npm
  npm view $1 description
}

pkgHomepage() {
  # get homepage from npm
  z="$(npm view $1 homepage)"; a="$1"
  if [[ "$z" == *"github.com"* ]]; then z="https://www.npmjs.com/package/${a%%@*}"; fi
  echo "$z"
}

pkgKeywords() {
  # get keywords from npm
  z="$(npm view $1 keywords)"
  z="${z//[\[\]\', ]}"; z="${z//$'\n'/,}"
  echo "${z/#,}"
}


fetchPkg() {
  # fetch npm package to temp-dir/package (returns temp-dir)
  pushd "$2" >/dev/null
  printf "${cm}npm pack $1${cr}\n"
  npm pack "$1"
  tgz=$(ls *.tgz)
  printf "${cm}tar extract ${tgz}${cr}\n"
  tar -xvzf "$tgz"
  popd >/dev/null
}

movePkg() {
  # move temp-dir/package to packagedir
  rm -rf "$2/"*
  shopt -s dotglob nullglob
  mv "$1/package/"* "$2/".
  shopt -u dotglob nullglob
  rm -rf "$1"
}


gitPush() {
  # push packagedir with message
  printf "${cm}git push \"$2\"${cr}\n"
  pushd "$1" >/dev/null
  git add .
  git commit -m "$2"
  git push
  popd >/dev/null
}


# read arguments
while [[ "$#" != "0" ]]; do
  if [[ "$1" == "--help" ]]; then less "${psd}clone.md"; exit
  elif [[ "$1" == "-a" ]] || [[ "$1" == "--all" ]]; then typ="versions"
  elif [[ "$1" == "-m" ]] || [[ "$1" == "--message" ]]; then msg="$2"; shift
  elif [[ "$1" == "-r" ]] || [[ "$1" == "--repository" ]]; then rep="$2"; shift
  elif [[ "$1" == "-d" ]] || [[ "$1" == "--description" ]]; then dsc="$2"; shift
  elif [[ "$1" == "-h" ]] || [[ "$1" == "--homepage" ]]; then hom="$2"; shift
  elif [[ "$1" == "-k" ]] || [[ "$1" == "--keywords" ]]; then key="$2"; shift
  elif [[ "$1" == "-ai" ]] || [[ "$1" == "--auto_init" ]]; then aio="1"
  elif [[ "$1" == "-gt" ]] || [[ "$1" == "--gitignore_template" ]]; then gto="$2"; shift
  elif [[ "$1" == "-lt" ]] || [[ "$1" == '--license_template' ]]; then lto="$2"; shift
  elif [[ "$1" == "-u" ]] || [[ "$1" == "--username" ]]; then usr="$2"; shift
  elif [[ "$1" == "-p" ]] || [[ "$1" == "--password" ]]; then pwd="$2"; shift
  else pkg="$1"
  fi
  shift
done


# init package dir
pkgdirs=""
if [[ "$rep" != "" ]]; then
  rep="$(fullRep "$rep")"
  pkgdir="${rep%.git}"
  pkgdir="${rep##*/}"
  printf "${cm}git clone ${rep}${cr}\n"
  if [[ "$dsc" == "" ]]; then dsc="$(pkgDescription $pkg)"; fi
  if [[ "$hom" == "" ]]; then hom="$(pkgHomepage $pkg)"; fi
  if [[ "$key" == "" ]]; then key="$(pkgKeywords $pkg)"; fi
  node "${psd}_github" ${rep:+-r} "$rep" ${usr:+-u} "$usr" ${pwd:+-p} "$pwd" \
    ${dsc:+-d} "$dsc" ${hom:+-h} "$hom" ${key:+-t} "$key" ${aio:+-ai} "$aio" \
    ${gto:+-gt} "$gto" ${lto:+-lt} "$lto" repocreate
  git clone "$rep"
elif [[ "$typ" == "version" ]]; then
  pkgdir="${pkg/\//-}"
  mkdir "$pkgdir"
else
  pkgdirs="1"
fi


# clone/clone-to
if [[ "$pkg" == "" ]]; then exit; fi
for ver in $(npm view $pkg $typ); do
  ver="${ver//[\[\]\',]}"
  if [[ "$ver" == "" ]]; then continue; fi
  p1="${pkg:1}"; pkgver="${pkg:0:1}${p1%%@*}@${ver}"
  if [[ "$pkgdirs" == "1" ]]; then
    pkgdir="${pkgver/\//-}"
    mkdir "$pkgdir"
  fi
  tmpdir=$(mktemp -d -t)
  fetchPkg "$pkgver" "$tmpdir"
  movePkg "$tmpdir" "$pkgdir"
  if [[ "$rep" != "" ]]; then
    mv="${pre}${pre:+ }${msg}${msg:-v$ver}"
    gitPush "$pkgdir" "$mv"
  fi
done
