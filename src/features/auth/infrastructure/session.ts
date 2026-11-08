import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { connection } from "next/server";

export type SessionData = {
  user?: { id: string; email: string };
  oauth?: { state: string; codeVerifier: string };
};

export async function getSession() {
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