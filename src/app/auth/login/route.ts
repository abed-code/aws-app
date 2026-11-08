import { beginSignIn } from "@/features/auth";

export async function GET() {
  return beginSignIn();
}
