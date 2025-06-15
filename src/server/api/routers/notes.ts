import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { rawNotes } from "~/server/db/schema";

export const notesRouter = createTRPCRouter({
  saveRawNotes: publicProcedure
    .input(z.array(z.object({ value: z.string() })))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(rawNotes).values(input);
    }),
  enrichRawNotes: publicProcedure
    .input(z.object({
      model: z.string(),
    }).and(
      z.discriminatedUnion("mode", [
        z.object({
          mode: z.literal("new"),
        }),
        z.object({
          mode: z.literal("id"),
          id: z.number(),
        }),
      ]),
    ))
    .mutation(async ({ input }) => {
      // 1. Check if Ollama is running/exist, if not return error for Frontend.
      // 2. Check if the model is available, if not return error for Frontend.
      // 3. Depending on the mode, foreach raw note:
      //   a. get the raw note from the database.
      //   b. if the note is not already enriched (i.e. does not have a relation to an note), run enrichment.
      //   b. the run enrichment.
      //   c. save the note to the database under a new note, also create an entry in the releation table.
      // 4. Return the enrichment result, which will have a total of notes processed, and a list of notes that failed (ids).
      return { success: true };
    }),
});
