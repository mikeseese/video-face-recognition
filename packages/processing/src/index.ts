import pgpubsub from "pg-pubsub";
import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import path from "path";
import tmp from "tmp";
import { promisify } from "util";
import * as Notify from "./notify";
import { Semaphore } from "await-semaphore";
import { spawnSync, execSync } from "child_process";
const player = require("play-sound")({ player: "ffplay" });

const client = new textToSpeech.TextToSpeechClient();

const playUnauthAudio = process.env.VFR_PLAY_UNAUTH_SOUND !== "false";
const playAuthAudio = process.env.VFR_PLAY_AUTH_SOUND !== "false";
const unAuthFile = path.join(__dirname, "..", process.env.VFR_UNAUTH_FILE);

const dbConnectionString =
  process.env.VFR_POSTGRESDB_CONNECTION_STRING ||
  `postgresql://postgres:postgres@localhost:9001/vfr`;

const gatherConfigFile = path.join(
  __dirname, // /packages/processing/dist
  "..",
  "..",
  "core",
  "services",
  "vfr-gather.conf"
);

const pubsubInstance = new pgpubsub(dbConnectionString);

const semaphore = new Semaphore(1);
let state: "gather" | "train" | "recognize" | "stopped" = "recognize";

interface IStateCommand {
  command: "gather" | "train" | "recognize";
  data?: string;
}

interface IAuthenticated {
  id: string;
  timestamp: string;
  name: string | null;
  authorized: boolean;
}

const lastGreeted: {
  [name: string]: {
    date: Date,
    file: tmp.FileResult,
  }
} = {};

function hasBeenLongEnoughSinceLastGreeting(greeting: Date) {
  const elapsedTimeMs = Date.now() - greeting.getTime();
  return elapsedTimeMs > 1 * 24 * 60 * 60 * 1000; // one day
}

pubsubInstance.addChannel(process.env.VFR_CHANNEL_STATE_COMMAND);
pubsubInstance.addChannel(process.env.VFR_CHANNEL_AUTHENTICATED);

function stopServices() {
  spawnSync("sudo", ["/bin/systemctl", "stop", "vfr-recognize.service"]);
  spawnSync("sudo", ["/bin/systemctl", "stop", "vfr-train.service"]);
  spawnSync("sudo", ["/bin/systemctl", "stop", "vfr-gather.service"]);
}

async function waitUntilServiceStops(service: string) {
  // systemctl is-active --quiet service
  let isRunning = true;
  while (isRunning) {
    const result = spawnSync("systemctl", ["is-active", "--quiet", service]);
    isRunning = result.status === 0;

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

// listen for command from api to gather, train, or recognize
pubsubInstance.on(process.env.VFR_CHANNEL_STATE_COMMAND, async (payload: IStateCommand) => {
  // publish state changes
  switch (payload.command) {
    case "gather": {
      if (state === "gather" || state === "train") {
        return;
      }

      state = "gather";
      stopServices();
      const name = payload.data!;
      execSync(`sed -i '/NAME=/cNAME=${name}' "${gatherConfigFile}"`);
      spawnSync("sudo", ["/bin/systemctl", "start", "vfr-gather.service"]);
      await waitUntilServiceStops("vfr-gather.service");
      state = "stopped";
      break;
    }
    case "train": {
      if (state === "train") {
        return;
      }

      state = "train";
      stopServices();
      spawnSync("sudo", ["/bin/systemctl", "start", "vfr-train.service"]);
      await waitUntilServiceStops("vfr-train.service");
      state = "recognize";
      spawnSync("sudo", ["/bin/systemctl", "start", "vfr-recognize.service"]);
      break;
    }
    case "recognize": {
      if (state === "recognize" || state === "train") {
        return;
      }

      state = "recognize";
      stopServices();
      spawnSync("sudo", ["/bin/systemctl", "start", "vfr-recognize.service"]);
      break;
    }
  }
});

// listen for auth events
pubsubInstance.on(process.env.VFR_CHANNEL_AUTHENTICATED, async (payload: IAuthenticated) => {
  const release = await semaphore.acquire();
  if (payload.authorized && payload.name !== null && playAuthAudio) {
    if (typeof lastGreeted[payload.name] === "undefined" ||
      hasBeenLongEnoughSinceLastGreeting(lastGreeted[payload.name].date))
    {
      if (typeof lastGreeted[payload.name] === "undefined") {
        lastGreeted[payload.name] = {
          date: new Date(),
          file: tmp.fileSync({
            mode: 0o644,
            prefix: `vfr-access-`,
            postfix: ".mp3"
          })
        };

        // Construct the request
        const request = {
          input: {
            text: `Welcome, ${payload.name}, ${process.env.VFR_CUSTOM_GREETING}!`
          },
          // Select the language and SSML Voice Gender (optional)
          voice: {
            languageCode: "en-US",
            ssmlGender: "NEUTRAL"
          },
          // Select the type of audio encoding
          audioConfig: {
            audioEncoding: "MP3"
          },
        };

        // Performs the Text-to-Speech request
        const response = await new Promise<any>((resolve, reject) => {
          client.synthesizeSpeech(request, (err, response) => {
            if (err) {
              reject(err);
            }
            else {
              resolve(response);
            }
          });
        });

        await promisify(fs.writeFile)(lastGreeted[payload.name].file.name, response.audioContent, "binary");

      }
      else {
        lastGreeted[payload.name].date = new Date();
      }

      await new Promise((resolve, reject) => {
        player.play(lastGreeted[payload.name].file.name, { ffplay: ["-loglevel", "quiet", "-nodisp", "-autoexit"] }, (err) => {
          if (err) {
            reject(err);
          }
          else {
            resolve();
          }
        });
      });
    }
  }
  else if (!payload.authorized) {
    // TODO: The below methods are not implemented. Implement them in notify.ts
    Notify.unauthEmail(payload.id, payload.timestamp);
    Notify.unauthPush(payload.id, payload.timestamp);

    if (playUnauthAudio) {
      if (unAuthFile.endsWith(".mp3")) {
        await new Promise((resolve, reject) => {
          player.play(unAuthFile, { ffplay: ["-loglevel", "quiet", "-nodisp", "-autoexit"] }, (err) => {
            if (err) {
              reject(err);
            }
            else {
              resolve();
            }
          });
        });
      }
      else if (unAuthFile.endsWith(".mp4")) {
        spawnSync("/usr/bin/xinit", [
          "-e",
          "/bin/bash",
          "-c",
          "'ffplay -loglevel quiet -autoexit'",
          "$*",
          "--",
          ":2"
        ])
      }
    }
  }

  release();
});
