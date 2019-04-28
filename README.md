# Video Face Recognition (VFR)

This repository contains the setup and admin scripts for managing the Video Face Recognition (VFR) system. The VFR system was created as an independent study for my Master of Science program at the University of Florida. The target is a NVIDIA Jetson TX2 running Ubuntu 16.04.

## Active Maintenance
The VFR system will likely not be actively maintained by the original author ([@seesemichaelj](https://github.com/seesemichaelj)) after the hardware system is delivered as part of his independent study, so the system may be out of date if you're stumbling across this.

Contributors are definitely welcome! I'm active on GitHub and will review PRs in my free time!

## VFR Components

- [Core](packages/core) - The daemon that runs the facial recognition and training
- [Dashboard](packages/dashboard) - The web interface which users can check status and manage the VFR system
- [Persistence](packages/persistence) - A simple repository containing the database schema and initialization scripts

## Initial Setup
1. `./install-arm64-deps.sh` (don't use `sudo` as it installs stuff in the user folder, it will prompt for a `sudo` password)
    - This script installs Docker CE and Docker Compose dependencies necessary for running the VFR system. Since it targets the TX2 board, it installs Docker CE for the `arm64` architecture.
1. Add the following lines to your `~/.bashrc` files. Change as you see fit:
    ```bash
    export DLIB_INCLUDE_DIR=/usr/local/include
    export DLIB_LIB_DIR=/usr/local/lib

    export CUDA_LIB_DIR=/usr/local/cuda/lib64
    export CUDNN_LIB_DIR=/usr/lib/aarch64-linux-gnu

    export OPENBLAS_LIB_DIR=/usr/local/lib

    export OPENCV4NODEJS_DISABLE_AUTOBUILD=1
    export OPENCV_LIB_DIR=/usr/lib
    export OPENCV_INCLUDE_DIR=/usr/include
    ```
1. `exec bash` to make sure you load the environment variables we added in the prior step
1. `./update.sh` will then `git pull`, `yarn`, and `yarn build`
1. `sudo ./initialize-and-start.sh`
    - This script runs `docker-compose up -d` which will create the containers

### Issues with NVIDIA SDK Manager installing libraries
I had issues with NVIDIA's SDK Manager installing the appropriate libraries. It downloaded them into my `~/Downloads/sdkm_downloads` folder on the host machine; I then used `scp` to transfer them manually to the TX2 and install the ones I wanted by navigating to the appropriate directory and running the below commands:
- `sudo dpkg -i cuda-repo-l4t-10-0-local-10.0.166_1.0-1_arm64.deb`
- `sudo dpkg -i /var/cuda-repo-10-0-local-10.0.166/*.deb`
- `sudo dpkg -i libcudnn7_7.3.1.28-1+cuda10.0_arm64.deb`
- `sudo dpkg -i libcudnn7-dev_7.3.1.28-1+cuda10.0_arm64.deb`
- `sudo dpkg -i libopencv_3.3.1-2-g31ccdfe11_arm64.deb`
- `sudo dpkg -i libopencv-dev_3.3.1-2-g31ccdfe11_arm64.deb`

## Management

The `install-arm64-deps.sh` script does not add the user to the `docker` user group for security reasons. Most of these scripts will need to be executed with `sudo` because of this. You can read on how non-root users can manage docker [here](https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user).

### Initialize/Destroy
The `initialize-and-start.sh` and `destroy.sh` scripts will run `docker-compose up -d` and `docker-compose down` commands respectively. These will create and destroy containers. While the services write any persistent data to disk in the `.data` folder and should seem unaffected from a `down/destroy` command, this should just kept in mind that they will destroy the docker containers. You may want to use `stop/start/restart` functionality for your specific use case (despite at the time of writing this, it shouldn't really matter).

### Start/Stop/Restart
The `start.sh`, `stop.sh`, and `restart.sh` scripts in this directory are just wrappers around `docker-compose start|stop|restart`.

### Database Navigation
Adminer, a SQL admin webapp, is available by navigating to `http://localhost:9002`. The default credentials are as follows:
- **System:** `PostgreSQL`
- **Server:** `vfr-persistence:5432`
- **Username:** `postgres`
- **Password:** `postgres`
- **Database:** `vfr`

#### Docker Volume
There is also a docker volume for the database contents which **will survive a `./destroy.sh`**. You can see where the volume is located using `docker inspect pg_data`.

### Export/Import Persistent Data
If you need to export/import persistent data for any reason (regular backups, hardware issues/upgrades, etc.), there are two helper scripts for that as well.

**In both cases, you should [stop the VFR system](#startstoprestart).**

#### Export
Before exporting **you should [stop the VFR system](#startstoprestart).**

Running `./export.sh` will create a compressed tarball of the `.data` directory with the `vfr-export-YYYYmmdd-HHMMss.tar.gz` pattern. You can then transfer this file wherever you'd like to store it.

##### Exporting the Database
Unfortunately I wasn't able to get the database files to be easily exported. The `export.sh` script will only export the training images and facial recognition model. To export the database, you can [access Adminer](#database-navigation) and clicking the `Export` link on the left sidebar.

#### Import
Before importing **you should [stop the VFR system](#startstoprestart).**

Copy the tarball that you had previously [exported](#export) to this directory. Run `sudo ./import.sh <vfr-export-YYYYmmdd-HHMMss.tar.gz>`.

For safe keeping, `import.sh` will conduct an `export` before importing to prevent data loss since importing will overwrite the `.data` directly completely. You can disable the preliminary export (**though this will delete your `.data` directory upon import!**) by adding the `--no-backup` argument: `sudo ./import.sh --no-backup <vfr-export-YYYYmmdd-HHMMss.tar.gz>`

##### Importing the Database
Unfortunately I wasn't able to get the database files to be easily imported. The `import.sh` script will only import the training images and facial recognition model. To import the database, you can [access Adminer](#database-navigation) and clicking the `Import` link on the left sidebar.

### Clean Persistent Data
:warning: **YOU WILL LOSE ALL OF YOUR TRAINED FACIAL MODELS, DASHBOARD USER INFORMATION, LOGS, ETC**

You can clean the persistent data by running `sudo rm -r .data` from this directory.

## Development
To develop on the VFR system, I suggest the following steps:

1. `git clone https://github.com/SeesePlusPlus/video-face-recognition.git vfr`
1. `cd vfr`
1. `yarn` - This downloads any missing dependencies
1. `yarn build` - This builds the Typescript sources of VFR

Of course, change the Git urls appropriately if you have forked the repositories, though keep the folder structure as the `docker-compose.yml` is expecting it for the build steps.

### Updating the sources
If the repo was updated externally (i.e. not on your target device), `./update.sh` will run `git pull`, `yarn clean:build`, `yarn`, and `yarn build` for you.

### Cleaning your development environment
There are two commands in the base of the monorepo for cleaning your development environment:
- `yarn clean:build` only cleans the build artifacts (i.e. `packages/*/dist/*.js`); it will not clean your dependencies since installing those can take awhile on the target hardware
- `yarn clean:all` (:warning: **this will not prompt you if you'd like to clean stuff**) will clean all your dependencies and build artifacts, you will need to run `yarn` before running `yarn build` to download/build the NodeJS dependencies

## Troubleshooting

### Camera Isn't Working
