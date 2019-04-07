# Video Face Recognition (VFR) - Setup

This repository contains the setup and admin scripts for managing the Video Face Recognition (VFR) system. The VFR system was created as an independent study for my Master of Science program at the University of Florida. The target is a NVIDIA Jetson TX2 running Ubuntu 16.04.

## Active Maintenance
The VFR system will likely not be actively maintained by the original author ([@seesemichaelj](https://github.com/seesemichaelj)) after it has been installed, so the system may be out of date if you're stumbling across this.

Contributors are definitely welcome! I'm active on GitHub and will review PRs in my free time!

## VFR Components

- [Core](https://github.com/SeesePlusPlus/vfr-core) - The daemon that runs the facial recognition and training
- [Dashboard](https://github.com/SeesePlusPlus/vfr-dashboard) - The web interface which users can check status and manage the VFR system
- [Persistence](https://github.com/SeesePlusPlus/vfr-persistence) - A simple repository containing the database schema and initialization scripts
- [Setup](https://github.com/SeesePlusPlus/vfr-setup) - This repository. Contains the `docker-compose.yml` file and helper scripts that bring the other components/services together.

## Initial Setup
1. `sudo ./install-arm64-deps.sh`
    - This script installs Docker CE and Docker Compose dependencies necessary for running the VFR system. Since it targets the TX2 board, it installs Docker CE for the `arm64` architecture.
1. `sudo ./initialize-and-start.sh`
    - This script runs `docker-compose up -d` which will create the containers

## Management

### Initialize/Destroy
The `initialize-and-start.sh` and `destroy.sh` scripts will run `docker-compose up -d` and `docker-compose down` commands respectively. These will create and destroy containers. While the services write any persistent data to disk in the `.data` folder and should seem unaffected from a `down/destroy` command, this should just kept in mind that they will destroy the docker containers. You may want to use `stop/start/restart` functionality for your specific use case (despite at the time of writing this, it shouldn't really matter).

### Start/Stop/Restart
The `start.sh`, `stop.sh`, and `restart.sh` scripts in this directory are just wrappers around `docker-compose start|stop|restart`.

### Maintenance Mode
A helper `maintenance.sh` script is also available. `./maintenance.sh start` will run `./stop.sh` and start a lightweight webserver to display a maintenance page. `./maintenance.sh stop` will stop the maintenace page webserver and run `./start.sh`. You may style the maintenance page at [maintenance/index.html](maintenance/index.html).

### Export/Import Persistent Data
If you need to export/import persistent data for any reason (regular backups, hardware issues/upgrades, etc.), there are two helper scripts for that as well.

**In both cases, you should [stop the VFR system](#startstoprestart) or put it in [maintenance mode](#maintenance-mode).**

#### Export
Before exporting **you should [stop the VFR system](#startstoprestart) or put it in [maintenance mode](#maintenance-mode).**

Running `./export.sh` will create a compressed tarball of the `.data` directory with the `vfr-export-YYYYmmdd-HHMMss.tar.gz` pattern. You can then transfer this file wherever you'd like to store it.

#### Import
Before importing **you should [stop the VFR system](#startstoprestart) or put it in [maintenance mode](#maintenance-mode).**

Copy the tarball that you had previously [exported](#export) to this directory. Run `./import.sh <vfr-export-YYYYmmdd-HHMMss.tar.gz>`.

For safe keeping, `import.sh` will conduct an `export` before importing to prevent data loss since importing will overwrite the `.data` directly completely. You can disable the preliminary export (**though this will delete your `.data` directory upon import!**) by adding the `--no-backup` argument: `./import.sh --no-backup <vfr-export-YYYYmmdd-HHMMss.tar.gz>`

### Clean Persistent Data
:warning: **YOU WILL LOSE ALL OF YOUR TRAINED FACIAL MODELS, DASHBOARD USER INFORMATION, LOGS, ETC**

You can clean the persistent data by running `sudo rm -r .data` from this directory.

## Development
To develop on the VFR system, I suggest the following steps:

1. `mkdir vfr && cd vfr`
1. `git clone https://github.com/SeesePlusPlus/vfr-setup.git setup`
1. `git clone https://github.com/SeesePlusPlus/vfr-core.git core`
1. `git clone https://github.com/SeesePlusPlus/vfr-dashboard.git dashboard`
1. `git clone https://github.com/SeesePlusPlus/vfr-persistence.git persistence`
1. `cd persistence`
1. `./build.sh` or `docker-compose build`

Of course, change the Git urls appropriately if you have forked the repositories, though keep the folder structure as the `docker-compose.yml` is expecting it for the build steps.

## Troubleshooting

### Camera Isn't Working
