#!/bin/bash

cp -f *.service /etc/systemd/system/
systemctl daemon-reload
