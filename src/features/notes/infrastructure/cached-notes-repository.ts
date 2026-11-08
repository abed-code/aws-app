// Adapter: wraps any NotesRepository with a cache in front of the notes list
// ("cache-aside"). Reads try the cache first; writes go to the inner
// repository and then drop the cached list.
import type { Cache } from "@/shared/application/cache";
import type { NotesRepository } from "../application/notes-repository";
import { noteSchema, type Note, type NoteDraft, type NoteId } from "../domain/note";

// "v2": the cached shape changed (ownerId instead of userId), so old "v1"
// entries are simply never read again and expire on their own.
const listKey = (ownerId: string) => `notes:v2:${ownerId}`;
const LIST_TTL_SECONDS = 180; // 3 minutes; caps staleness if a delete is ever missed

const cachedNotesSchema = noteSchema.array();

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export class CachedNotesRepository implements NotesRepository {
  constructor(
    private readonly inner: NotesRepository,
    private readonly cache: Cache,
  ) {}

  async listByOwner(ownerId: string): Promise<Note[]> {
    const cached = await this.cache.get(listKey(ownerId));
    if (cached) {
      // Validate with the domain schema (it also turns JSON date strings back
      // into Dates). Anything unexpected is treated as a miss, not a crash.
      const parsed = cachedNotesSchema.safeParse(safeJson(cached));
      if (parsed.success) return parsed.data;
    }

    const notes = await this.inner.listByOwner(ownerId);
    await this.cache.set(listKey(ownerId), JSON.stringify(notes), LIST_TTL_SECONDS);
    return notes;
  }

  async create(ownerId: string, draft: NoteDraft): Promise<Note> {
    const note = await this.inner.create(ownerId, draft);
    await this.cache.delete(listKey(ownerId));
    return note;
  }

  async deleteOwned(ownerId: string, noteId: NoteId): Promise<void> {
    await this.inner.deleteOwned(ownerId, noteId);
    await this.cache.delete(listKey(ownerId));
  }
}
