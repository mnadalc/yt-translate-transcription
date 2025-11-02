/// <reference types="chrome-types" />

import { TranscriptResponse } from "../core/types.js";
import { getElement, setStatus } from "../core/dom-helpers.js";
import { translateText } from "./utils.js";

export async function initTranslationSection(): Promise<void> {
  const container = getElement<HTMLDivElement>(
    "#translation-container",
    HTMLDivElement
  );
  if (!container) {
    throw new Error("Translation container not found");
  }

  const html = await fetch(
    chrome.runtime.getURL("translation/section.html")
  ).then((r) => r.text());
  container.innerHTML = html;

  attachEventListeners();
}

function attachEventListeners(): void {
  const transcriptButton = getElement("#get-transcript", HTMLButtonElement);
  const resultContainer = getElement("#result", HTMLDivElement);
  const transcriptContent = getElement("#transcript-content", HTMLDivElement);
  const languageSelect = getElement("#language-select", HTMLSelectElement);
  const statusElement = getElement("#status", HTMLDivElement);

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

      const response: TranscriptResponse = await chrome.tabs.sendMessage(
        tab.id,
        {
          action: "getTranscript",
        }
      );

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
      const translatedText = await translateText(
        response.transcript,
        targetLang
      );

      transcriptContent.textContent = translatedText;
      resultContainer.classList.remove("hidden");
      setStatus(statusElement, "success", "Translation complete!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setStatus(statusElement, "error", errorMessage);
    } finally {
      transcriptButton.disabled = false;
    }
  });
}
