import { testData } from "./utils/test-data";
import { extractDataWithOllama } from "./utils/ollama";

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
const systemMessagesElement = document.getElementById(
  "systemMessages"
) as HTMLTextAreaElement;

function logMessageToUser(message: string) {
  systemMessagesElement.value += message + "\n"; // Append new messages
  console.log(message);
}

// Event listener for the new button to load test data
loadTestDataButtonElement.addEventListener("click", () => {
  inputTextElement.value = testData;
  logMessageToUser("Test data loaded.");
});

submitButtonElement.addEventListener("click", async () => {
  const text = inputTextElement.value;
  if (!text.trim()) {
    // Log error to system messages, but final output (which is an error object) to outputTextElement
    const errorMessage = JSON.stringify(
      { error: "Input text cannot be empty." },
      null,
      2
    );
    logMessageToUser("Error: Input text cannot be empty.");
    outputTextElement.value = errorMessage;
    return;
  }

  logMessageToUser("Processing... please wait.");
  // Clear previous results from outputTextElement at the start of a new submission
  outputTextElement.value = "";
  submitButtonElement.disabled = true;
  submitButtonElement.classList.add("opacity-50", "cursor-not-allowed");

  try {
    const extractedData = await extractDataWithOllama(text, logMessageToUser);
    // Final result (or error from extraction) goes to outputTextElement
    outputTextElement.value = JSON.stringify(extractedData.data, null, 2);
    if (extractedData.status === "error") {
      logMessageToUser(`Extraction failed`);
    } else {
      logMessageToUser("Extraction successful.");
    }
  } catch (error) {
    // This catch block might be redundant if extractDataWithOllama handles all its errors and returns an error object
    console.error("Error during data extraction process:", error);
    const errorMessage = JSON.stringify(
      { error: "An unexpected error occurred during the process." },
      null,
      2
    );
    logMessageToUser("Error: An unexpected error occurred during the process.");
    outputTextElement.value = errorMessage;
  } finally {
    submitButtonElement.disabled = false;
    submitButtonElement.classList.remove("opacity-50", "cursor-not-allowed");
  }
});
