import fs from "node:fs";
import tls from "node:tls";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so load .env.local ourselves.
config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle", // generated SQL migrations (commit these)
  // Only `drizzle-kit studio` connects. Run it via `pnpm db:studio`, which
  // puts a fresh IAM token in PGPASSWORD. (`generate` works offline.)
  dbCredentials: {
    host: process.env.PGHOST!,
    port: Number(process.env.PGPORT ?? 5432),
    database: process.env.PGDATABASE!,
    user: process.env.PGUSER!,
    password: process.env.PGPASSWORD,
    ssl: {
      ca: [
        ...tls.rootCertificates,
        fs.readFileSync("certs/rds-global-bundle.pem", "utf8"),
      ],
    },
  },
});
