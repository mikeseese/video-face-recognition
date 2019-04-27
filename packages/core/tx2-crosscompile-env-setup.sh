#!/bin/bash

# Usage:
#  source ./tx2-crosscompile-env-setup.sh
#  yarn
#  yarn build

export DLIB_INCLUDE_DIR=/usr/local/include
export DLIB_LIB_DIR=/usr/local/lib

export CUDA_LIB_DIR=/usr/local/cuda/lib64
export CUDNN_LIB_DIR=/usr/lib/aarch64-linux-gnu

export OPENBLAS_LIB_DIR=/usr/local/lib

export OPENCV4NODEJS_DISABLE_AUTOBUILD=1
export OPENCV_LIB_DIR=/usr/lib
export OPENCV_INCLUDE_DIR=/usr/include
