/// <reference types="chrome-types" />

import { TranscriptResponse } from "./types";
import { getElement, setStatus, translateText } from "./utils";

// DOM elements
const transcriptButton = getElement("#get-transcript", HTMLButtonElement);
const languageSelect = getElement("#language-select", HTMLSelectElement);
const resultContainer = getElement("#result", HTMLDivElement);
const transcriptContent = getElement("#transcript-content", HTMLDivElement);

chrome.storage.sync.get(["targetLanguage"], (result) => {
  if (result.targetLanguage) {
    languageSelect.value = result.targetLanguage;
  }
});

languageSelect.addEventListener("change", () => {
  chrome.storage.sync.set({ targetLanguage: languageSelect.value });
});

transcriptButton.addEventListener("click", async () => {
  try {
    setStatus("info", "Getting transcript from YouTube...");
    transcriptButton.disabled = true;
    resultContainer.classList.add("hidden");

    // Get active tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab.id) {
      throw new Error("No active tab found");
    }

    if (
      !tab.url?.includes("youtube.com/watch") &&
      !tab.url?.includes("youtu.be/")
    ) {
      throw new Error("Please open a YouTube video page");
    }

    // Send message to content script to get transcript
    const response: TranscriptResponse = await chrome.tabs.sendMessage(tab.id, {
      action: "getTranscript",
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to get transcript");
    }

    setStatus("info", "Translating transcript...");

    // Translate the transcript
    const targetLang = languageSelect.value;
    const translatedText = await translateText(response.transcript, targetLang);

    // Display result
    transcriptContent.textContent = translatedText;
    resultContainer.classList.remove("hidden");
    setStatus("success", "Translation complete!");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    setStatus("error", errorMessage);
  } finally {
    transcriptButton.disabled = false;
  }
});
