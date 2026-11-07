import { getSession } from "@/lib/session";

export type User = {
  id: string;
  email: string;
};

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session.user ?? null;
}
