import * as fr from "@video-face-recognition/face-recognition";

export interface FaceIdentity {
  name: string;
  confidence: number;
}

export default class Faceprint {
  public rect: fr.Rect;
  public chip: fr.ImageRGB;
  private predictionDistributions: { [name: string]: number[] };
  public numPredictions: number;

  constructor() {
    this.predictionDistributions = {};
    this.numPredictions = 0;
  }

  identity(): FaceIdentity {
    if (Object.keys(this.predictionDistributions).length > 0) {
      const distributions = Object.entries(this.predictionDistributions).map(([name, distances]) => {
        return {
          name,
          mean: distances.reduce((sum: number, val: number) => val + (sum || 0)) / distances.length,
        };
      });

      distributions.sort((a, b) => a.mean - b.mean);

      // 0.6 threshold from https://blog.dlib.net/2017/02/high-quality-face-recognition-with-deep.html
      const validPredictions = distributions.filter((distribution) => distribution.mean <= 0.6);

      if (validPredictions.length > 0) {
        // let's give it a confidence soley based on distance.
        // simple linear scale: 0.6 is 60%, 0.0 is 100%
        const normalConfidence = -0.4 / 0.6 * validPredictions[0].mean + 1.0;

        if (validPredictions.length > 1) {
          // we have at least one other valid prediction, lets
          // decrease the confidence based on the distance between the two
          // i would consider (emperically) a distance delta of 0.2 to
          // be extensive. a distance delta of 0.0 would be indistinguishable
          // so a difference delta of 0 would be 0% confident 🤷‍♂ and 0.2 would be
          // no different than just having one prediction
          const distanceDelta = (validPredictions[1].mean - validPredictions[0].mean);
          const adjustedConfidence = Math.min(1.0, distanceDelta * 5) * normalConfidence;
          return {
            name: validPredictions[0].name,
            confidence: adjustedConfidence,
          };
        }
        else {
          // only prediction, dont adjust the confidence
          return {
            name: validPredictions[0].name,
            confidence: normalConfidence,
          };
        }
      }
      else {
        // only valid prediction, let's give it a confidence soley
        // based on distance
        return {
          name: null,
          confidence: 0,
        };
      }
    }
    else {
      // this happens with an empty trained model
      return {
        name: null,
        confidence: 0,
      }
    }
  }

  addPredictions(rect: fr.Rect, chip: fr.ImageRGB, predictions: fr.FacePrediction[]) {
    this.numPredictions++;
    this.rect = rect;
    this.chip = chip;
    for (const prediction of predictions) {
      if (Array.isArray(this.predictionDistributions[prediction.className])) {
        this.predictionDistributions[prediction.className].push(prediction.distance);
      }
      else {
        this.predictionDistributions[prediction.className] = [prediction.distance];
      }
    }
  }
}
