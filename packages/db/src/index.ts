import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export function createDb(dbUrl: string) {
  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle({
    client: pool,
    schema,
    casing: "snake_case",
  });

  return {
    db,
    pool,
    close: () => pool.end(),
  };
}

export type DbClient = ReturnType<typeof createDb>["db"];

export * from "./schema";
