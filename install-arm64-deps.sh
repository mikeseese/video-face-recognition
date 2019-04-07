#!/bin/bash

## Install Build Utilities
apt-get install -y build-essential git python-pip

## Install Docker CE
apt-get remove -y docker docker-engine docker.io containerd runc
apt-get update
apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg-agent \
  software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

add-apt-repository -y \
   "deb [arch=arm64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

## Install Docker Compose
pip install docker-compose
