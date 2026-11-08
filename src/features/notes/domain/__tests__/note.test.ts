import { describe, expect, it } from "vitest";
import {
  createNoteDraft,
  InvalidNoteError,
  isNoteId,
  NOTE_BODY_MAX_LENGTH,
  NOTE_TITLE_MAX_LENGTH,
  noteSchema,
} from "../note";

describe("createNoteDraft", () => {
  it("trims the title and body", () => {
    expect(createNoteDraft({ title: "  Hi  ", body: "  there \n" })).toEqual({
      title: "Hi",
      body: "there",
    });
  });

  it("requires a title", () => {
    expect(() => createNoteDraft({ title: "   ", body: "x" })).toThrow(InvalidNoteError);
    expect(() => createNoteDraft({ title: null, body: "x" })).toThrow(InvalidNoteError);
  });

  it("cuts over-long text to the maximum length", () => {
    const draft = createNoteDraft({
      title: "t".repeat(NOTE_TITLE_MAX_LENGTH + 50),
      body: "b".repeat(NOTE_BODY_MAX_LENGTH + 50),
    });
    expect(draft.title).toHaveLength(NOTE_TITLE_MAX_LENGTH);
    expect(draft.body).toHaveLength(NOTE_BODY_MAX_LENGTH);
  });

  it("treats a missing body as empty", () => {
    expect(createNoteDraft({ title: "T", body: undefined }).body).toBe("");
  });

  it("rejects input that isn't text (e.g. an uploaded file)", () => {
    expect(() => createNoteDraft({ title: new Blob(["x"]), body: "" })).toThrow(
      InvalidNoteError,
    );
    expect(() => createNoteDraft({ title: 42, body: "" })).toThrow(InvalidNoteError);
  });

  it("explains which rule failed", () => {
    expect(() => createNoteDraft({ title: "", body: "" })).toThrow("A note needs a title.");
  });
});

describe("noteSchema", () => {
  it("reads a note back from JSON, turning the date string into a Date", () => {
    const note = noteSchema.parse({
      id: "cbee56bc-8257-47a4-ab03-a7242bac0520",
      ownerId: "alice",
      title: "t",
      body: "",
      createdAt: "2026-11-08T13:00:00.000Z",
    });
    expect(note.createdAt).toBeInstanceOf(Date);
  });

  it("rejects malformed notes", () => {
    expect(noteSchema.safeParse({ id: "nope", ownerId: "alice" }).success).toBe(false);
  });
});

describe("isNoteId", () => {
  it("accepts UUIDs only", () => {
    expect(isNoteId("cbee56bc-8257-47a4-ab03-a7242bac0520")).toBe(true);
    expect(isNoteId("not-a-uuid")).toBe(false);
    expect(isNoteId(42)).toBe(false);
  });
});
