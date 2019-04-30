import { PassportStatic } from "passport";
import { Strategy, IVerifyOptions } from "passport-local";
import "reflect-metadata";
import { User } from "@video-face-recognition/persistence";

const easyPbkdf2 = require("easy-pbkdf2")();

export function init(passport: PassportStatic) {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  passport.use(new Strategy({
      usernameField: "email",
      passwordField: "password"
    }, async (email: string, password: string, done: (error: any, user?: any, options?: IVerifyOptions) => void) => {
      const user = await User.findOne({
        email
      });

      if (!user) {
        return done(null, false, { message: "Invalid email." });
      }

      easyPbkdf2.verify(user.salt, user.passwordHash, password, (err, valid) => {
        if (err) {
          done(null, false, { message: err });
        }
        else if (!valid) {
          done(null, false, { message: "Invalid password." })
        }
        else {
          done(null, user);
        }
      });
  }));
}
