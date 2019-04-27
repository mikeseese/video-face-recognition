#!/bin/bash

name=$(date "+%Y%m%d-%H%M%S")
tar acpvf vfr-export-${name}.tar.gz ../.data
