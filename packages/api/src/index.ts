import { json } from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import express from "express";
import "reflect-metadata";
import { ConnectPersistence } from "@video-face-recognition/persistence";

dotenv.config();

import { middleware as expressMiddleware } from "./express";
import { init as initializePassport } from "./passport";

const dbConnectionString =
  process.env.VFR_POSTGRESDB_CONNECTION_STRING ||
  `postgresql://postgres:postgres@vfr-persistence:5432/vfr`;

(async () => {
  const typeORM = await ConnectPersistence(dbConnectionString);

  initializePassport(passport);

  const app = express();
  app.use(json());
  app.use(cors());
  app.use(expressMiddleware(typeORM));
  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/api/account", (req, res) => {
    if (!req.user || !req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    res.setHeader("Content-Type", "application/json");

    // dont send the password hash or salt down
    res.send(JSON.stringify({
      user: req.user
    }));
  })

  app.get("/api/logout", (req, res) => {
    req.logout();
    return res.redirect("/");
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }

      if (!user) {
        return res.sendStatus(401);
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error(err);
          return res.sendStatus(500);
        }

        res.setHeader("Content-Type", "application/json");

        // dont send the password hash or salt down
        res.send(JSON.stringify({
          user: {
            email: user.email,
            id: user.id,
            name: user.name,
          }
        }));
      });
    })(req, res, next);
  });

  app.options("*", cors());
  app.listen(80, () => {
    console.log(`Listening on http://127.0.0.1:80`);
  });
})();
