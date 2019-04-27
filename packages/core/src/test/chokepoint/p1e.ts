import * as path from "path";
import * as fs from "fs";
import * as fr from "@video-face-recognition/face-recognition";
import CamID from "../../lib";

const tests = (model: fr.FaceDescriptor[], baseDirectory: string) => {
  describe("S1", () => {
    const subDirectory = path.join(baseDirectory, "S1");
    it.skip("should run P1E S1 C1", async () => {
      // being used as training data
    });

    it.only("should run P1E S1 C2", async () => {
      const testDirectory = path.join(subDirectory, "C2");
      const imageInfoFile = path.join(testDirectory, "all_file.txt");
      const imageInfoFileDetails = fs.readFileSync(imageInfoFile, "utf8");
      const files = imageInfoFileDetails.split("\n").filter(line => line !== "");

      const session = new CamID.Session(model);
      for (let i = 0; i < files.length; i++) {
        // load image
        const rgbImage = fr.loadImage(path.join(testDirectory, files[i]));

        // detect and identify faces
        const faces = await session.getFaces(rgbImage);

        // compare to truth
      }
    });

    it("should run P1E S1 C3", async () => {
      //
    });
  });

  describe("S2", () => {
    it("should run P1E S2 C1", async () => {
      //
    });

    it("should run P1E S2 C2", async () => {
      //
    });

    it("should run P1E S2 C3", async () => {
      //
    });
  });

  describe("S3", () => {
    it("should run P1E S3 C1", async () => {
      //
    });

    it("should run P1E S3 C2", async () => {
      //
    });

    it("should run P1E S3 C3", async () => {
      //
    });
  });

  describe("S4", () => {
    it("should run P1E S4 C1", async () => {
      //
    });

    it("should run P1E S4 C2", async () => {
      //
    });

    it("should run P1E S4 C3", async () => {
      //
    });
  });
};

export default tests;
