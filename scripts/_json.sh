#!/bin/bash
# create package.json
cat << EOM
{
  "name": "$name",
  "version": "$version",
  "description": "$description",
  "main": "$main",
  "scripts": {
    "test": "$scripts_test"
  },
  "repository": {
    "type": "$repository_type",
    "url": "$repository_url"
  },
  "keywords": [
EOM
keywords_pre=",$keywords"
keywords_less1="${keywords_pre%,*}"
for a in ${keywords_less1//,/ }; do cat << EOM
    "$a",
EOM
done
cat << EOM
    "${keywords_pre##*,}"
  ],
EOM
author_extra="$author_email$author_url"
if [[ "$author_extra" == "" ]]; then
  echo "  \"author\": \"$author_name\","
else
  echo "  \"author\": {"
  if [[ "$author_name" != "" ]]; then echo "    \"name\": \"$author_name\"${author_extra:+,}"; fi
  if [[ "$author_name" != "" ]]; then echo "    \"email\": \"$author_email\"${author_url:+,}"; fi
  if [[ "$author_url" != "" ]]; then echo "    \"url\": \"$author_url\""; fi
  echo "  },"
fi
cat << EOM
  "license": "$license",
  "bugs": {
    "url": "$bugs_url"
  },
  "homepage": "$homepage"
}
EOM
