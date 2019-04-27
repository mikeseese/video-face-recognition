#!/bin/bash

cd ../core
git pull
rm -rf build # remove the typescript build files
yarn # update dependencies
yarn build
cd ../setup
