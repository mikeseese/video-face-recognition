import * as fs from "fs";
import * as path from "path";
import * as cv from "opencv4nodejs";
import * as fr from "@video-face-recognition/face-recognition";

fr.withCv(cv);
fr.winKillProcessOnExit();

const recognizer = fr.FaceRecognizer();
const detector = fr.FaceDetector();

const expectedNumArgs = 1;
if (process.argv.length - 2 !== expectedNumArgs) {
  throw new Error(`Received ${process.argv.length - 2} arguments, expected ${expectedNumArgs} (data folder with images)`);
}

const datasetLocation = path.resolve(process.argv[2]);

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

console.log(recognizer.getDescriptorState());
const modelState = recognizer.serialize();
fs.writeFileSync(path.join(datasetLocation, "model.json"), JSON.stringify(modelState));
