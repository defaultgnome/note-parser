import { z } from "zod/v4";
import { Ollama } from "ollama";

const model = "gemma3:latest";

const articleSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  description: z.string(),
  location: z.string(),
  tags: z.array(z.string()).default([]),
  reportedAt: z.coerce.date(),
  source: z.string().default("Unknown"),
});

const articleExample = {
  title: "The title of the article",
  description: "The description of the article",
  location: "Argentina, Buenos Aires, La Plata",
  tags: ["tag1", "tag2"],
  reportedAt: new Date().toISOString(),
  source: "Who Reported on this",
};

console.log(getJsonSchemaPrompt(articleSchema));

// Initialize Ollama
const ollama = new Ollama(); // Assumes Ollama is running on default http://localhost:11434

const inputTextElement = document.getElementById(
  "inputText"
) as HTMLTextAreaElement;
const submitButtonElement = document.getElementById(
  "submitButton"
) as HTMLButtonElement;
const outputTextElement = document.getElementById(
  "outputText"
) as HTMLTextAreaElement;

// Function to generate a JSON schema string from the Zod schema for the prompt
function getJsonSchemaPrompt(zodSchema: z.ZodObject<any, any>): string {
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

const schemaForPrompt = getJsonSchemaPrompt(articleSchema);

async function extractDataWithOllama(text: string): Promise<any> {
  outputTextElement.value = `Contacting Ollama (${model})... Please wait.`;

  const systemPrompt = `You are a parser. Given an input text, you will extract the relevant information and return a JSON object that conforms strictly to the following schema:

${schemaForPrompt}

Example:
${JSON.stringify(articleExample, null, 2)}

Only return a valid JSON object. Do not include any explanations.
If a field is missing, use null or an empty array where appropriate.`;

  const userPrompt = `
Here's the input text:

${text}

Extract the information as per the schema.
`;

  try {
    const response = await ollama.chat({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      format: "json",
    });

    if (response.message && response.message.content) {
      // The 'format: json' option should ensure the content is a valid JSON string.
      // However, parsing is still needed to convert string to object.
      try {
        const jsonData = JSON.parse(response.message.content);
        return articleSchema.parse(jsonData); // Validate with Zod schema
      } catch (jsonError) {
        console.error(
          "Failed to parse JSON response from Ollama or validation failed:",
          jsonError
        );
        console.error("Ollama raw response:", response.message.content);
        let errorDetail = "Failed to parse Ollama's JSON response.";
        if (jsonError instanceof z.ZodError) {
          errorDetail = "Ollama's response does not match the required schema.";
          return {
            error: errorDetail,
            details: jsonError.issues,
            rawResponse: response.message.content,
          };
        } else if (jsonError instanceof Error) {
          errorDetail = jsonError.message;
        }
        return { error: errorDetail, rawResponse: response.message.content };
      }
    } else {
      return {
        error: "Ollama returned an empty or invalid response structure.",
      };
    }
  } catch (error) {
    console.error("Error calling Ollama API:", error);
    let errorMessage = "An unexpected error occurred while contacting Ollama.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { error: errorMessage };
  }
}

submitButtonElement.addEventListener("click", async () => {
  const text = inputTextElement.value;
  if (!text.trim()) {
    outputTextElement.value = JSON.stringify(
      { error: "Input text cannot be empty." },
      null,
      2
    );
    return;
  }

  outputTextElement.value = "Processing... please wait.";
  submitButtonElement.disabled = true;
  submitButtonElement.classList.add("opacity-50", "cursor-not-allowed");

  try {
    const extractedData = await extractDataWithOllama(text);
    if (extractedData.error) {
      outputTextElement.value = JSON.stringify(extractedData, null, 2);
    } else {
      // Validation is now done inside extractDataWithOllama after parsing
      outputTextElement.value = JSON.stringify(extractedData, null, 2);
    }
  } catch (error) {
    // This catch block might be redundant if extractDataWithOllama handles all its errors and returns an error object
    console.error("Error during data extraction process:", error);
    outputTextElement.value = JSON.stringify(
      { error: "An unexpected error occurred during the process." },
      null,
      2
    );
  } finally {
    submitButtonElement.disabled = false;
    submitButtonElement.classList.remove("opacity-50", "cursor-not-allowed");
  }
});
