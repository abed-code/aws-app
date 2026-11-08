// Adapter: NotesRepository implemented with Drizzle on Aurora PostgreSQL.
import { and, desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { NotesRepository } from "../application/notes-repository";
import type { Note, NoteDraft, NoteId } from "../domain/note";
import { notes, type NoteRow } from "./notes.table";

// Database rows and domain notes are kept separate on purpose: the table can
// change (renamed columns, new fields) without the domain noticing.
const toNote = (row: NoteRow): Note => ({
  id: row.id,
  ownerId: row.userId,
  title: row.title,
  body: row.body,
  createdAt: row.createdAt,
});

export class DrizzleNotesRepository implements NotesRepository {
  constructor(private readonly db: NodePgDatabase<Record<string, unknown>>) {}

  async listByOwner(ownerId: string): Promise<Note[]> {
    const rows = await this.db
      .select()
      .from(notes)
      .where(eq(notes.userId, ownerId))
      .orderBy(desc(notes.createdAt));
    return rows.map(toNote);
  }

  async create(ownerId: string, draft: NoteDraft): Promise<Note> {
    const [row] = await this.db
      .insert(notes)
      .values({ userId: ownerId, title: draft.title, body: draft.body })
      .returning();
    return toNote(row);
  }

  async deleteOwned(ownerId: string, noteId: NoteId): Promise<void> {
    // Filtering by owner as well as id: users can only delete their own notes.
    await this.db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, ownerId)));
  }
}
