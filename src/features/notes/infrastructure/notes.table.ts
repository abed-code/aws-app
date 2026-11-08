import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Single source of truth for the database. Change this file, then run
// `pnpm db:generate` to produce a SQL migration and `pnpm db:migrate` to apply it.
export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(), // Cognito "sub"
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  // Matches the main query: WHERE user_id = ? ORDER BY created_at DESC
  (t) => [index("notes_user_created_idx").on(t.userId, t.createdAt.desc())],
);

export type Note = typeof notes.$inferSelect;
