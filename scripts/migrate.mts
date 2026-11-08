// Applies pending SQL migrations from ./drizzle using IAM auth.
// (drizzle-kit migrate needs a fixed password, which IAM auth doesn't have.)
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../src/shared/infrastructure/db/client";

await migrate(db, { migrationsFolder: "drizzle" });
console.log("Migrations applied.");
await pool.end();
