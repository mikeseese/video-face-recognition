import * as fr from "@video-face-recognition/face-recognition";
import Faceprint from "./faceprint";

export default class Session {
  private detector: fr.FaceDetector;
  private recognizer: fr.FaceRecognizer;
  private minFaceDetectionThreshold: number;

  constructor(model: fr.FaceDescriptor[], minFaceDetectionThreshold: number = 0, useFaceLandmarks68Model = false) {
    this.detector = fr.FaceDetector(useFaceLandmarks68Model);
    this.recognizer = fr.FaceRecognizer();
    this.recognizer.load(model);
    this.minFaceDetectionThreshold = minFaceDetectionThreshold;
  }

  correlate(_rect: fr.Rect, _chip: fr.ImageRGB): Faceprint {
    // simple no frame-to-frame correlation
    return new Faceprint();
  }

  update(_faceprints: Faceprint[]) {
    // simple no frame-to-frame correlation
    return;
  }

  async addImage(image: fr.ImageRGB): Promise<Faceprint[]> {
    let result: Faceprint[] = [];

    const faces = this.detector.locateFaces(image);
    const faceRects = faces
      .filter(mmodRect => mmodRect.confidence > this.minFaceDetectionThreshold)
      .map(mmodRect => mmodRect.rect);
    const faceChips = this.detector.getFacesFromLocations(image, faceRects);

    for (let i = 0; i < faceChips.length; i++) {
      const chip = faceChips[i];
      const rect = faceRects[i];
      const predictions = this.recognizer.predict(chip);

      const fp = this.correlate(rect, chip);
      fp.addPredictions(faceRects[i], chip, predictions);
      result.push(fp);
    }

    this.update(result);

    return result;
  }
}
