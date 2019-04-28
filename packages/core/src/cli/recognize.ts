import * as path from "path";
import * as cv from "opencv4nodejs";
import * as fr from "@video-face-recognition/face-recognition";
import * as dotenv from "dotenv";
import Session from "../lib/session";
import "reflect-metadata";
import { AccessLog, Identity, ConnectPersistence } from "@video-face-recognition/persistence";
import {
  LessThan
} from "typeorm";

dotenv.config();

fr.withCv(cv);
fr.winKillProcessOnExit();

const expectedNumArgs = 1;
if (process.argv.length - 2 !== expectedNumArgs) {
  throw new Error(`Received ${process.argv.length - 2} arguments, expected ${expectedNumArgs} (path to the model.json file)`);
}

const model: fr.FaceDescriptor[] = require(path.resolve(process.argv[2]));

if (!process.env.VFR_VIDEO_DEVICE_NUM || !process.env.VFR_VIDEO_FPS) {
  throw new Error(`Environment variables VFR_VIDEO_DEVICE_NUM or process.env.VFR_VIDEO_FPS ` +
    `not set, used for cv.VideoCapture(VFR_VIDEO_DEVICE_NUM)") and cap.set(cv.CAP_PROP_FPS, process.env.VFR_VIDEO_FPS);`);
}

const cap = new cv.VideoCapture(parseInt(process.env.VFR_VIDEO_DEVICE_NUM));
cap.set(cv.CAP_PROP_FPS, parseInt(process.env.VFR_VIDEO_FPS));

const reportingIntervalSeconds = process.env.VFR_REPORTING_INTERVAL_SEC ? parseInt(process.env.VFR_REPORTING_INTERVAL_SEC) : 60;
const minConfidenceThreshold = (1 / 100) * (process.env.VFR_CONFIDENCE_THRESHOLD_PERCENT ? parseInt(process.env.VFR_CONFIDENCE_THRESHOLD_PERCENT) : 60);

const dbConnectionString =
  process.env.VFR_POSTGRESDB_CONNECTION_STRING ||
  `postgresql://postgres:postgres@localhost:9001/vfr`;

const session = new Session(model);

let done = false;
(async () => {
  await ConnectPersistence(dbConnectionString);

  while (!done) {
    const frame = cap.read();
    const frameTime = new Date();
    const rgbFrame = fr.cvImageToImageRGB(new fr.CvImage(frame));

    const faceprints = await session.addImage(rgbFrame);

    const promises = faceprints.map(async (faceprint) => {
      const identity = faceprint.identity();

      if (identity.confidence >= minConfidenceThreshold) {
        const log = await AccessLog.createQueryBuilder("log")
          .leftJoinAndSelect("log.identity", "identity")
          .where("identity.name = :name", { name: identity.name })
          .andWhere("log.timestamp >= :timestamp", {
            timestamp: new Date(frameTime.getTime() - reportingIntervalSeconds * 1000)
          })
          .getOne();

        if (typeof log === "undefined") {
          const id = await Identity.findOne({
            where: {
              name: identity.name
            }
          });

          await AccessLog.create({
            timestamp: frameTime,
            authorized: id ? id.authorized : false,
            identity: id || null,
            confidence: Math.floor(identity.confidence * 100)
          }).save();
        }
      }
      else {
        await AccessLog.create({
          timestamp: frameTime,
          authorized: false,
          identity: null,
          confidence: null
        }).save();
      }
    });

    await Promise.all(promises);

    await new Promise((resolve) => {
      setTimeout(resolve, 5);
    })
  }
})();
