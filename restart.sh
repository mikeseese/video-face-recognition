#!/bin/bash

docker-compose restart
sudo systemctl stop vfr-gather
sudo systemctl stop vfr-train
sudo systemctl restart vfr-recognize
sudo systemctl restart vfr-processing
