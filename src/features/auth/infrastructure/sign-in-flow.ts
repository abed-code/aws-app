// The OpenID Connect "authorization code + PKCE" flow with Amazon Cognito.
// Route handlers in src/app/auth/* just call these.
import * as client from "openid-client";
import { redirect } from "next/navigation";
import { getOidcConfig } from "./oidc";
import { getSession } from "./session";

/** /auth/login: remember state + PKCE secret, then send the user to Cognito. */
export async function beginSignIn(): Promise<never> {
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

/** /auth/callback: exchange the code for tokens and store the user in the session. */
export async function completeSignIn(request: Request): Promise<never> {
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

/** /auth/logout: end our session, then Cognito's. */
export async function signOut(): Promise<never> {
  const session = await getSession();
  session.destroy();

  const url = new URL(`${process.env.COGNITO_DOMAIN}/logout`);
  url.searchParams.set("client_id", process.env.COGNITO_CLIENT_ID!);
  url.searchParams.set("logout_uri", process.env.APP_URL!);
  redirect(url.href);
}
