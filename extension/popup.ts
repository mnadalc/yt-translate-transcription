/// <reference types="chrome-types" />

import { TranscriptResponse } from "./types";
import { getElement, setStatus, translateText } from "./utils";

// DOM elements
const transcriptButton = getElement("#get-transcript", HTMLButtonElement);
const resultContainer = getElement("#result", HTMLDivElement);
const transcriptContent = getElement("#transcript-content", HTMLDivElement);

const languageSelect = getElement("#language-select", HTMLSelectElement);

const enhanceWithAIButton = getElement("#enhance-with-ai", HTMLButtonElement);
const enhancedResultContainer = getElement("#enhanced-result", HTMLDivElement);
const enhancedTranscriptContent = getElement(
  "#enhanced-transcript-content",
  HTMLDivElement
);

const statusElement = getElement("#status", HTMLDivElement);
const enhancedStatusElement = getElement("#enhanced-status", HTMLDivElement);

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
    setStatus(statusElement, "info", "Getting transcript from YouTube...");
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

    const response: TranscriptResponse = await chrome.tabs.sendMessage(tab.id, {
      action: "getTranscript",
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to get transcript");
    }

    setStatus(statusElement, "info", "Translating transcript...");

    const targetLang = languageSelect.value;
    console.log(
      "%cTarget language:",
      "background-color: green; color: white",
      response.transcript
    );
    const translatedText = await translateText(response.transcript, targetLang);

    transcriptContent.textContent = translatedText;
    resultContainer.classList.remove("hidden");
    enhanceWithAIButton.classList.remove("hidden");
    setStatus(statusElement, "success", "Translation complete!");

    const enhanceResponse: TranscriptResponse = await chrome.tabs.sendMessage(
      tab.id,
      {
        action: "enhanceTranscript",
        transcript: translatedText,
      }
    );
    setStatus(enhancedStatusElement, "info", "Enhancing transcript with AI...");

    if (!enhanceResponse.success) {
      throw new Error(enhanceResponse.error || "Failed to enhance transcript");
    }

    console.log(
      "%cEnhanced transcript:",
      "background-color: green; color: white",
      enhanceResponse.transcript
    );
    enhancedTranscriptContent.textContent = enhanceResponse.transcript;
    enhancedResultContainer.classList.remove("hidden");
    setStatus(enhancedStatusElement, "success", "Enhancement complete!");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    setStatus(statusElement, "error", errorMessage);
  } finally {
    transcriptButton.disabled = false;
    enhanceWithAIButton.disabled = false;
  }
});

enhanceWithAIButton.addEventListener("click", async () => {
  try {
    setStatus(enhancedStatusElement, "info", "Enhancing transcript with AI...");
    enhanceWithAIButton.disabled = true;
    resultContainer.classList.add("hidden");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    setStatus(enhancedStatusElement, "error", errorMessage);
  }
});
