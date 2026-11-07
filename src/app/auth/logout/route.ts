import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  session.destroy();

  const url = new URL(`${process.env.COGNITO_DOMAIN}/logout`);
  url.searchParams.set("client_id", process.env.COGNITO_CLIENT_ID!);
  url.searchParams.set("logout_uri", process.env.APP_URL!);
  redirect(url.href);
}