#!/bin/bash

docker volume create pg_data
docker-compose up -d
sudo systemctl start vfr-recognize
sudo systemctl start vfr-processing
