#!/usr/bin/env bash
# Usage
# ./sce-add-contract.sh "PSK" URL
# To be used from a pipeline, but can be run manually as well.

# See also: https://github.com/kleros/frontend-experimental/blob/master/functions/add-contract.ts

DEPLOYED_CONTRACTS=$(find contracts/deployments -name '*.json')

PRE_SHARED_KEY="pre_shared_key: $1"
URL=$2

for contract in $DEPLOYED_CONTRACTS
do
  network=$(echo $contract | cut -d/ -f3) 
  curl -XPOST --data "@$contract" -H "network: $network" -H "$PRE_SHARED_KEY" "$URL"
done



