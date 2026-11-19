import "server-only";

import { Pool, type QueryResultRow } from "pg";

const globalDb = globalThis as typeof globalThis & { atlasPool?: Pool };

function pool() {
  if (!globalDb.atlasPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is missing");
    }

    const atlasPool = new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 2_000,
      idleTimeoutMillis: 30_000,
      statement_timeout: 3_000,
      query_timeout: 3_500,
    });
    atlasPool.on("error", () => {
      console.error("Atlas PostgreSQL idle connection failed");
    });
    globalDb.atlasPool = atlasPool;
  }

  return globalDb.atlasPool;
}

export class DatabaseUnavailable extends Error {
  constructor() {
    super("Atlas PostgreSQL query failed");
  }
}

export async function query<Row extends QueryResultRow>(
  statement: string,
  values: (string | number)[],
) {
  try {
    return (await pool().query<Row>(statement, values)).rows;
  } catch {
    throw new DatabaseUnavailable();
  }
}
