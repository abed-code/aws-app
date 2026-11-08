import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { dbConfig } from "./connection";
import * as schema from "./schema";

// One connection pool per server process. Kept on globalThis so hot reloads
// in `next dev` reuse it instead of opening new connections each time.
const g = globalThis as { __pgPool?: Pool };

export const pool = (g.__pgPool ??= new Pool({
  ...dbConfig(),
  max: 5,
  // Aurora Serverless v2 at 0 ACU auto-pauses; resuming can take 15-30s+.
  connectionTimeoutMillis: 60_000,
}));

export const db = drizzle({ client: pool, schema });
