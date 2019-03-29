#!/bin/bash
name="$(./util/name.sh -1)"

docker run --detach \
    --hostname localhost \
    --publish 90:80 \
    --publish 9090:8080 \
    --name $name \
    --restart always \
    privatesky/csb_wizzard
