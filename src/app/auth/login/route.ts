import * as client from "openid-client";
import { redirect } from "next/navigation";
import { getOidcConfig } from "@/lib/oidc";
import { getSession } from "@/lib/session";

export async function GET() {
  const config = await getOidcConfig();
  const state = client.randomState();
  const codeVerifier = client.randomPKCECodeVerifier();

  const session = await getSession();
  session.oauth = { state, codeVerifier };
  await session.save();

  const url = client.buildAuthorizationUrl(config, {
    redirect_uri: `${process.env.APP_URL}/auth/callback`,
    scope: "openid email",
    state,
    code_challenge: await client.calculatePKCECodeChallenge(codeVerifier),
    code_challenge_method: "S256",
  });
  redirect(url.href);
}