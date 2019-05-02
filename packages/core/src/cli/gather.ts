
import cv from "opencv4nodejs";
import fse from "fs-extra";
import path from "path";
import fr from "@video-face-recognition/face-recognition";
import dotenv from "dotenv";

dotenv.config();

fr.withCv(cv);
fr.winKillProcessOnExit();
const detector = fr.FaceDetector();

const expectedNumArgs = 2;
if (process.argv.length - 2 !== expectedNumArgs) {
  throw new Error(`Received ${process.argv.length - 2} arguments, expected ${expectedNumArgs} (directory to save images, name of person)`);
}

if (!process.env.VFR_VIDEO_DEVICE_NUM || !process.env.VFR_VIDEO_FPS) {
  throw new Error(`Environment variables VFR_VIDEO_DEVICE_NUM or process.env.VFR_VIDEO_FPS ` +
    `not set, used for cv.VideoCapture(VFR_VIDEO_DEVICE_NUM)") and cap.set(cv.CAP_PROP_FPS, process.env.VFR_VIDEO_FPS);`);
}

const cap = new cv.VideoCapture(parseInt(process.env.VFR_VIDEO_DEVICE_NUM));
cap.set(cv.CAP_PROP_FPS, parseInt(process.env.VFR_VIDEO_FPS))

const dataDir = process.argv[2];
const name = process.argv[3];

try {
  fse.mkdirpSync(path.join(dataDir, name));
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

  cv.imshow("VFR - Press 'Q' to Stop", frame);
  const key = cv.waitKey(100);
  done = key !== -1 && key !== 255;
}
