// Use cases tested with an in-memory fake repository: no Aurora, no Valkey,
// no AWS login. That's the payoff of depending on the NotesRepository port.
import { beforeEach, describe, expect, it } from "vitest";
import { InvalidNoteError, type Note, type NoteDraft } from "../../domain/note";
import type { NotesRepository } from "../notes-repository";
import { makeCreateNote } from "./create-note";
import { makeDeleteNote } from "./delete-note";
import { makeListNotes } from "./list-notes";

class InMemoryNotesRepository implements NotesRepository {
  notes: Note[] = [];
  private clock = 0;

  async listByOwner(ownerId: string) {
    return this.notes
      .filter((n) => n.ownerId === ownerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async create(ownerId: string, draft: NoteDraft) {
    const note: Note = {
      id: crypto.randomUUID(),
      ownerId,
      ...draft,
      createdAt: new Date(++this.clock),
    };
    this.notes.push(note);
    return note;
  }
  async deleteOwned(ownerId: string, noteId: string) {
    this.notes = this.notes.filter((n) => !(n.id === noteId && n.ownerId === ownerId));
  }
}

describe("notes use cases", () => {
  let repo: InMemoryNotesRepository;
  let listNotes: ReturnType<typeof makeListNotes>;
  let createNote: ReturnType<typeof makeCreateNote>;
  let deleteNote: ReturnType<typeof makeDeleteNote>;

  beforeEach(() => {
    repo = new InMemoryNotesRepository();
    listNotes = makeListNotes(repo);
    createNote = makeCreateNote(repo);
    deleteNote = makeDeleteNote(repo);
  });

  it("creates a note for its owner and lists newest first", async () => {
    await createNote("alice", { title: "first", body: "" });
    await createNote("alice", { title: "second", body: "" });
    expect((await listNotes("alice")).map((n) => n.title)).toEqual(["second", "first"]);
  });

  it("validates input before saving", async () => {
    await expect(createNote("alice", { title: "  ", body: "x" })).rejects.toThrow(
      InvalidNoteError,
    );
    expect(repo.notes).toHaveLength(0);
  });

  it("never shows one user's notes to another", async () => {
    await createNote("alice", { title: "private", body: "" });
    expect(await listNotes("bob")).toEqual([]);
  });

  it("lets only the owner delete a note", async () => {
    const note = await createNote("alice", { title: "mine", body: "" });
    await deleteNote("bob", note.id);
    expect(await listNotes("alice")).toHaveLength(1);
    await deleteNote("alice", note.id);
    expect(await listNotes("alice")).toHaveLength(0);
  });

  it("ignores ids that aren't valid note ids", async () => {
    await createNote("alice", { title: "keep", body: "" });
    await expect(deleteNote("alice", "not-a-uuid")).resolves.toBeUndefined();
    await expect(deleteNote("alice", null)).resolves.toBeUndefined();
    expect(await listNotes("alice")).toHaveLength(1);
  });
});
