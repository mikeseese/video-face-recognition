import * as fs from "fs";
import * as path from "path";
import * as cv from "opencv4nodejs";
import * as fr from "@video-face-recognition/face-recognition";

fr.withCv(cv);
fr.winKillProcessOnExit();

const detector = fr.FaceDetector();
const recognizer = fr.FaceRecognizer();

const expectedNumArgs = 1;
if (process.argv.length - 2 !== expectedNumArgs) {
  throw new Error(`Received ${process.argv.length - 2} arguments, expected ${expectedNumArgs} (path to the model.json file)`);
}

const model = process.argv[2];

recognizer.load(require(path.resolve(model)));
console.log(recognizer.getDescriptorState());

if (!process.env.VFR_VIDEO_DEVICE_NUM) {
  throw new Error("Environment variable VFR_VIDEO_DEVICE_NUM not set, used for cv.VideoCapture(VFR_VIDEO_DEVICE_NUM)");
}

const cap = new cv.VideoCapture(parseInt(process.env.VFR_VIDEO_DEVICE_NUM));

let done = false;
while (!done) {
  const frame = cap.read();
  const rgbFrame = fr.cvImageToImageRGB(new fr.CvImage(frame));

  // const faces = detector.locateFaces(rgbFrame);
  // const faceRects = faces.map((face) => face.rect);
  // const faceChips = detector.getFacesFromLocations(rgbFrame, faceRects);
  const faceChips = detector.detectFaces(rgbFrame);

  for (let i = 0; i < faceChips.length; i++) {
    const chip = faceChips[i];
    //const rect = faceRects[i];

    // const left = rect.left;
    // const top = rect.top;
    // const right = rect.right;
    // const bottom = rect.bottom;

    //frame.drawRectangle(fr.toCvRect(rect), new cv.Vec3(0, 0, 255));
    //frame.drawRectangle(new cv.Point2(left, bottom + 35), new cv.Point2(right, bottom), new cv.Vec3(0, 0, 255), cv.FILLED);

    const predictions = recognizer.predict(chip);
    const sortedPredictions = predictions.sort((p1, p2) => p1.distance - p2.distance);

    console.log(sortedPredictions[0].className);

    //console.log("mikeLive = [" + recognizer.getFaceDescriptors(chip) + "];");

    //frame.putText(sortedPredictions[0].className, new cv.Point2(left + 6, bottom + 31), cv.FONT_HERSHEY_DUPLEX, 1.0, new cv.Vec3(255, 255, 255), 1);
  }

  //cv.imshow('blah', frame);
  const key = cv.waitKey(5);
  done = key !== -1 && key !== 255;
}
