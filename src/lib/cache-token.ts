import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { Hash } from "@smithy/hash-node";
import { HttpRequest } from "@smithy/protocol-http";
import { buildQueryString } from "@smithy/querystring-builder";
import { SignatureV4 } from "@smithy/signature-v4";

// IAM auth token for ElastiCache (same idea as the RDS signer):
// a SigV4-presigned "connect" request, valid 15 minutes, used as the password.
// Signed with Node's AWS credential chain, which understands `aws login`
// locally and the app's IAM role on AWS.
const credentials = defaultProvider();

export async function createCacheAuthToken(opts: {
  cacheName: string;
  userId: string;
  region: string;
}): Promise<string> {
  const signer = new SignatureV4({
    service: "elasticache",
    region: opts.region,
    credentials,
    sha256: Hash.bind(null, "sha256"),
  });

  const request = new HttpRequest({
    method: "GET",
    protocol: "http:",
    hostname: opts.cacheName, // the cache NAME, not the endpoint
    path: "/",
    query: {
      Action: "connect",
      User: opts.userId,
      ResourceType: "ServerlessCache",
    },
    headers: { host: opts.cacheName },
  });

  const signed = await signer.presign(request, { expiresIn: 900 });
  return `${signed.hostname}${signed.path}?${buildQueryString(signed.query ?? {})}`;
}
