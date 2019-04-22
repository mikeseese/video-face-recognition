import * as path from "path";
import * as cv from "opencv4nodejs";
import * as fr from "@video-face-recognition/face-recognition";
import * as dotenv from "dotenv";

dotenv.config();

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

if (!process.env.VFR_VIDEO_DEVICE_NUM || !process.env.VFR_VIDEO_FPS) {
  throw new Error(`Environment variables VFR_VIDEO_DEVICE_NUM or process.env.VFR_VIDEO_FPS ` +
    `not set, used for cv.VideoCapture(VFR_VIDEO_DEVICE_NUM)") and cap.set(cv.CAP_PROP_FPS, process.env.VFR_VIDEO_FPS);`);
}

const cap = new cv.VideoCapture(parseInt(process.env.VFR_VIDEO_DEVICE_NUM));
cap.set(cv.CAP_PROP_FPS, parseInt(process.env.VFR_VIDEO_FPS));

let done = false;
(async () => {
  while (!done) {
    const frame = cap.read();
    const rgbFrame = fr.cvImageToImageRGB(new fr.CvImage(frame));

    const faceChips = detector.detectFaces(rgbFrame);

    for (let i = 0; i < faceChips.length; i++) {
      const chip = faceChips[i];

      const predictions = recognizer.predict(chip);
      const sortedPredictions = predictions.sort((p1, p2) => p1.distance - p2.distance);

      console.log(sortedPredictions[0].className);
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 5);
    })
  }
})();
