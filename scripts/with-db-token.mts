// Runs a command with PGPASSWORD set to a fresh IAM auth token.
// Usage: tsx --env-file=.env.local scripts/with-db-token.mts drizzle-kit studio
import { spawn } from "node:child_process";
import { getAuthToken } from "../src/db/connection";

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) throw new Error("Usage: with-db-token.ts <command> [args...]");

const token = await getAuthToken();
const child = spawn(cmd, args, {
  stdio: "inherit",
  env: { ...process.env, PGPASSWORD: token },
});
child.on("exit", (code) => process.exit(code ?? 1));
