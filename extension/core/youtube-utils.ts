import { getYouTubeLanguage } from "../translation/utils";

/**
 * Mapping of language codes to localized "Show transcript" button labels.
 *
 * YouTube localizes button aria-labels based on the user's language settings.
 * This mapping helps find the transcript button regardless of the interface language.
 *
 * Language codes use ISO 639-1 (2-letter) format to match YouTube's implementation.
 * The labels will be matched case-insensitively when searching for buttons.
 *
 * @example
 * // For English YouTube interface:
 * TRANSCRIPT_BUTTON_LABELS['en'] // Returns: 'Show transcript'
 *
 * // For Spanish YouTube interface:
 * TRANSCRIPT_BUTTON_LABELS['es'] // Returns: 'Mostrar transcripción'
 */
export const TRANSCRIPT_BUTTON_LABELS: Record<string, string> = {
  en: "Show transcript",
  es: "Mostrar transcripción",
  fr: "Afficher la transcription",
  de: "Transkript anzeigen",
  it: "Mostra trascrizione",
  pt: "Mostrar transcrição",
  ru: "Показать расшифровку",
  ja: "文字起こしを表示",
  ko: "녹취록 표시",
  "zh-Hans": "显示字幕文稿",
  "zh-Hant": "顯示字幕文稿",
  zh: "显示字幕文稿",
  ar: "إظهار النص",
  nl: "Transcript weergeven",
  pl: "Pokaż transkrypcję",
  tr: "Deşifre metni göster",
  hi: "ट्रांसक्रिप्ट दिखाएं",
  sv: "Visa transkription",
  no: "Vis transkript",
  da: "Vis transskription",
  fi: "Näytä tekstitys",
};

/**
 * Gets the YouTube transcript button from the page DOM.
 *
 * Uses multi-step detection to find the button regardless of language:
 * 1. Exact match with language-specific label (case-insensitive)
 * 2. Partial match with language-specific label
 * 3. Keyword fallback (searches for common "transcript" variations)
 *
 * @returns {HTMLButtonElement | null} The transcript button element, or null if not found
 *
 * @example
 * const button = getTranscriptButton();
 * if (button) {
 *   button.click();
 * }
 */
export function getTranscriptButton(): HTMLButtonElement | null {
  const currentLanguage = getYouTubeLanguage();
  const expectedLabel =
    TRANSCRIPT_BUTTON_LABELS[currentLanguage] || TRANSCRIPT_BUTTON_LABELS["en"];

  console.log(`Looking for transcript button in language: ${currentLanguage}`);
  console.log(`Expected label: ${expectedLabel}`);

  const allButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("button[aria-label]")
  );

  for (const button of allButtons) {
    const ariaLabel = button.getAttribute("aria-label") || "";
    if (ariaLabel.toLowerCase() === expectedLabel.toLowerCase()) {
      console.log("Found transcript button via exact match");
      return button;
    }
  }

  for (const button of allButtons) {
    const ariaLabel = button.getAttribute("aria-label") || "";
    if (ariaLabel.toLowerCase().includes(expectedLabel.toLowerCase())) {
      console.log("Found transcript button via partial match");
      return button;
    }
  }

  const transcriptKeywords = [
    "transcript",
    "transkript",
    "transcripción",
    "transcrição",
    "trascrizione",
    "字幕",
    "문자",
  ];

  for (const button of allButtons) {
    const ariaLabel = button.getAttribute("aria-label")?.toLowerCase() || "";
    if (transcriptKeywords.some((keyword) => ariaLabel.includes(keyword))) {
      console.log("Found transcript button via keyword fallback");
      return button;
    }
  }

  console.warn(
    `Could not find transcript button for language: ${currentLanguage}`
  );
  return null;
}
