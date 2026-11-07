import * as client from "openid-client";
import { redirect } from "next/navigation";
import { getOidcConfig } from "@/lib/oidc";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const config = await getOidcConfig();
  const session = await getSession();
  const pending = session.oauth;
  if (!pending) redirect("/");

  const tokens = await client.authorizationCodeGrant(config, new URL(request.url), {
    pkceCodeVerifier: pending.codeVerifier,
    expectedState: pending.state, // rejects forged callbacks (CSRF)
  });
  const claims = tokens.claims()!;

  session.user = { id: claims.sub, email: String(claims.email) };
  delete session.oauth;
  await session.save();
  redirect("/");
}