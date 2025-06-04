import { z } from "zod/v4";

export const model = "gemma3:latest";

export const articleSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  description: z.string(),
  location: z.string(),
  tags: z.array(z.string()).default([]),
  reportedAt: z.coerce.date(),
  source: z.string().default("Unknown"),
});

export const articleExample = {
  title: "The title of the article",
  description: "The description of the article",
  location: "Argentina, Buenos Aires, La Plata",
  tags: ["tag1", "tag2"],
  reportedAt: new Date().toISOString(),
  source: "Who Reported on this",
};

export let maxAttempts = 3;
