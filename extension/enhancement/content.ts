import { TranscriptResponse } from "../core/types.js";
import { enhanceTranscriptWithAI } from "./summarize.js";

type EnhanceTranscriptRequest = {
  action: "enhanceTranscript";
  transcript: string;
};

export function handleEnhanceTranscript(
  request: EnhanceTranscriptRequest,
  sendResponse: (response: TranscriptResponse) => void
): boolean {
  enhanceTranscriptWithAI(request.transcript)
    .then((enhancedTranscript) => {
      sendResponse({ success: true, transcript: enhancedTranscript });
      return enhancedTranscript;
    })
    .catch((error) => {
      sendResponse({
        success: false,
        error: error.message || "Failed to enhance transcript",
      });
    });

  return true;
}
