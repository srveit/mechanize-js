#!/bin/bash

main () {
  # setup
  FAILURES=0

  NODELINT="$PKG/node_modules/.bin/nodelint $PKG/*.js $PKG/lib/*.js $PKG/lib/mechanize/*.js $PKG/spec/*.js --config $PKG/nodelint_config.js"
  # echo $NODELINT
  $NODELINT
  if [ $? -ne 0 ]; then
      fail "Nodelint failed:\n$NODELINT" >&2
  fi

  JASMINE="$PKG/node_modules/.bin/jasmine-node --noColor spec"
  $JASMINE 2> /dev/null
  if [ $? -ne 0 ]; then
      fail "Jasmine-node failed:\n$JASMINE" >&2
  fi

  if [ $FAILURES -eq 0 ]; then
    echo_err "ok"
    rm -rf $TMP
  else
    echo_err "FAILED: $FAILURES"
  fi
  exit $FAILURES
}



####################
# Test Harness below

# get the absolute path of the executable
SELF_PATH="$0"
if [ "${SELF_PATH:0:1}" != "." ] && [ "${SELF_PATH:0:1}" != "/" ]; then
  SELF_PATH=./"$SELF_PATH"
fi
SELF_PATH=$( cd -P -- "$(dirname -- "$SELF_PATH")" \
          && pwd -P \
          ) && SELF_PATH=$SELF_PATH/$(basename -- "$0")
# resolve symlinks
while [ -h "$SELF_PATH" ]; do
  DIR=$(dirname -- "$SELF_PATH")
  SYM=$(readlink -- "$SELF_PATH")
  SELF_PATH=$( cd -- "$DIR" \
            && cd -- $(dirname -- "$SYM") \
            && pwd \
            )/$(basename -- "$SYM")
done
PKG="$(dirname -- "$(dirname -- "$SELF_PATH")")"

echo_err () {
  echo "$@" >&2
}
fail () {
  let 'FAILURES += 1'
  echo_err ""
  echo_err -e "\033[33mFailure: $@\033[m"
  exit 1
}
patch_jslint () {
    PATCH_FILE=$PKG/jslint.js.patch
    JSLINTDIR=$PKG/node_modules/nodelint/jslint
    pushd $JSLINTDIR
    grep -q shouldMethods jslint.js
    if [ $? -ne 0 ]; then
        patch < $PATCH_FILE
    fi
    popd
}

patch_jslint
main
