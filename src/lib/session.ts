import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { connection } from "next/server";

export type SessionData = {
  user?: { id: string; email: string };
  oauth?: { state: string; codeVerifier: string }; // only during sign-in
};

export async function getSession() {
  // Decrypting the cookie checks its expiry with Date.now(), so this must run
  // per request, never during prerendering (even when cookies are known then).
  await connection();
  return getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: "notes_session",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax", // must be "lax" so the cookie survives the redirect back from Cognito
      secure: process.env.NODE_ENV === "production",
    },
  });
}