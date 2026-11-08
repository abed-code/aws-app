import type { Note } from "../../domain/note";
import { deleteNoteAction } from "../actions";

export function NoteItem({ note }: { note: Note }) {
  return (
    <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium">{note.title}</h2>
          <time className="text-xs text-zinc-500" dateTime={note.createdAt.toISOString()}>
            {note.createdAt.toLocaleString()}
          </time>
        </div>
        <form action={deleteNoteAction}>
          <input type="hidden" name="noteId" value={note.id} />
          <button type="submit" className="text-sm text-zinc-500 hover:text-red-600">
            Delete
          </button>
        </form>
      </div>
      {note.body && <p className="mt-2 whitespace-pre-wrap text-sm">{note.body}</p>}
    </li>
  );
}
