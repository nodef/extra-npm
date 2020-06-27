#!/usr/bin/env bash
# require('./_github.js')

# global variables
cr="\033[0m"
cfby="\033[1;33m"
cm="${cm:-$cfby}"
typ="version"
pkg="${ENPM_CLONE_PACKAGE}"
all="${ENPM_CLONE_ALL}"
pre="${ENPM_CLONE_PREFIX}"
msg="${ENPM_CLONE_MESSAGE}"
rpp="${ENPM_CLONE_REPOSITORY_PREFIX}"
rep="${ENPM_CLONE_REPOSITORY}"
dsc="${ENPM_CLONE_DESCRIPTION}"
hom="${ENPM_CLONE_HOMEPAGE}"
key="${ENPM_CLONE_KEYWORDS}"
aio="${ENPM_CLONE_AUTO_INIT}"
gto="${ENPM_CLONE_GITIGNORE_TEMPLATE}"
lto="${ENPM_CLONE_LICENSE_TEMPLATE}"
usr="${GITHUB_USERNAME}"
pwd="${GITHUB_PASSWORD}"
if [[ "$all" == "1" ]]; then typ="versions"; fi
if [[ "$rpp" == "" ]]; then rpp="$usr"; fi



# read arguments
dp0="$(psd)/"
while [[ "$#" != "0" ]]; do
  if [[ "$1" == "--help" ]]; then less "${dp0}clone.md"; exit
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
  node "${dp0}_github" ${rep:+-r} "$rep" ${usr:+-u} "$usr" ${pwd:+-p} "$pwd" \
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
