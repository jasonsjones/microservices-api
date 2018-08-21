#!/bin/bash

# colors
RESTORE='\033[0m'
CYAN='\033[00;36m'
SRC_SETUP='src/utils/testSetup.js'
REPORTER='--reporter spec'

if [ -z $1 ]
    then
        SRC='src/**/*.test.js'
        REPORTER='--reporter landing'
        echo -e "\nNo feature or module supplied\n"
    else
        SRC="src/**/$1*.test.js"
        echo -e "${CYAN}*** Running unit tests for $1 feature and/or module ***${RESTORE}"
fi

NODE_ENV=test DEBUG=test npx mocha --exit $REPORTER $SRC_SETUP $SRC
echo "Tests complete!"