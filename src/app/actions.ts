"use server";

import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import * as notes from "@/lib/notes";

// Server Actions are reachable by direct POST requests,
// so every action resolves the user itself and never trusts form input for it.

export async function createNoteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) return;

  await notes.createNote(user.id, {
    title: title.slice(0, 200),
    body: body.slice(0, 5000),
  });
  refresh();
}

export async function deleteNoteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const noteId = String(formData.get("noteId") ?? "");
  if (!noteId) return;

  await notes.deleteNote(user.id, noteId);
  refresh();
}
