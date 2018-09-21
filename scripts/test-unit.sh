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

# pass along a --inspect-brk to the 'mocha' cmd to trigger a breakpoint at the start of runnning the tests
# then go to chrome://inspect in the browser to find the remote session in order to debug the tests

NODE_ENV=test DEBUG=test,mailer npx mocha --exit $SRC_SETUP $SRC
TEST_STATUS=$?

process_exit_status $TEST_STATUS

exit $TEST_STATUS