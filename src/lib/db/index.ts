import {
  Kysely,
  PostgresDialect,
  MysqlDialect,
  SqliteDialect,
} from "kysely";
import type { Database } from "./schema";
import { createTables } from "./migrate";

type Dialect = "postgres" | "mysql" | "sqlite";

let _db: Kysely<Database> | null = null;
let _dbInitPromise: Promise<void> | null = null;

function createDialect(dialect: Dialect, url: string) {
  switch (dialect) {
    case "postgres": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Pool } = require("pg");
      return new PostgresDialect({ pool: new Pool({ connectionString: url }) });
    }
    case "mysql": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mysql = require("mysql2");
      return new MysqlDialect({ pool: mysql.createPool(url) });
    }
    case "sqlite": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const BetterSqlite3 = require("better-sqlite3");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("node:fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pathModule = require("node:path");
      const path = url.replace(/^file:/, "");
      const directory = pathModule.dirname(path);

      if (directory && directory !== ".") {
        fs.mkdirSync(directory, { recursive: true });
      }

      return new SqliteDialect({ database: new BetterSqlite3(path) });
    }
  }
}

export function getDb(): Kysely<Database> {
  if (_db) return _db;

  const dialect = (process.env.DATABASE_DIALECT || "sqlite") as Dialect;
  const url = process.env.DATABASE_URL || "file:./data/awesome-qr.db";

  _db = new Kysely<Database>({ dialect: createDialect(dialect, url) });
  return _db;
}

export async function ensureDbReady(): Promise<Kysely<Database>> {
  const db = getDb();

  if (!_dbInitPromise) {
    _dbInitPromise = createTables(db);
  }

  await _dbInitPromise;
  return db;
}
