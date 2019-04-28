#!/usr/bin/env bash

# The below tells bash to stop the script if any of the commands fail
set -ex

lerna clean -y
rm -rf node_modulesm
