#!/bin/bash

docker-compose down
sudo systemctl stop vfr-gather
sudo systemctl stop vfr-recognize
sudo systemctl stop vfr-train
sudo systemctl stop vfr-processing
