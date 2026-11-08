import { createNoteDraft, type Note } from "../../domain/note";
import type { NotesRepository } from "../notes-repository";

export function makeCreateNote(notes: NotesRepository) {
  /** Throws InvalidNoteError if the input breaks a note rule. */
  return async function createNote(
    ownerId: string,
    input: { title: unknown; body: unknown },
  ): Promise<Note> {
    const draft = createNoteDraft(input);
    return notes.create(ownerId, draft);
  };
}
