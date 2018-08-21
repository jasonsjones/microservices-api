#!/bin/bash

# colors
RESTORE='\033[0m'
CYAN='\033[00;36m'
SRC_SETUP='src/utils/testSetup.js'

if [ -z $1 ]
    then
        SRC='src/**/*.test.js'
        echo -e "\nNo feature or module supplied\n"
    else
        SRC="src/**/$1*.test.js"
        echo -e "${CYAN}*** Running unit tests for $1 feature and/or module ***${RESTORE}"
fi

DEBUG=test npx nodemon --exec "mocha $SRC_SETUP $SRC"
echo "Tests complete!"