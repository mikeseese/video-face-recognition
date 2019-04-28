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
    const accumulatedDistributaions: number[] = Object.values(this.predictionDistributions).map((distances) => {
      return distances.reduce((sum: number, val: number) => val + (sum || 0));
    });

    const totalDistance = accumulatedDistributaions.reduce((sum: number, val: number) => val + (sum || 0));

    const minDistance = Math.min(...accumulatedDistributaions);
    const name = Object.keys(this.predictionDistributions)[accumulatedDistributaions.indexOf(minDistance)];

    return {
      name,
      confidence: 1 - (minDistance / totalDistance)
    };
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
