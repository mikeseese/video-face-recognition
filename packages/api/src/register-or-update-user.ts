
import "reflect-metadata";
import { User, ConnectPersistence } from "@video-face-recognition/persistence";

const easyPbkdf2 = require("easy-pbkdf2")();

const expectedNumArgs = 4;
if (process.argv.length - 2 !== expectedNumArgs) {
  throw new Error(`Received ${process.argv.length - 2} arguments, expected ${expectedNumArgs} (dbConnectionString, email, name, password)`);
}

const dbConnectionString = process.argv[2];
const email = process.argv[3];
const name = process.argv[4];
const password = process.argv[5];

(async () => {
  await ConnectPersistence(dbConnectionString);
  await new Promise((resolve) => {
    easyPbkdf2.secureHash(password, async (err, passwordHash, originalSalt ) => {
      if (err) {
        throw err;
      }

      let user = await User.findOne({
        email
      });

      if (!user) {
        user = User.create({
          email
        });
      }

      user.salt = originalSalt;
      user.passwordHash = passwordHash;
      user.name = name;
      await user.save();
      resolve();
    });
  });
})();
