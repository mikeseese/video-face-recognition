import fs from "fs";
import path from "path";
import cv from "opencv4nodejs";
import fr from "@video-face-recognition/face-recognition";
import "reflect-metadata";
import { ConnectPersistence, Identity } from "@video-face-recognition/persistence";
import pgpubsub from "pg-pubsub";

fr.withCv(cv);
fr.winKillProcessOnExit();

const recognizer = fr.FaceRecognizer();
const detector = fr.FaceDetector();

interface ITrainingStatus {
  completed: number;
  total: number;
}

const expectedNumArgs = 2;
if (process.argv.length - 2 !== expectedNumArgs) {
  throw new Error(`Received ${process.argv.length - 2} arguments, expected ${expectedNumArgs} (data folder with images, model.json location)`);
}

const datasetLocation = path.resolve(process.argv[2]);
const modelLocation = path.resolve(process.argv[3]);

const dbConnectionString =
  process.env.VFR_POSTGRESDB_CONNECTION_STRING ||
  `postgresql://postgres:postgres@localhost:9001/vfr`;

const pubsubInstance = new pgpubsub(dbConnectionString);
pubsubInstance.addChannel(process.env.VFR_CHANNEL_TRAINING_STATUS);

if (fs.existsSync(datasetLocation)) {
  const classNames = fs.readdirSync(datasetLocation).filter((f) => f !== "." && f !== "..");

  for (let i = 0; i < classNames.length; i++) {
    const name = classNames[i];
    const f = path.join(datasetLocation, name);
    if (!fs.lstatSync(f).isDirectory()) {
      continue;
    }
    console.log(`Adding ${name}...`);

    const images = fs.readdirSync(f, "binary");

    const faceChips = images.map((imageFileName) => {
      const image = fr.loadImage(path.join(datasetLocation, name, imageFileName));
      const faces = detector.detectFaces(image);
      if (faces.length > 0) {
        return faces[0];
      }
      else {
        return null;
      }
    }).filter(f => f !== null);

    recognizer.addFaces(faceChips, name);

    pubsubInstance.publish(process.env.VFR_CHANNEL_TRAINING_STATUS, {
      completed: i + 1,
      total: classNames.length,
    } as ITrainingStatus);
  }

  const modelState = recognizer.serialize();
  fs.writeFileSync(modelLocation, JSON.stringify(modelState));
}

// load the identities (just names really) into the database
// if they're not there already
(async () => {
  console.log(`Adding identities to the db`);
  if (fs.existsSync(modelLocation)) {
    const connection = await ConnectPersistence(dbConnectionString);

    const model: fr.FaceDescriptor[] = require(modelLocation);

    for (const descriptor of model) {
      const id = await Identity.findOne({
        where: {
          name: descriptor.className
        }
      });

      if (!id) {
        console.log(`Adding ${descriptor.className} identity`);
        await Identity.create({
          name: descriptor.className
        }).save();
      }
      else {
        console.log(`Identity ${descriptor.className} already added to DB`);
      }
    }

    await pubsubInstance.close();
    await connection.close();
  }
})();
