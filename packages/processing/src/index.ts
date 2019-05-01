import pgpubsub from "pg-pubsub";
import dotenv from "dotenv";
import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import path from "path";
import tmp from "tmp";
import { promisify } from "util";
import * as Notify from "./notify";
const player = require("play-sound")({ player: "ffplay" });

const client = new textToSpeech.TextToSpeechClient();

dotenv.config();

const playUnauthAudio = process.env.VFR_PLAY_UNAUTH_SOUND !== "false";
const playAuthAudio = process.env.VFR_PLAY_AUTH_SOUND !== "false";

const dbConnectionString =
  process.env.VFR_POSTGRESDB_CONNECTION_STRING ||
  `postgresql://postgres:postgres@localhost:9001/vfr`;

const pubsubInstance = new pgpubsub(dbConnectionString);

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
  [name: string]: Date
} = {};

function hasBeenLongEnoughSinceLastGreeting(greeting: Date) {
  const elapsedTimeMs = Date.now() - greeting.getTime();
  return elapsedTimeMs > 1 * 24 * 60 * 60 * 1000; // one day
}

// listen for command from api to gather, train, or recognize
pubsubInstance.on(process.env.VFR_CHANNEL_STATE_COMMAND, (payload: IStateCommand) => {
  // publish state changes
});

// listen for auth events
pubsubInstance.on(process.env.VFR_CHANNEL_AUTHENTICATED, (payload: IAuthenticated) => {
  if (payload.authorized && payload.name !== null && playAuthAudio) {
    if (typeof lastGreeted[payload.name] === "undefined" ||
      hasBeenLongEnoughSinceLastGreeting(lastGreeted[payload.name]))
    {
      lastGreeted[payload.name] = new Date();

      // Construct the request
      const request = {
        input: {text: `Welcome ${payload.name} ${process.env.VFR_CUSTOM_GREETING}!`},
        // Select the language and SSML Voice Gender (optional)
        voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
        // Select the type of audio encoding
        audioConfig: {audioEncoding: 'MP3'},
      };

      // Performs the Text-to-Speech request
      client.synthesizeSpeech(request, async (err, response) => {
        if (err) {
          console.error('ERROR:', err);
          return;
        }

        const file = tmp.fileSync();

        await promisify(fs.writeFile)(file.name, response.audioContent, 'binary');

        player.play(file.name, { ffplay: ["-nodisp", "-autoexit"] });

        file.removeCallback();
      });
    }
  }
  else if (!payload.authorized) {
    // TODO: The below methods are not implemented. Implement them in notify.ts
    Notify.unauthEmail(payload.id, payload.timestamp);
    Notify.unauthPush(payload.id, payload.timestamp);

    if (playUnauthAudio) {
      player.play(path.join(__dirname, "unauth.mp3"), { ffplay: ["-nodisp", "-autoexit"] });
    }
  }
});


pubsubInstance.addChannel(process.env.VFR_CHANNEL_STATE_COMMAND);
pubsubInstance.addChannel(process.env.VFR_CHANNEL_UNAUTHENTICATED);
