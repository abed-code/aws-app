import { getCurrentUser, SignInPrompt } from "@/features/auth";
import { NewNoteForm } from "./new-note-form";
import { NotesList } from "./notes-list";

/** The whole notes area. Reads the session: wrap in <Suspense>. */
export async function NotesSection() {
  const user = await getCurrentUser();
  if (!user) return <SignInPrompt message="Sign in to see and create your notes." />;

  return (
    <>
      <NewNoteForm />
      <NotesList ownerId={user.id} />
    </>
  );
}
