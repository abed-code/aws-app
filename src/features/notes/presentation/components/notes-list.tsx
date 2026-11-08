import { isAwsCredentialsError } from "@/shared/infrastructure/db/connection";
import { AwsLoginNotice } from "@/shared/presentation/aws-login-notice";
import { notesModule } from "../../notes.module";
import { NoteItem } from "./note-item";

export async function NotesList({ ownerId }: { ownerId: string }) {
  let notes;
  try {
    notes = await notesModule.listNotes(ownerId);
  } catch (err) {
    if (isAwsCredentialsError(err)) return <AwsLoginNotice />;
    throw err;
  }

  if (notes.length === 0) {
    return <p className="text-zinc-500">No notes yet. Add your first one above.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </ul>
  );
}
