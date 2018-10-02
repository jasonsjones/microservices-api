#!/bin/bash
source $(pwd)/scripts/colors.sh
source $(pwd)/scripts/functions.sh

SRC_SETUP='src/utils/dbTestSetup.js'

if [ -z $1 ]
    then
        SRC='src/**/*.a-test.js'
        echo -e "${YELLOW}No feature or module supplied...running the full suite of acceptance tests${RESTORE}"
    else
        SRC="src/**/$1.a-test.js"
        echo -e "${CYAN}*** Running acceptance tests for $1 feature and/or module ***${RESTORE}"
fi

NODE_ENV=test DEBUG=db:connection,test,mailer npx mocha --exit $SRC_SETUP $SRC
TEST_STATUS=$?

process_exit_status $TEST_STATUS

if [ -d "test-sessions" ]; then
    rm -rf test-sessions
fi

exit $TEST_STATUS