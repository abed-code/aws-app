// Domain: what a note IS and the rules every note obeys.
// Pure TypeScript: no framework, database, or AWS imports (enforced by ESLint).

export type NoteId = string;

export type Note = {
  id: NoteId;
  ownerId: string; // the user who owns the note (Cognito "sub")
  title: string;
  body: string;
  createdAt: Date;
};

export const NOTE_TITLE_MAX_LENGTH = 200;
export const NOTE_BODY_MAX_LENGTH = 5000;

/** A validated, normalized note that hasn't been saved yet. */
export type NoteDraft = {
  readonly title: string;
  readonly body: string;
};

export class InvalidNoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidNoteError";
  }
}

/**
 * Builds a NoteDraft from untrusted input (e.g. a form).
 * Rules: text is trimmed; a title is required; over-long text is cut to the
 * maximum length (the form already limits it, so this only catches crafted input).
 */
export function createNoteDraft(input: { title: unknown; body: unknown }): NoteDraft {
  const title = String(input.title ?? "").trim();
  const body = String(input.body ?? "").trim();

  if (!title) throw new InvalidNoteError("A note needs a title.");

  return {
    title: title.slice(0, NOTE_TITLE_MAX_LENGTH),
    body: body.slice(0, NOTE_BODY_MAX_LENGTH),
  };
}

const NOTE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Note ids are UUIDs; anything else can't refer to a note. */
export function isNoteId(value: unknown): value is NoteId {
  return typeof value === "string" && NOTE_ID_PATTERN.test(value);
}
