// Notes data layer: Aurora PostgreSQL (via Drizzle) is the source of truth,
// with a Valkey cache in front of the notes list ("cache-aside" pattern).

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes, type Note } from "@/db/schema";
import { cacheDelete, cacheGet, cacheSet } from "@/lib/cache";

export type { Note } from "@/db/schema";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One key per user. "v1" lets us change the cached shape later without
// reading old entries. The TTL caps how stale a missed invalidation can be.
const listKey = (userId: string) => `notes:v1:${userId}`;
const LIST_TTL_SECONDS = 180; // 3 minutes

export async function listNotes(userId: string): Promise<Note[]> {
  // 1. Try the cache.
  const cached = await cacheGet(listKey(userId));
  
  if (cached) {
    console.log("listNotes cache hit");
    // JSON turns Dates into strings; turn them back.
    return (JSON.parse(cached) as Note[]).map((n) => ({
      ...n,
      createdAt: new Date(n.createdAt),
    }));
  }

  console.log("listNotes cache miss");

  // 2. Miss: read from Aurora, then fill the cache for next time.
  const rows = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.createdAt));
  await cacheSet(listKey(userId), JSON.stringify(rows), LIST_TTL_SECONDS);
  return rows;
}

export async function createNote(
  userId: string,
  input: { title: string; body: string },
) {
  const [note] = await db
    .insert(notes)
    .values({ userId, title: input.title, body: input.body })
    .returning();
  await cacheDelete(listKey(userId)); // the cached list is now out of date
  return note;
}

export async function deleteNote(userId: string, noteId: string) {
  // A malformed id would make Postgres throw; it can't match any note anyway.
  if (!UUID_RE.test(noteId)) return;

  // Filtering by owner as well as id: users can only delete their own notes.
  await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
  await cacheDelete(listKey(userId));
}
