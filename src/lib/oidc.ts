import * as client from 'openid-client';

let config: Promise<client.Configuration> | undefined;

export function getOidcConfig() {
  config ??= client.discovery(
    new URL(process.env.COGNITO_ISSUER!),
    process.env.COGNITO_CLIENT_ID!,
    process.env.COGNITO_CLIENT_SECRET!,
  )

  return config;
}