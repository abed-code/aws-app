// The cache wrapper tested with fakes: an in-memory Cache and a counting
// inner repository. No Valkey or Aurora needed.
import { beforeEach, describe, expect, it } from "vitest";
import type { Cache } from "@/shared/application/cache";
import type { NotesRepository } from "../../application/notes-repository";
import type { Note, NoteDraft } from "../../domain/note";
import { CachedNotesRepository } from "../cached-notes-repository";

class MemoryCache implements Cache {
  store = new Map<string, string>();
  async get(key: string) {
    return this.store.get(key) ?? null;
  }
  async set(key: string, value: string) {
    this.store.set(key, value);
  }
  async delete(key: string) {
    this.store.delete(key);
  }
}

class CountingRepository implements NotesRepository {
  reads = 0;
  notes: Note[] = [];
  async listByOwner(ownerId: string) {
    this.reads++;
    return this.notes.filter((n) => n.ownerId === ownerId);
  }
  async create(ownerId: string, draft: NoteDraft) {
    const note: Note = { id: crypto.randomUUID(), ownerId, ...draft, createdAt: new Date() };
    this.notes.push(note);
    return note;
  }
  async deleteOwned(ownerId: string, noteId: string) {
    this.notes = this.notes.filter((n) => !(n.id === noteId && n.ownerId === ownerId));
  }
}

describe("CachedNotesRepository", () => {
  let cache: MemoryCache;
  let inner: CountingRepository;
  let repo: CachedNotesRepository;

  beforeEach(() => {
    cache = new MemoryCache();
    inner = new CountingRepository();
    repo = new CachedNotesRepository(inner, cache);
  });

  it("serves the second read from the cache, with real Dates", async () => {
    await repo.create("alice", { title: "t", body: "" });
    await repo.listByOwner("alice");
    const second = await repo.listByOwner("alice");
    expect(inner.reads).toBe(1);
    expect(second[0].createdAt).toBeInstanceOf(Date);
  });

  it("drops the cached list after a create or delete", async () => {
    const note = await repo.create("alice", { title: "t", body: "" });
    await repo.listByOwner("alice");
    await repo.deleteOwned("alice", note.id);
    expect(await repo.listByOwner("alice")).toEqual([]);
    expect(inner.reads).toBe(2);
  });

  it("treats corrupted cache data as a miss instead of crashing", async () => {
    await repo.create("alice", { title: "t", body: "" });
    cache.store.set("notes:v2:alice", "{not json");
    expect(await repo.listByOwner("alice")).toHaveLength(1);
    cache.store.set("notes:v2:alice", JSON.stringify([{ id: "bad" }]));
    expect(await repo.listByOwner("alice")).toHaveLength(1);
    expect(inner.reads).toBe(2);
  });
});
