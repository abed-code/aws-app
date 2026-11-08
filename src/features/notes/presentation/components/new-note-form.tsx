import { NOTE_BODY_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from "../../domain/note";
import { createNoteAction } from "../actions";

export function NewNoteForm() {
  return (
    <form action={createNoteAction} className="mb-10 flex flex-col gap-3">
      <input
        name="title"
        required
        maxLength={NOTE_TITLE_MAX_LENGTH}
        placeholder="Title"
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
      />
      <textarea
        name="body"
        rows={3}
        maxLength={NOTE_BODY_MAX_LENGTH}
        placeholder="Write something…"
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
      />
      <button
        type="submit"
        className="self-end rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Add note
      </button>
    </form>
  );
}
