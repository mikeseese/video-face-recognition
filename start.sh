#!/bin/bash

docker-compose start
sudo systemctl start vfr-recognize
sudo systemctl start vfr-processing
