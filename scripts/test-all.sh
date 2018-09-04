#!/bin/bash
source $(pwd)/scripts/colors.sh

echo -e "${PURPLE}*** Running full suite of unit, integration, and acceptance tests ***${RESTORE}"

NODE_ENV=test DEBUG=db:connection,test yarn test:unit
NODE_ENV=test DEBUG=db:connection,test yarn test:integration
NODE_ENV=test DEBUG=db:connection,test yarn test:acceptance