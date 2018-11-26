import * as fs from "fs";
import * as path from "path";
import * as cv from "opencv4nodejs";
import * as fr from "@seesemichaelj/face-recognition";

fr.withCv(cv);
fr.winKillProcessOnExit();

const recognizer = fr.FaceRecognizer();

const expectedNumArgs = 3;
if (process.argv.length !== expectedNumArgs) {
  throw new Error(`Received ${process.argv.length - 2} arguments, expected ${expectedNumArgs}`);
}

const model = process.argv[2];

recognizer.load(require(model));

const cap = new cv.VideoCapture(1);

let done = false;
while (!done) {
  const frame = cap.read();
  const rgbFrame = fr.cvImageToImageRGB(new fr.CvImage(frame));

  const predictions = recognizer.predict(rgbFrame);

  for (let i = 0; i < predictions.length; i++) {
    //
  }

  //frame.drawRectangle(fr.toCvRect(rect), new cv.Vec3(0, 0, 255));

  cv.imshow('blah', frame);
  const key = cv.waitKey(100);
  done = key !== -1 && key !== 255;
}
