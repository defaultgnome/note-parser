import { z } from "zod/v4";

export function schemaToJSON(zodSchema: z.ZodObject<any, any>): string {
  const properties: Record<string, any> = {};
  for (const key in zodSchema.shape) {
    const field = zodSchema.shape[key];
    properties[key] = {
      type:
        field instanceof z.ZodString
          ? "string"
          : field instanceof z.ZodDate
          ? "string" // LLM will provide date as string
          : field instanceof z.ZodArray
          ? "array"
          : "unknown",
      ...(field.isOptional() && { optional: true }),
      ...(field._def.description && { description: field._def.description }),
    };
    if (field instanceof z.ZodArray && field.element instanceof z.ZodString) {
      properties[key].items = { type: "string" };
    }
    if (field instanceof z.ZodDate) {
      properties[key].format = "date-time"; // Hint for ISO string format
      properties[key].description = properties[key].description
        ? `${properties[key].description}. Format as ISO 8601 string.`
        : "Format as ISO 8601 string.";
    }
  }
  return JSON.stringify({ type: "object", properties }, null, 2);
}
