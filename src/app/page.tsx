import { Suspense } from "react";
import { getCurrentUser, type User } from "@/lib/auth";
import { listNotes } from "@/lib/notes";
import { createNoteAction, deleteNoteAction } from "./actions";

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
        {/* Reads the session cookie, so it must sit behind a Suspense boundary. */}
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

async function UserMenu() {
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

async function NotesSection() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="rounded-lg border border-zinc-200 p-8 text-center dark:border-zinc-800">
        <p className="mb-4 text-zinc-500">Sign in to see and create your notes.</p>
        <a
          href="/auth/login"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Sign in
        </a>
      </div>
    );
  }

  return (
    <>
      <NewNoteForm />
      <NotesList user={user} />
    </>
  );
}

function NewNoteForm() {
  return (
    <form action={createNoteAction} className="mb-10 flex flex-col gap-3">
      <input
        name="title"
        required
        maxLength={200}
        placeholder="Title"
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
      />
      <textarea
        name="body"
        rows={3}
        maxLength={5000}
        placeholder="Write something…"
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
      />
      <button
        type="submit"
        className="self-end rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Add note
      </button>
    </form>
  );
}

async function NotesList({ user }: { user: User }) {
  const notes = await listNotes(user.id);

  if (notes.length === 0) {
    return <p className="text-zinc-500">No notes yet. Add your first one above.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {notes.map((note) => (
        <li
          key={note.id}
          className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-medium">{note.title}</h2>
              <time className="text-xs text-zinc-500" dateTime={note.createdAt}>
                {new Date(note.createdAt).toLocaleString()}
              </time>
            </div>
            <form action={deleteNoteAction}>
              <input type="hidden" name="noteId" value={note.id} />
              <button
                type="submit"
                className="text-sm text-zinc-500 hover:text-red-600"
              >
                Delete
              </button>
            </form>
          </div>
          {note.body && (
            <p className="mt-2 whitespace-pre-wrap text-sm">{note.body}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
