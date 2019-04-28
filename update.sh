#!/bin/bash

git pull
yarn clean:build
yarn # update dependencies
yarn build
