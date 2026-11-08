import { signOut } from "@/features/auth";

export async function GET() {
  return signOut();
}
