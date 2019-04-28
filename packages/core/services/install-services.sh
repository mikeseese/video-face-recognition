#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cp -f ${DIR}/*.service /etc/systemd/system/
systemctl daemon-reload
