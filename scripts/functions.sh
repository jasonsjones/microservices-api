#!/bin/bash
source $(pwd)/scripts/colors.sh

process_exit_status ()
{
    if [ $1 -gt 0 ]
        then
            echo -e "${RED}😢  Oops...something didn't quite go as expected${RESTORE}"
        else
            echo -e "${GREEN}😃  🎉  Tests passed${RESTORE}"
    fi
}