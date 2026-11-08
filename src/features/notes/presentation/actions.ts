"use server";

import { refresh } from "next/cache";
import { getCurrentUser } from "@/features/auth";
import {
  AWS_LOGIN_HINT,
  isAwsCredentialsError,
} from "@/shared/infrastructure/db/connection";
import { InvalidNoteError } from "../domain/note";
import { notesModule } from "../notes.module";

// Server Actions are reachable by direct POST requests, so every action
// resolves the user itself and never trusts form input for it.

export async function createNoteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    await notesModule.createNote(user.id, {
      title: formData.get("title"),
      body: formData.get("body"),
    });
  } catch (err) {
    // The form already requires a title; a crafted empty one is just ignored.
    if (err instanceof InvalidNoteError) return;
    throw toClearError(err);
  }
  refresh();
}

export async function deleteNoteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    await notesModule.deleteNote(user.id, formData.get("noteId"));
  } catch (err) {
    throw toClearError(err);
  }
  refresh();
}

// Replace the generic "Failed query" error with the actual fix.
function toClearError(err: unknown): unknown {
  return isAwsCredentialsError(err) ? new Error(AWS_LOGIN_HINT) : err;
}
