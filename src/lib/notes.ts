// Notes data layer. The UI and server actions only talk to these functions,
// so we can swap the storage behind them without touching anything else.
//
// STEP 1: in-memory store (data is lost when the server restarts).
// STEP 3 replaces this with PostgreSQL on Amazon RDS.

export type Note = {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string; // ISO timestamp
};

// Keep the store on globalThis so it survives hot reloads in `next dev`.
const store: Map<string, Note> = ((
  globalThis as { __notes?: Map<string, Note> }
).__notes ??= new Map());

export async function listNotes(userId: string): Promise<Note[]> {
  return [...store.values()]
    .filter((note) => note.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createNote(
  userId: string,
  input: { title: string; body: string },
): Promise<Note> {
  const note: Note = {
    id: crypto.randomUUID(),
    userId,
    title: input.title,
    body: input.body,
    createdAt: new Date().toISOString(),
  };
  store.set(note.id, note);
  return note;
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const note = store.get(noteId);
  // Only the owner may delete a note.
  if (note?.userId === userId) store.delete(noteId);
}
