#!/bin/bash

## Install Build Utilities
sudo apt-get install -y build-essential git python-pip

## Install Docker CE
sudo apt-get remove -y docker docker-engine docker.io containerd runc
sudo apt-get update
sudo apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg-agent \
  software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository -y \
   "deb [arch=arm64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

## Install Docker Compose
sudo pip install docker-compose

## Various libraries
sudo apt-get install -y \
  libpng-dev \
  libx11-dev \
  libtbb2 \
  libtbb-dev \
  libxmu-dev \
  libxi-dev \
  liblapack-dev \
  liblapack3 \
  cmake \
  libgfortran4 \
  gfortran-7 \
  libgfortran-7-dev

## NVM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

## Yarn
exec bash
nvm install --lts
npm i -g yarn

## openblas
cd ~
git clone https://github.com/xianyi/OpenBLAS.git openblas
cd openblas
cd lapack-netlib
cp make.inc.example make.inc
cd ..
make NO_LAPACK=0 FC=gfortran-7
sudo make install

## dlib, manual compilation with gpu
cd ~
git clone https://github.com/seeseplusplus/dlib.git
cd dlib
git checkout vfr
mkdir build && cd build
cmake .. -DDLIB_USE_CUDA=1 -DUSE_AVX_INSTRUCTIONS=1
make -j4
sudo make install

## VFR development
cd ~
mkdir vfr && cd vfr
git clone https://github.com/seeseplusplus/vfr-core
git clone https://github.com/seeseplusplus/vfr-dashboard
git clone https://github.com/seeseplusplus/vfr-setup
git clone https://github.com/SeesePlusPlus/vfr-persistence
