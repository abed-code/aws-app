import { getCurrentUser } from "../auth.module";

/** Signed-in user's email + sign-out link. Reads the session: wrap in <Suspense>. */
export async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex flex-col items-end gap-1 text-sm">
      <span className="text-zinc-500">{user.email}</span>
      {/* Plain <a>, not <Link>: this is a full-page redirect to Cognito. */}
      <a href="/auth/logout" className="font-medium hover:underline">
        Sign out
      </a>
    </div>
  );
}
