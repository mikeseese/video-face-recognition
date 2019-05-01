import pgpubsub from "pg-pubsub";
import dotenv from "dotenv";
import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import path from "path";
import tmp from "tmp";
import { promisify } from "util";
import * as Notify from "./notify";
import { Semaphore } from "await-semaphore";
const player = require("play-sound")({ player: "ffplay" });

const client = new textToSpeech.TextToSpeechClient();

dotenv.config();

const playUnauthAudio = process.env.VFR_PLAY_UNAUTH_SOUND !== "false";
const playAuthAudio = process.env.VFR_PLAY_AUTH_SOUND !== "false";

const dbConnectionString =
  process.env.VFR_POSTGRESDB_CONNECTION_STRING ||
  `postgresql://postgres:postgres@localhost:9001/vfr`;

const pubsubInstance = new pgpubsub(dbConnectionString);

const semaphore = new Semaphore(1);

interface IStateCommand {
  command: string;
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

// listen for command from api to gather, train, or recognize
pubsubInstance.on(process.env.VFR_CHANNEL_STATE_COMMAND, (payload: IStateCommand) => {
  // publish state changes
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
      const unAuthFile = path.join(__dirname, "..", "unauth.mp3");
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
  }

  release();
});
