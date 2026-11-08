// One-time setup, run as the master user (postgres) with IAM auth:
//   PGUSER=postgres PGDATABASE=postgres pnpm db:bootstrap
// Creates the app's own login (IAM-only) and a database it owns.
// Safe to re-run: every step checks first.
import pg from "pg";
import { dbConfig } from "../src/shared/infrastructure/db/connection";

const APP_USER = "notes_app";
const APP_DB = "notes";

const client = new pg.Client({ ...dbConfig(), connectionTimeoutMillis: 60_000 });
await client.connect();

const exists = async (sql: string, name: string) =>
  (await client.query(sql, [name])).rowCount! > 0;

if (!(await exists("select 1 from pg_roles where rolname = $1", APP_USER))) {
  await client.query(`create user ${APP_USER}`);
  console.log(`created user ${APP_USER}`);
}
// rds_iam = this user can ONLY log in with IAM auth tokens (no password).
await client.query(`grant rds_iam to ${APP_USER}`);
// Lets the master user create a database owned by the app user.
await client.query(`grant ${APP_USER} to current_user`);

if (!(await exists("select 1 from pg_database where datname = $1", APP_DB))) {
  await client.query(`create database ${APP_DB} owner ${APP_USER}`);
  console.log(`created database ${APP_DB} owned by ${APP_USER}`);
}

await client.end();
console.log("Bootstrap done.");
