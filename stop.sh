#!/bin/bash

docker-compose stop
sudo systemctl stop vfr-gather
sudo systemctl stop vfr-recognize
sudo systemctl stop vfr-train
sudo systemctl stop vfr-processing
