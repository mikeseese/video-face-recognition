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

  app.get("/api/logout", (req, res) => {
    req.logout();
    return res.send();
  });

  app.post("/api/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  }));

  app.options("*", cors());
  app.listen(80, () => {
    console.log(`Listening on http://127.0.0.1:80`);
  });
})();
