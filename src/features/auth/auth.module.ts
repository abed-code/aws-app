// Composition root for auth: how the rest of the app asks "who is signed in?".
import type { User } from "./domain/user";
import { getSession } from "./infrastructure/session";

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session.user ?? null;
}
