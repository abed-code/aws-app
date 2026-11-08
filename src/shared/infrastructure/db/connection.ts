import fs from "node:fs";
import path from "node:path";
import tls from "node:tls";
import { Signer } from "@aws-sdk/rds-signer";
import type { PoolConfig } from "pg";

// IAM database authentication: instead of a stored password, every new
// connection gets a fresh token (valid 15 min) signed with our AWS identity.
// Locally that identity is your AWS CLI login; on AWS it is the app's IAM role.
const signer = new Signer({
  hostname: process.env.PGHOST!,
  port: Number(process.env.PGPORT ?? 5432),
  username: process.env.PGUSER!,
  region: process.env.AWS_REGION ?? "us-east-1",
});

export const AWS_LOGIN_HINT =
  "AWS credentials are missing or expired. Run `aws login --region us-east-1`, then reload the page.";

// Thrown when we can't sign a DB token, almost always because the local
// `aws login` session expired (or, on AWS, the app has no IAM role).
export class AwsCredentialsError extends Error {
  constructor(cause: unknown) {
    super(AWS_LOGIN_HINT, { cause });
    this.name = "AwsCredentialsError";
  }
}

// Drizzle and pg wrap errors (error.cause), so search the whole chain.
export function isAwsCredentialsError(err: unknown): boolean {
  for (let e = err; e instanceof Error; e = e.cause) {
    if (e.name === "AwsCredentialsError") return true;
  }
  return false;
}

async function signToken(): Promise<string> {
  try {
    return await signer.getAuthToken();
  } catch (err) {
    console.error(`[db] ${AWS_LOGIN_HINT}\n     cause: ${(err as Error).message}`);
    throw new AwsCredentialsError(err);
  }
}

export function dbConfig(): PoolConfig {
  return {
    // host, port, database and user come from the PG* env vars.
    password: signToken,
    // Verify the server certificate. Trust Node's public roots (Aurora can
    // present an Amazon Root CA 1 chain) plus the RDS-specific CA bundle.
    ssl: {
      ca: [
        ...tls.rootCertificates,
        fs.readFileSync(
          path.join(process.cwd(), "certs/rds-global-bundle.pem"),
          "utf8",
        ),
      ],
    },
  };
}

export function getAuthToken() {
  return signToken();
}
