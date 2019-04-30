import "reflect-metadata";
import session from "express-session";
import { TypeormStore } from "typeorm-store";
import { Connection } from "typeorm";
import { Session } from "@video-face-recognition/persistence";

export function middleware(typeORM: Connection) {
  if (
    typeof process.env.VFR_SESSION_SECRET !== "string" ||
    process.env.VFR_SESSION_SECRET === ""
  ) {
    throw new Error(
      `The VFR_SESSION_SECRET environment variable must be set to a non-empty string! It's currently: ${
        process.env.VFR_SESSION_SECRET
      }`
    );
  }
  const repository = typeORM.getRepository(Session);
  return session({
      store: new TypeormStore({ repository }),
      resave: false,

      secret: process.env.VFR_SESSION_SECRET || "",
      saveUninitialized: false,
    });
}
