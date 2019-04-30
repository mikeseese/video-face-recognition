#!/usr/bin/env bash

# The below tells bash to stop the script if any of the commands fail
set -ex

yarn build:persistence
yarn build:api
yarn build:core
docker-compose build
