import * as fs from "fs";
import * as path from "path";
import * as cv from "opencv4nodejs";
import * as fr from "@video-face-recognition/face-recognition";
import { ConnectPersistence, Identity } from "@video-face-recognition/persistence";

fr.withCv(cv);
fr.winKillProcessOnExit();

const recognizer = fr.FaceRecognizer();
const detector = fr.FaceDetector();

const expectedNumArgs = 2;
if (process.argv.length - 2 !== expectedNumArgs) {
  throw new Error(`Received ${process.argv.length - 2} arguments, expected ${expectedNumArgs} (data folder with images, model.json location)`);
}

const datasetLocation = path.resolve(process.argv[2]);
const modelLocation = path.resolve(process.argv[3]);

const dbConnectionString =
  process.env.VFR_POSTGRESDB_CONNECTION_STRING ||
  `postgresql://postgres:postgres@localhost:9001/vfr`;

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
  }

  const modelState = recognizer.serialize();
  fs.writeFileSync(modelLocation, JSON.stringify(modelState));
}

// load the identities (just names really) into the database
// if they're not there already
(async () => {
  if (fs.existsSync(modelLocation)) {
    await ConnectPersistence(dbConnectionString);

    const model: fr.FaceDescriptor[] = require(modelLocation);

    for (const descriptor of model) {
      const id = await Identity.findOne({
        where: {
          name: descriptor.className
        }
      });

      if (!id) {
        await Identity.create({
          name: descriptor.className
        });
      }
    }
  }
})();
