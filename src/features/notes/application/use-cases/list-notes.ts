import type { Note } from "../../domain/note";
import type { NotesRepository } from "../notes-repository";

export function makeListNotes(notes: NotesRepository) {
  return function listNotes(ownerId: string): Promise<Note[]> {
    return notes.listByOwner(ownerId);
  };
}
