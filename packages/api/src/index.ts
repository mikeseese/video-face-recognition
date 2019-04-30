import { json } from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import express from "express";
import "reflect-metadata";
import { ConnectPersistence, AccessLog } from "@video-face-recognition/persistence";

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

  app.post("/api/gather", (req, res) => {
    //
  });

  app.post("/api/train", (req, res) => {
    //
  });

  app.get("/api/logs", async (req, res) => {
    if (!req.user || !req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const per_page = parseInt(req.query.per_page);
    const page = parseInt(req.query.page);
    const total = await AccessLog.count();
    const last_page = Math.ceil(total / per_page);
    const logs = await AccessLog.find({
      skip: per_page * (page - 1),
      take: per_page,
      order: {
        timestamp: "DESC"
      }
    });

    res.setHeader("Content-Type", "application/json");

    res.send(JSON.stringify({
      total,
      per_page,
      current_page: page,
      last_page,
      next_page_url: `\/api\/logs?&per_page=${per_page}&page=${page + 1 > last_page ? null : page + 1}`,
      prev_page_url: `\/api\/logs?&per_page=${per_page}&page=${page - 1 < 1 ? null : page - 1}`,
      from: (page - 1) * per_page + 1,
      to: page === last_page ? total : (per_page * page),
      data: logs
    }));
    // ?page=2&per_page=30
    // {
    //   "total": 200,
    //   "per_page": 30,
    //   "current_page": 2,
    //   "last_page": 7,
    //   "next_page_url": "https:\/\/vuetable.ratiw.net\/api\/users?filter=&per_page=30&page=3",
    //   "prev_page_url": "https:\/\/vuetable.ratiw.net\/api\/users?filter=&per_page=30&page=1",
    //   "from": 31,
    //   "to": 60,
    //   "data": [
    //     {
    //       "badgeColumn" ?
    //       "id": 31,
    //       "name": "Dr. Gilbert Ward",
    //       "nickname": "dolorum",
    //       "email": "sandrine06@example.net",
    //       "birthdate": "1984-08-22 00:00:00",
    //       "gender": "F",
    //       "salary": "16644.00",
    //       "group_id": 1,
    //       "created_at": "2017-01-01 07:21:10",
    //       "updated_at": "2017-01-01 07:21:10",
    //       "age": 34,
    //       "group": {
    //         "id": 1,
    //         "name": "Admin",
    //         "description": "Administrators"
    //       },
    //       "address": {
    //         "id": 31,
    //         "user_id": 31,
    //         "line1": "996 Schuppe Glen\nTurcottetown, ID 40821-7190",
    //         "line2": "Thailand",
    //         "zipcode": "09965-7576",
    //         "mobile": "1-938-263-0257x47178",
    //         "fax": "1-997-727-3198x4363"
    //       }
    //     },
    //   ]
    // }
  });

  app.options("*", cors());
  app.listen(80, () => {
    console.log(`Listening on http://127.0.0.1:80`);
  });
})();
