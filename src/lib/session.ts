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

  async getFaces(image: fr.ImageRGB): Promise<Faceprint[]> {
    let result: Faceprint[] = [];

    const faces = this.detector.locateFaces(image);
    const faceRects = faces
      .filter(mmodRect => mmodRect.confidence > this.minFaceDetectionThreshold)
      .map(mmodRect => mmodRect.rect);
    const faceChips = this.detector.getFacesFromLocations(image, faceRects);

    for (let i = 0; i < faceChips.length; i++) {
      const chip = faceChips[i];
      const predictions = this.recognizer.predict(chip);
      const sortedPredictions = predictions.sort((p1, p2) => p1.distance - p2.distance);
    }

    return result;
  }
}
