import * as fs from "fs";
import * as path from "path";
import * as cv from "opencv4nodejs";
import * as fr from "face-recognition";

fr.withCv(cv);
fr.winKillProcessOnExit();

const recognizer = fr.FaceRecognizer();

const expectedNumArgs = 3;
if (process.argv.length !== expectedNumArgs) {
  throw new Error(`Received ${process.argv.length - 2} arguments, expected ${expectedNumArgs}`);
}

const datasetLocation = process.argv[2];

const classNames = fs.readdirSync(datasetLocation).filter((f) => f !== "." && f !== "..");

for (let i = 0; i < classNames.length; i++) {
  const name = classNames[i];
  console.log(`Adding ${name}...`);

  const images = fs.readdirSync(path.join(datasetLocation, name), "binary");

  const faceChips = images.map((imageFileName) => {
    return fr.loadImage(path.join(datasetLocation, name, imageFileName));
  });

  recognizer.addFaces(faceChips, name);
}

const modelState = recognizer.serialize();
fs.writeFileSync(path.join(datasetLocation, "model.json"), JSON.stringify(modelState));
