import { z } from "zod/v4";

export const model = "gemma3:latest";

export const articleSchema = z.object({
  description: z.string().min(1, "Description cannot be empty"),
  location: z.string(),
  tags: z.array(z.string()).default([]),
  timestamp: z.iso.datetime(),
});

export const articleExample = {
  description: "סנוור בלייזר בכביש 450 דיר עמאר",
  location: "בכביש 450 דיר עמאר",
  tags: ["סנוור בלייזר"],
  timestamp: new Date().toISOString(),
};

export let maxAttempts = 3;
