// Domain: what a note IS and the rules every note obeys, written as Zod schemas.
// Zod is allowed here because it's pure validation: no I/O, framework, database
// or AWS imports (those are blocked by ESLint).
import { z } from "zod";

export const NOTE_TITLE_MAX_LENGTH = 200;
export const NOTE_BODY_MAX_LENGTH = 5000;

/** Note ids are UUIDs; anything else can't refer to a note. */
export const noteIdSchema = z.uuid();
export type NoteId = z.infer<typeof noteIdSchema>;

/** A stored note. Also used to safely read notes back from outside (e.g. a cache). */
export const noteSchema = z.object({
  id: noteIdSchema,
  ownerId: z.string().min(1), // the user who owns the note (Cognito "sub")
  title: z.string(),
  body: z.string(),
  createdAt: z.coerce.date(), // accepts a Date or an ISO string (JSON)
});
export type Note = z.infer<typeof noteSchema>;

// Untrusted text from a form: missing → "", trimmed, cut to `max` characters.
// (The form already limits length, so cutting only catches crafted input.)
const formText = (max: number) =>
  z
    .preprocess((value) => value ?? "", z.string().trim())
    .transform((text) => text.slice(0, max));

/** Rules for a new note, before it's saved. */
export const noteDraftSchema = z.object({
  title: formText(NOTE_TITLE_MAX_LENGTH).pipe(z.string().min(1, "A note needs a title.")),
  body: formText(NOTE_BODY_MAX_LENGTH),
});
/** A validated, normalized note that hasn't been saved yet. */
export type NoteDraft = Readonly<z.infer<typeof noteDraftSchema>>;

export class InvalidNoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidNoteError";
  }
}

/** Builds a NoteDraft from untrusted input; throws InvalidNoteError if a rule is broken. */
export function createNoteDraft(input: { title: unknown; body: unknown }): NoteDraft {
  const result = noteDraftSchema.safeParse(input);
  if (!result.success) {
    throw new InvalidNoteError(result.error.issues[0]?.message ?? "Invalid note.");
  }
  return result.data;
}

export function isNoteId(value: unknown): value is NoteId {
  return noteIdSchema.safeParse(value).success;
}
