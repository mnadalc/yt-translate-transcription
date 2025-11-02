import { getTranscriptButton } from "./youtube-utils.js";

export async function getYouTubeTranscript(): Promise<string> {
  try {
    const videoId = getVideoIdFromUrl();
    if (!videoId) {
      throw new Error("Could not extract video ID from URL");
    }

    const transcript = await fetchTranscriptFromYouTube(videoId);
    if (!transcript) {
      throw new Error("No transcript available for this video");
    }

    return transcript;
  } catch (error) {
    console.error("Error getting transcript:", error);
    throw error;
  }
}

function getVideoIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v");
}

/**
 * Fetches the transcript from the YouTube API.
 * We have two methods to fetch the transcript:
 * 1. From the YouTube API
 * 2. From the page DOM
 *
 * @param {string} videoId - The ID of the YouTube video
 * @returns {Promise<string>} The transcript of the YouTube video
 */
async function fetchTranscriptFromYouTube(videoId: string): Promise<string> {
  try {
    const transcript = await getTranscriptFromPlayerAPI(videoId);
    if (transcript) {
      return transcript;
    }

    const domTranscript = await getTranscriptFromDOM();
    if (domTranscript) {
      return domTranscript;
    }

    throw new Error("Could not retrieve transcript");
  } catch (error) {
    throw new Error(
      "Transcript not available. Please ensure captions are enabled for this video."
    );
  }
}

async function getTranscriptFromPlayerAPI(
  videoId: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data && data.events) {
      const transcriptText = data.events
        .filter((event: any) => event.segs)
        .map((event: any) => event.segs.map((seg: any) => seg.utf8).join(""))
        .join(" ")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return transcriptText || null;
    }

    return null;
  } catch (error) {
    console.error("Error fetching from player API:", error);
    return null;
  }
}

async function getTranscriptFromDOM(): Promise<string | null> {
  try {
    const transcriptButton = getTranscriptButton();

    if (transcriptButton) {
      transcriptButton.click();
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } else {
      const transcriptPanel = document.querySelector(
        'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-transcript"]'
      );

      if (!transcriptPanel || transcriptPanel.hasAttribute("hidden")) {
        console.warn("Transcript button not found and panel not open");
        return null;
      }

      console.log("Transcript panel already open");
    }

    const transcriptSegments = document.querySelectorAll(
      "ytd-transcript-segment-renderer"
    );

    if (transcriptSegments.length === 0) {
      console.warn("No transcript segments found");
      return null;
    }

    const transcriptText = Array.from(transcriptSegments)
      .map((segment) => {
        const textElement = segment.querySelector(".segment-text");
        return textElement?.textContent?.trim() || "";
      })
      .filter((text) => text.length)
      .join(" ");

    return transcriptText || null;
  } catch (error) {
    console.error("Error extracting from DOM:", error);
    return null;
  }
}
