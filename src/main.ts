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

const testData = `
### **דו"ח שדה 1 – תאונת חזית אל חזית**

**תאריך:** 02/06/2025
**שעה:** 08:45
**מיקום:** רחוב יגאל אלון פינת דרך השלום, תל אביב
**רכבים מעורבים:**

* רכב פרטי מסוג יונדאי i30, נהג: גבר, כבן 34
* רכב פרטי מסוג טויוטה קורולה, נהגת: אישה, כבת 42

**תיאור האירוע:**
רכב מסוג יונדאי נסע מערבה ברחוב יגאל אלון, בעת שפנה שמאלה לדרך השלום, חצה את הנתיב הנגדי והתנגש חזיתית בטויוטה שבאה ממול. שני כלי הרכב נבלמו במקום.

**נזק לרכוש:**
שני הרכבים ניזוקו קשות בחזית. נזק כולל לפגושים, מכסה מנוע ושמשות קדמיות.

**פגיעות גופניות:**
הנהג ברכב היונדאי נפצע קל (חבלות בצוואר). הנהגת בטויוטה התלוננה על כאבים בחזה.

**פעולות שבוצעו:**
זומנה ניידת טיפול נמרץ. ניידת משטרה חסמה את הצומת. בוצעה בדיקת ינשוף לנהגים – תוצאות תקינות. הנהגים פונו לבית החולים איכילוב.
`;

// Initialize Ollama
const ollama = new Ollama(); // Assumes Ollama is running on default http://localhost:11434

const inputTextElement = document.getElementById(
  "inputText"
) as HTMLTextAreaElement;
const submitButtonElement = document.getElementById(
  "submitButton"
) as HTMLButtonElement;
const loadTestDataButtonElement = document.getElementById(
  "loadTestDataButton"
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
  const maxAttempts = 5;
  let lastAttemptError: any = null;
  let previousAssistantResponseContent: string | null = null;

  // These prompts are defined based on your latest structure
  const baseSystemPrompt = `You are a parser. Given an input text, you will extract the relevant information and return a JSON object that conforms strictly to the following schema:

${schemaForPrompt}

Example:
${JSON.stringify(articleExample, null, 2)}

Only return a valid JSON object. Do not include any explanations.
If a field is missing, use null.`;

  const baseUserPromptForText = `
Here's the input text:

${text}

Extract the information as per the schema.
`;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let currentMessages: { role: string; content: string }[];

    if (attempt === 1) {
      outputTextElement.value = `Contacting Ollama (${model}) (Attempt ${attempt}/${maxAttempts})... Please wait.`;
      currentMessages = [
        { role: "system", content: baseSystemPrompt },
        { role: "user", content: baseUserPromptForText },
      ];
    } else {
      // This is a retry attempt
      outputTextElement.value = `Correction Attempt ${attempt}/${maxAttempts} with Ollama (${model})... Please wait.`;
      let correctionInstruction =
        "The previous output was not a valid JSON or did not match the schema.";
      if (lastAttemptError) {
        if (lastAttemptError instanceof z.ZodError) {
          correctionInstruction += `\nValidation errors from previous attempt:\n${JSON.stringify(
            lastAttemptError.issues,
            null,
            2
          )}`;
        } else {
          correctionInstruction += `\nError from previous attempt: ${lastAttemptError.message}`;
        }
      }
      correctionInstruction += `\n\nPlease review the original text carefully and provide a valid JSON object that strictly adheres to the schema. Ensure your output is ONLY the JSON object itself, with no surrounding text or explanations.\nSchema to follow:\n${schemaForPrompt}\nExample of correct JSON structure:\n${JSON.stringify(
        articleExample,
        null,
        2
      )}`;

      currentMessages = [
        { role: "system", content: baseSystemPrompt }, // Re-iterate base system instructions
        { role: "user", content: baseUserPromptForText }, // Re-send original text context
      ];
      if (previousAssistantResponseContent) {
        // Add model's last (bad) attempt to the history for context
        currentMessages.push({
          role: "assistant",
          content: previousAssistantResponseContent,
        });
      }
      currentMessages.push({ role: "user", content: correctionInstruction }); // Add the correction prompt
    }

    try {
      const response = await ollama.chat({
        model,
        messages: currentMessages,
        format: "json",
      });

      // Store the raw content for potential use in the next correction prompt
      previousAssistantResponseContent = response.message?.content || "";

      if (response.message && response.message.content) {
        try {
          const jsonData = JSON.parse(response.message.content);
          const validatedData = articleSchema.parse(jsonData); // Zod validation
          return validatedData; // Success!
        } catch (parseOrValidationError) {
          console.error(
            `Attempt ${attempt}/${maxAttempts} failed during parse/validation:`,
            parseOrValidationError
          );
          console.error(
            "Ollama raw response content on failure:",
            response.message.content
          );
          lastAttemptError = parseOrValidationError; // Store error for the next attempt's prompt or final error reporting

          let errorMessage = "Unknown parsing or validation error";
          if (parseOrValidationError instanceof Error) {
            errorMessage = parseOrValidationError.message;
          }

          if (attempt >= maxAttempts) {
            // Final attempt also failed
            return {
              error: `Failed after ${maxAttempts} attempts. Last error: ${errorMessage}`,
              details:
                parseOrValidationError instanceof z.ZodError
                  ? parseOrValidationError.issues
                  : String(parseOrValidationError),
              rawResponse: response.message.content,
            };
          }
          // If not max attempts, loop continues for the next attempt
        }
      } else {
        lastAttemptError = new Error(
          "Ollama returned an empty or invalid response structure."
        );
        console.error(
          `Attempt ${attempt}/${maxAttempts} failed: ${lastAttemptError.message}`
        );
        previousAssistantResponseContent = ""; // Clear previous response as it was empty/invalid
        if (attempt >= maxAttempts) {
          return {
            error: `Failed after ${maxAttempts} attempts. Last error: ${lastAttemptError.message}`,
          };
        }
      }
    } catch (apiError) {
      lastAttemptError = apiError;
      console.error(`Attempt ${attempt}/${maxAttempts} API error:`, apiError);
      previousAssistantResponseContent = ""; // Clear previous response content due to API error

      let apiErrorMessage = "Unknown API error";
      if (apiError instanceof Error) {
        apiErrorMessage = apiError.message;
      }

      if (attempt >= maxAttempts) {
        return {
          error: `Ollama API error after ${maxAttempts} attempts: ${apiErrorMessage}`,
          details: String(apiError),
        };
      }
    }
  } // End of for loop for attempts

  // Fallback if loop finishes unexpectedly (should be covered by returns inside)
  return {
    error: "Extraction failed after maximum attempts.",
    details: lastAttemptError ? String(lastAttemptError) : "Unknown error",
  };
}

// Event listener for the new button to load test data
loadTestDataButtonElement.addEventListener("click", () => {
  inputTextElement.value = testData;
});

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
