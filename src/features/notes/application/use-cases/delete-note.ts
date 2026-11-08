import { isNoteId } from "../../domain/note";
import type { NotesRepository } from "../notes-repository";

export function makeDeleteNote(notes: NotesRepository) {
  return async function deleteNote(ownerId: string, noteId: unknown): Promise<void> {
    // Not a valid id: it can't match any note, so there's nothing to delete.
    if (!isNoteId(noteId)) return;
    await notes.deleteOwned(ownerId, noteId);
  };
}
