// Port: what the notes use cases need from storage. Infrastructure implements
// it (Drizzle/Aurora, plus a caching wrapper); use cases only see this interface.
import type { Note, NoteDraft, NoteId } from "../domain/note";

export interface NotesRepository {
  /** All notes owned by `ownerId`, newest first. */
  listByOwner(ownerId: string): Promise<Note[]>;
  create(ownerId: string, draft: NoteDraft): Promise<Note>;
  /** Deletes the note only if `ownerId` owns it; otherwise does nothing. */
  deleteOwned(ownerId: string, noteId: NoteId): Promise<void>;
}
