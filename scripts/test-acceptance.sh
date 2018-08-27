#!/bin/bash

# colors
RESTORE='\033[0m'
CYAN='\033[00;36m'
SRC_SETUP='src/utils/dbTestSetup.js'

if [ -z $1 ]
    then
        SRC='src/**/*.a-test.js'
        echo -e "\nNo feature or module supplied\n"
    else
        SRC="src/**/$1.a-test.js"
        echo -e "${CYAN}*** Running acceptance tests for $1 feature and/or module ***${RESTORE}"
fi

NODE_ENV=test DEBUG=db:connection,test npx mocha --exit $SRC_SETUP $SRC
TEST_STATUS=$?
echo "Tests complete!"
exit $TEST_STATUS