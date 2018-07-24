#!/bin/sh
# global variables
typ="version"
usr="${GITHUB_USERNAME}"
pwd="${GITHUB_PASSWORD}"
all="${ENPM_CLONE_ALL}"
tgp="${ENPM_CLONE_TARGET_PREFIX}"
tgt="${ENPM_CLONE_TARGET}"
dsc="${ENPM_CLONE_DESCRIPTION}"
url="${ENPM_CLONE_HOMEPAGE}"
aio="${ENPM_CLONE_AUTO_INIT}"
gto="${ENPM_CLONE_GITIGNORE_TEMPLATE}"
lto="${ENPM_CLONE_LICENSE_TEMPLATE}"
pre="${ENPM_CLONE_PREFIX}"
msg="${ENPM_CLONE_MESSAGE}"
pkg="${ENPM_CLONE_PACKAGE}"
if [[ "$all" == "1" ]]; then typ="versions"; fi
if [[ "$tgp" == "" ]]; then tgp="$usr"; fi

fullTgt() {
  # get full target url from partial
  if [[ "$1" == "git://"* ]] || [[ "$1" == "http://"* ]] || [[ "$1" == "https://"* ]]; then echo "$1"
  elif [[ "$1" == "github.com"* ]]; then echo "https://$1"
  elif [[ "$1" == *"/"* ]]; then echo "https://github.com/$1"
  else echo "https://github.com/${tgp}/$1"
  fi
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
  if [[ "$1" == "--help" ]]; then less "${dp0}README.md" && exit
  elif [[ "$1" == "-a" ]] || [[ "$1" == "--all" ]]; then typ="versions"
  elif [[ "$1" == "-u" ]] || [[ "$1" == "--username" ]]; then usr="$2" && shift
  elif [[ "$1" == "-p" ]] || [[ "$1" == "--password" ]]; then pwd="$2" && shift
  elif [[ "$1" == "-t" ]] || [[ "$1" == "--target" ]]; then tgt="$2" && shift
  elif [[ "$1" == "-h" ]] || [[ "$1" == "--homepage" ]]; then url="$2" && shift
  elif [[ "$1" == "-d" ]] || [[ "$1" == "--description" ]]; then dsc="$2" && shift
  elif [[ "$1" == "-ai" ]] || [[ "$1" == "--auto_init" ]]; then aio="$2" && shift
  elif [[ "$1" == "-gt" ]] || [[ "$1" == "--gitignore_template" ]]; then gto="$2" && shift
  elif [[ "$1" == "-lt" ]] || [[ "$1" == '--license_template' ]]; then lto="$2" && shift
  elif [[ "$1" == "-m" ]] || [[ "$1" == "--message" ]]; then msg="$2" && shift
  else pkg="$1"
  fi
  shift
done

# init package dir
pkgdirs=""
if [[ "$tgt" != "" ]]; then
  tgt="$(fullTgt "$tgt")"
  pkgdir="${tgt%.git}"
  pkgdir="${tgt##*/}"
  printf "${cm}git clone ${tgt}${cr}\n"
  if [[ "$dsc" == "" ]]; then dsc="$(npm view ${pkg} description)"; fi
  if [[ "$url" == "" ]]; then url="https://www.npmjs.com/package/${pkg%%@*}"; fi
  node "${dp0}" ${tgt:+-t} "$tgt" ${usr:+-u} "$usr" ${pwd:+-p} "$pwd" ${url:+-h} "$url" ${dsc:+-d} "$dsc" repocreate
  git clone "$tgt"
elif [[ "$typ" == "version" ]]; then
  pkgdir="$pkg"
  mkdir "$pkgdir"
else
  pkgdirs="1"
fi

# clone/clone-to
if [[ "$pkg" == "" ]]; then exit; fi
for ver in $(npm view $pkg $typ); do
  ver="${ver//[\[\]\',]}"
  if [[ "$ver" == "" ]]; then continue; fi
  pkgver="${pkg%%@*}@${ver}"
  if [[ "$pkgdirs" == "1" ]]; then
    pkgdir="$pkgver"
    mkdir "$pkgdir"
  fi
  tmpdir=$(mktemp -d -t)
  fetchPkg "$pkgver" "$tmpdir"
  movePkg "$tmpdir" "$pkgdir"
  if [[ "$tgt" != "" ]]; then
    mv="${pre}${pre:+ }${msg}${msg:-v$ver}"
    gitPush "$pkgdir" "$mv"
  fi
done
