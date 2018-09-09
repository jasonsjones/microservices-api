#!/bin/bash
source $(pwd)/scripts/colors.sh
source $(pwd)/scripts/functions.sh

SRC_SETUP='src/utils/testSetup.js'

if [ -z $1 ]
    then
        SRC='src/**/*.test.js'
        echo -e "${YELLOW}No feature or module supplied...running the full suite of unit tests${RESTORE}"
    else
        SRC="src/**/$1*.test.js"
        echo -e "${CYAN}*** Running unit tests for $1 feature and/or module ***${RESTORE}"
fi

NODE_ENV=test DEBUG=test npx mocha --exit $SRC_SETUP $SRC
TEST_STATUS=$?

process_exit_status $TEST_STATUS

exit $TEST_STATUS