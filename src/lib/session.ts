import * as fr from "@seesemichaelj/face-recognition";
import Faceprint from "./faceprint";

export default class Session {
  constructor() {
    //
  }

  async getFaces(image: fr.ImageRGB): Promise<Faceprint[]> {
    return [];
  }
}
