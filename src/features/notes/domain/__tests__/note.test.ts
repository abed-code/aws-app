import { describe, expect, it } from "vitest";
import {
  createNoteDraft,
  InvalidNoteError,
  isNoteId,
  NOTE_BODY_MAX_LENGTH,
  NOTE_TITLE_MAX_LENGTH,
} from "./note";

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
});

describe("isNoteId", () => {
  it("accepts UUIDs only", () => {
    expect(isNoteId("cbee56bc-8257-47a4-ab03-a7242bac0520")).toBe(true);
    expect(isNoteId("not-a-uuid")).toBe(false);
    expect(isNoteId(42)).toBe(false);
  });
});
