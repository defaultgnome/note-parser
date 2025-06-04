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

function logMessageToUser(message: string) {
  outputTextElement.value = message;
  console.log(message);
}

// Event listener for the new button to load test data
loadTestDataButtonElement.addEventListener("click", () => {
  inputTextElement.value = testData;
});

submitButtonElement.addEventListener("click", async () => {
  const text = inputTextElement.value;
  if (!text.trim()) {
    logMessageToUser(
      JSON.stringify({ error: "Input text cannot be empty." }, null, 2)
    );
    return;
  }

  logMessageToUser("Processing... please wait.");
  submitButtonElement.disabled = true;
  submitButtonElement.classList.add("opacity-50", "cursor-not-allowed");

  try {
    const extractedData = await extractDataWithOllama(text, logMessageToUser);
    if (extractedData.error) {
      logMessageToUser(JSON.stringify(extractedData, null, 2));
    } else {
      // Validation is now done inside extractDataWithOllama after parsing
      logMessageToUser(JSON.stringify(extractedData, null, 2));
    }
  } catch (error) {
    // This catch block might be redundant if extractDataWithOllama handles all its errors and returns an error object
    console.error("Error during data extraction process:", error);
    logMessageToUser(
      JSON.stringify(
        { error: "An unexpected error occurred during the process." },
        null,
        2
      )
    );
  } finally {
    submitButtonElement.disabled = false;
    submitButtonElement.classList.remove("opacity-50", "cursor-not-allowed");
  }
});
