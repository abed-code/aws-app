// Composition root for the notes feature: the ONE place that picks concrete
// adapters and plugs them into the use cases. Swap storage or the cache here
// and nothing else changes.
import { valkeyCache } from "@/shared/infrastructure/cache/valkey-cache";
import { db } from "@/shared/infrastructure/db/client";
import { makeCreateNote } from "./application/use-cases/create-note";
import { makeDeleteNote } from "./application/use-cases/delete-note";
import { makeListNotes } from "./application/use-cases/list-notes";
import { CachedNotesRepository } from "./infrastructure/cached-notes-repository";
import { DrizzleNotesRepository } from "./infrastructure/drizzle-notes-repository";

const repository = new CachedNotesRepository(
  new DrizzleNotesRepository(db),
  valkeyCache,
);

export const notesModule = {
  listNotes: makeListNotes(repository),
  createNote: makeCreateNote(repository),
  deleteNote: makeDeleteNote(repository),
};
