import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { notes, rawNotes, rawNotesToNotes } from "~/server/db/schema";
import { enrichRawNotes } from "./enrich-raw-note";
import { isNull, lt, eq } from "drizzle-orm";

// TODO: update the schema for the events types multi tags (one to many), same for sectors (but that a one to one)
// TODO: create endpoints to get the select options
// TODO: when creating raw note, we should create the relation table with an empty note id, and have isConfiremd false, and isAIEnriched false, isGeoEnriched false
// TODO: add an RTL toggle for the whole site
export const notesRouter = createTRPCRouter({
  getUnconfirmed: publicProcedure
    .input(z.object({
      cursor: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const cursor = input.cursor ?? 0;

      // FIXME:
      const unconfirmedNotes = await ctx.db
        .select({
          rawNote: rawNotes,
          note: notes,
          relation: rawNotesToNotes,
        })
        .from(rawNotesToNotes)
        .innerJoin(rawNotes, eq(rawNotesToNotes.rawNoteId, rawNotes.id))
        .innerJoin(notes, eq(rawNotesToNotes.noteId, notes.id))
        .where(eq(rawNotesToNotes.isConfirmed, false))
        .limit(limit + 1)
        .offset(cursor);

      const hasMore = unconfirmedNotes.length > limit;
      const items = hasMore ? unconfirmedNotes.slice(0, -1) : unconfirmedNotes;

      return {
        items: items.map(({ rawNote, note, relation }) => ({
          rawNote,
          note,
          relation,
        })),
        nextCursor: hasMore ? cursor + limit : undefined,
        hasMore,
      };
    }),
  saveRawNotes: publicProcedure
    .input(z.array(z.object({ value: z.string() })))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(rawNotes).values(input);
    }),
  enrichRawNotes,
  create: publicProcedure
    .input(z.object({
      description: z.string(),
      date: z.string().optional(),
      time: z.string().optional(),
      // tags
      eventType: z.array(z.string()).optional(),
      sector: z.string().optional(),
      location: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(notes).values({
        description: input.description,
        date: input.date,
        time: input.time,
        eventType: input.eventType?.join(","),
        sector: input.sector,
        location: input.location,
        lat: input.lat,
        lng: input.lng,
      });
    }),
  updateAndConfirm: publicProcedure
    .input(z.object({
      noteId: z.number(),
      description: z.string(),
      date: z.string().optional(),
      time: z.string().optional(),
      // tags
      eventType: z.array(z.string()).optional(),
      sector: z.string().optional(),
      location: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(notes).set({
        description: input.description,
        date: input.date,
        time: input.time,
        eventType: input.eventType?.join(","),
        sector: input.sector,
        location: input.location,
        lat: input.lat,
        lng: input.lng,
      }).where(eq(notes.id, input.noteId));
      await ctx.db.update(rawNotesToNotes).set({
        isConfirmed: true,
      }).where(eq(rawNotesToNotes.noteId, input.noteId));
    }),
});
