import { Suspense } from "react";
import { UserMenu } from "@/features/auth";
import { NotesSection } from "@/features/notes";

// Pages only compose features; the logic lives in src/features/*.
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Notes</h1>
          <p className="text-sm text-zinc-500">
            A tiny app for learning AWS: auth, database, storage, deploy.
          </p>
        </div>
        {/* Both read the session cookie, so each sits behind a Suspense boundary. */}
        <Suspense fallback={null}>
          <UserMenu />
        </Suspense>
      </header>

      <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
        <NotesSection />
      </Suspense>
    </main>
  );
}
