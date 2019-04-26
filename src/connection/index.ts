// https://github.com/typeorm/typeorm/blob/master/docs/connection.md
import "reflect-metadata";
import { getConnectionManager, Connection } from "typeorm";
import { join } from "path";

// TODO: more robust retry logic
export async function ConnectPersistence(url: string): Promise<Connection> {
  return new Promise((resolve, _reject) => {
    const connectionManager = getConnectionManager();
    const connection = connectionManager.create({
      type: "postgres",
      url,
      entities: [join(__dirname, "../models/**/*.js")],
      // subscribers: [join(__dirname, "../subscriber/**/*.js")],
      // migrations: [join(__dirname, "../migration/**/*.js")],
      synchronize: true,
    });
    resolve(connection.connect()); // performs connection
  });
}
