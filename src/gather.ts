
import * as cv from "opencv4nodejs";
import * as fs from "fs";
import * as path from "path";
import * as fr from "@seesemichaelj/face-recognition";

fr.withCv(cv);
fr.winKillProcessOnExit();
const detector = fr.FaceDetector();

const expectedNumArgs = 4;
if (process.argv.length !== expectedNumArgs) {
  throw new Error(`Received ${process.argv.length - 2} arguments, expected ${expectedNumArgs}`);
}

const cap = new cv.VideoCapture(1);

const dataDir = process.argv[2];
const name = process.argv[3];

try {
  fs.mkdirSync(path.join(dataDir, name));
}
catch (e) {
  //
}

let done = false;
while (!done) {
  const timestamp = Date.now();
  const frame = cap.read();
  const rgbFrame = fr.cvImageToImageRGB(new fr.CvImage(frame));

  const faces = detector.locateFaces(rgbFrame);
  const faceRects = faces.map((face) => face.rect);
  const faceChips = detector.getFacesFromLocations(rgbFrame, faceRects);

  for (let i = 0; i < faceChips.length; i++) {
    const chip = faceChips[i];
    const rect = faceRects[i];
    frame.drawRectangle(fr.toCvRect(rect), new cv.Vec3(0, 0, 255));
    const fileLocation = path.join(dataDir, name, `image-${timestamp}-${i}.png`);
    fr.saveImage(fileLocation, chip);
  }

  cv.imshow('blah', frame);
  const key = cv.waitKey(100);
  done = key !== -1 && key !== 255;
}
