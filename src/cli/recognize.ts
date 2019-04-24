import * as path from "path";
import * as cv from "opencv4nodejs";
import * as fr from "@video-face-recognition/face-recognition";
import * as dotenv from "dotenv";
import Session from "../lib/session"

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

const session = new Session(model);

let done = false;
(async () => {
  while (!done) {
    const frame = cap.read();
    const rgbFrame = fr.cvImageToImageRGB(new fr.CvImage(frame));

    const faceprints = session.addImage(rgbFrame);

    await new Promise((resolve) => {
      setTimeout(resolve, 5);
    })
  }
})();
