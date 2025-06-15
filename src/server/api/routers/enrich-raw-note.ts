
import { z } from "zod";
import { rawNotes, notes, rawNotesToNotes } from "~/server/db/schema";
import ollama from "ollama";
import { eq, isNull } from "drizzle-orm";
import { publicProcedure } from "../trpc";

// Define the Zod schema for the enriched note (matching the notes table)
const EnrichedNoteSchema = z.object({
    sector: z.string().optional(),
    location: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    description: z.string(),
    eventType: z.string().optional(),
});

// Example system prompt for the LLM
const SYSTEM_PROMPT = `You are an expert at extracting structured data from raw notes. Given a note, extract the following fields as JSON:
- sector (string, optional)
- location (string, optional)
- lat (number, optional)
- lng (number, optional)
- date (string, optional)
- time (string, optional)
- description (string, required)
- eventType (string, optional)

Example input:
"גזרת בנימין, 9/7/24 ז"א בכביש 465 מכיווןם הכפר דיר אבו משעל חייל שהיה באחד הרכבים ירה ופגע במחבל שמת מאוחר יותר (14:00)."

Example output:
{"sector": "גזרת בנימין", "location": "בכביש 465", "date": "2024-07-09", "time": "14:00", "description": "ז"א בכביש 465 מכיווןם הכפר דיר אבו משעל חייל שהיה באחד הרכבים ירה ופגע במחבל שמת מאוחר יותר", "eventType": "ז\"א"}

Always return a valid JSON object with these fields. If a field is missing, set it to null or omit it.`;

export const enrichRawNotes = publicProcedure
    .input(z.object({
        model: z.string(),
    }).and(
        z.discriminatedUnion("mode", [
            z.object({ mode: z.literal("new") }),
            z.object({ mode: z.literal("id"), id: z.number() }),
        ]),
    ))
    .mutation(async ({ ctx, input }) => {
        // 1. Check if Ollama is running
        try {
            await ollama.list();
        } catch (e) {
            return { isSuccess: false, message: "Ollama is not running or not reachable on port 11434", description: "Please start ollama and try again." };
        }
        // 2. Check if the model is available
        const models = await ollama.list();
        if (!models.models.some((m: any) => m.name.startsWith(input.model))) {
            return { isSuccess: false, message: `Model ${input.model} is not available in Ollama.`, description: "Please select a different model or install the model." };
        }
        // 3. Get raw notes to enrich
        let notesToEnrich: { id: number; value: string }[] = [];
        if (input.mode === "new") {
            // Only notes that do not have a relation in rawNotesToNotes
            notesToEnrich = await ctx.db
                .select({ id: rawNotes.id, value: rawNotes.value })
                .from(rawNotes)
                .leftJoin(rawNotesToNotes, eq(rawNotes.id, rawNotesToNotes.rawNoteId))
                .where(isNull(rawNotesToNotes.rawNoteId));
        } else if (input.mode === "id") {
            const note = await ctx.db
                .select({ id: rawNotes.id, value: rawNotes.value })
                .from(rawNotes)
                .where(eq(rawNotes.id, input.id));
            if (note.length > 0) notesToEnrich = note;
        }
        let failed: number[] = [];
        let processed = 0;
        for (const rawNote of notesToEnrich) {
            // Double-check not already enriched
            const already = await ctx.db
                .select()
                .from(rawNotesToNotes)
                .where(eq(rawNotesToNotes.rawNoteId, rawNote.id));
            if (already.length > 0) continue;
            let result: any = null;
            let valid = false;
            let lastError = "";
            for (let attempt = 0; attempt < 3; attempt++) {
                try {
                    const response = await ollama.chat({
                        model: input.model,
                        messages: [
                            { role: "system", content: SYSTEM_PROMPT },
                            { role: "user", content: rawNote.value },
                        ],
                        format: "json",
                    });
                    // Try to parse JSON
                    let json: any;
                    try {
                        json = typeof response.message.content === "string"
                            ? JSON.parse(response.message.content)
                            : response.message.content;
                    } catch (e) {
                        lastError = "Invalid JSON format";
                        continue;
                    }
                    // Validate with Zod
                    const parsed = EnrichedNoteSchema.safeParse(json);
                    if (parsed.success) {
                        result = parsed.data;
                        valid = true;
                        break;
                    } else {
                        lastError = "Zod validation failed: " + JSON.stringify(parsed.error.flatten());
                        // Try again with a correction prompt
                    }
                } catch (e) {
                    lastError = (e as Error).message;
                }
            }
            if (!valid) {
                failed.push(rawNote.id);
                continue;
            }
            // Save the note and relation
            const [insertedNote] = await ctx.db
                .insert(notes)
                .values(result)
                .returning({ id: notes.id });
            if (!insertedNote) {
                return { isSuccess: false, message: "Failed to insert enriched note into database", description: "Please try again." };
            }
            await ctx.db.insert(rawNotesToNotes).values({
                rawNoteId: rawNote.id,
                noteId: insertedNote.id,
                isConfirmed: false,
            });
            processed++;
        }
        return { isSuccess: true, message: `Enriched ${processed} notes, failed ${failed.length} notes, total ${notesToEnrich.length} notes.`, description: "" };
    });