import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { rawNotes } from "~/server/db/schema";
import { enrichRawNotes } from "./enrich-raw-note";

export const notesRouter = createTRPCRouter({
  saveRawNotes: publicProcedure
    .input(z.array(z.object({ value: z.string() })))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(rawNotes).values(input);
    }),
  enrichRawNotes,
});
