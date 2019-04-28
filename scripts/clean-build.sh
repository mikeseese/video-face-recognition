#!/usr/bin/env bash

# The below tells bash to stop the script if any of the commands fail
set -ex

yarn clean:build:core
yarn clean:build:persistence
