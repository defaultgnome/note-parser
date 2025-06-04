import { z } from "zod/v4";
import { Ollama } from "ollama";
import { model, articleSchema, articleExample, maxAttempts } from "../config";
import { schemaToJSON } from "./schema-to-json";

const ollama = new Ollama(); // Assumes Ollama is running on default http://localhost:11434
const schemaForPrompt = schemaToJSON(articleSchema);

export async function extractDataWithOllama(
  text: string,
  log: (message: string) => void
): Promise<{ status: "success" | "error"; data?: Record<string, any> }> {
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
      log(
        `Contacting Ollama (${model}) (Attempt ${attempt}/${maxAttempts})... Please wait.`
      );
      currentMessages = [
        { role: "system", content: baseSystemPrompt },
        { role: "user", content: baseUserPromptForText },
      ];
    } else {
      // This is a retry attempt
      log(
        `Correction Attempt ${attempt}/${maxAttempts} with Ollama (${model})... Please wait.`
      );
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
        let jsonData: Record<string, any> | undefined = undefined;
        try {
          jsonData = JSON.parse(response.message.content);
          const validatedData = articleSchema.parse(jsonData); // Zod validation
          return { status: "success", data: validatedData }; // Success!
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
            log(
              `Failed after ${maxAttempts} attempts. see console for more error details`
            );
            console.error(errorMessage);
            // we return the last chat response
            return {
              status: "error",
              data: jsonData ?? { raw: response.message.content },
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
            status: "error",
            data: {
              message: `Failed after ${maxAttempts} attempts.`,
              error: `${lastAttemptError.message}`,
            },
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
          status: "error",
          data: {
            message: `Ollama API error after ${maxAttempts} attempts.`,
            error: apiErrorMessage,
            details: String(apiError),
          },
        };
      }
    }
  } // End of for loop for attempts

  // Fallback if loop finishes unexpectedly (should be covered by returns inside)
  return {
    status: "error",
    data: {
      mesage: "Extraction failed after maximum attempts.",
      details: lastAttemptError ? String(lastAttemptError) : "Unknown error",
    },
  };
}
