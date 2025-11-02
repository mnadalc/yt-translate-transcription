/// <reference types="chrome-types" />

import { TranscriptResponse } from "./core/types.js";
import { getYouTubeTranscript } from "./core/transcript.js";
import { handleEnhanceTranscript } from "./enhancement/content.js";

type ChromeRuntimeRequest =
  | {
      action: "getTranscript";
    }
  | {
      action: "enhanceTranscript";
      transcript: string;
    };

chrome.runtime.onMessage.addListener(
  (
    request: ChromeRuntimeRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: TranscriptResponse) => void
  ): boolean => {
    if (request.action === "getTranscript") {
      getYouTubeTranscript()
        .then((transcript) => {
          sendResponse({ success: true, transcript });
          return transcript;
        })
        .catch((error) => {
          sendResponse({
            success: false,
            error: error.message || "Failed to extract transcript",
          });
        });

      return true;
    }

    if (request.action === "enhanceTranscript") {
      return handleEnhanceTranscript(request, sendResponse);
    }

    return false;
  }
);

console.log("YouTube Transcript Translator content script loaded");
