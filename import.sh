#!/bin/bash

if [ $# -eq 0 ]; then
  echo "You must provide the tarbal you'd like to import"
  echo "Usage: ./import.sh vfr-export-20190427-135831.tar.gz"
  exit
fi

name=$1

read -p "Are you sure you want to overwrite VFR data with contents of ${name} [y/N]? " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Importing ${name}"
  tar xpvf ${name}
else
  echo "Skipping import"
fi
