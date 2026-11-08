import { completeSignIn } from "@/features/auth";

export async function GET(request: Request) {
  return completeSignIn(request);
}
