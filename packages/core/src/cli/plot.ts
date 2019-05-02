import path from "path";
import fr from "@video-face-recognition/face-recognition";

const expectedNumArgs = 3;
if (process.argv.length !== expectedNumArgs) {
  throw new Error(`Received ${process.argv.length - 2} arguments, expected ${expectedNumArgs}`);
}

const model = require(path.resolve(process.argv[2]));

for (let i = 0; i < model.length; i++) {
  const personName: string = model[i].className;
  const faceDescriptors = model[i].faceDescriptors.map(arr => new fr.Array(arr));

  const meanDescriptors: number[] = fr.mean(faceDescriptors).getData();

  console.log(personName + " = [" + meanDescriptors + "];");
}
