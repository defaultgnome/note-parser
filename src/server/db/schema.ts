// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import { primaryKey, real, sqliteTableCreator } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `note-parser_${name}`);

export const rawNotes = createTable("raw_note", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  value: d.text().notNull(),
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
}));

export const notes = createTable("note", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  sector: d.text(),
  location: d.text(),
  lat: real("lat"),
  lng: real("lng"),
  date: d.text(),
  time: d.text(),
  description: d.text().notNull(),
  eventType: d.text(),
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
}));

export const rawNotesToNotes = createTable(
  "raw_notes_to_notes",
  (d) => ({
    rawNoteId: d
      .integer("raw_note_id", { mode: "number" })
      .notNull()
      .references(() => rawNotes.id, { onDelete: "cascade" }),
    noteId: d
      .integer("note_id", { mode: "number" })
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    isConfirmed: d
      .integer("is_confirmed", { mode: "boolean" })
      .default(false)
      .notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.rawNoteId, t.noteId] }),
  }),
);

export const rawNotesRelations = relations(rawNotes, ({ many }) => ({
  notes: many(rawNotesToNotes),
}));

export const notesRelations = relations(notes, ({ many }) => ({
  rawNotes: many(rawNotesToNotes),
}));

export const rawNotesToNotesRelations = relations(
  rawNotesToNotes,
  ({ one }) => ({
    rawNote: one(rawNotes, {
      fields: [rawNotesToNotes.rawNoteId],
      references: [rawNotes.id],
    }),
    note: one(notes, {
      fields: [rawNotesToNotes.noteId],
      references: [notes.id],
    }),
  }),
);
