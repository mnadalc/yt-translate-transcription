export const HF_ENDPOINT =
  "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

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
 * Detects the current language of the YouTube interface.
 *
 * Uses multiple detection methods in priority order:
 * 1. URL parameter 'hl' (explicit user choice)
 * 2. HTML lang attribute (YouTube's declared language)
 * 3. Browser language (fallback)
 *
 * Returns a normalized 2-letter language code (e.g., "en", "es", "fr").
 *
 * @returns {string} The detected language code (2-letter ISO 639-1 format)
 *
 * @example
 * // On YouTube with Spanish interface:
 * getYouTubeLanguage() // Returns: "es"
 *
 * // On YouTube with English (US) interface:
 * getYouTubeLanguage() // Returns: "en"
 */
export function getYouTubeLanguage(): string {
  // Method 1: Check URL parameter (explicit user choice)
  const urlParams = new URLSearchParams(window.location.search);
  const paramLanguage = urlParams.get("hl");
  if (paramLanguage) {
    return paramLanguage.split("-")[0].toLowerCase();
  }

  // Method 2: Check HTML lang attribute
  const htmlLang = document.documentElement.getAttribute("lang");
  if (htmlLang) {
    return htmlLang.split("-")[0].toLowerCase();
  }

  // Method 3: Fallback to browser language
  const browserLang = navigator.language || "en";
  return browserLang.split("-")[0].toLowerCase();
}

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

  // Method 1: Try exact match with detected language (case-insensitive)
  for (const button of allButtons) {
    const ariaLabel = button.getAttribute("aria-label") || "";
    if (ariaLabel.toLowerCase() === expectedLabel.toLowerCase()) {
      console.log("Found transcript button via exact match");
      return button;
    }
  }

  // Method 2: Try partial match with detected language
  for (const button of allButtons) {
    const ariaLabel = button.getAttribute("aria-label") || "";
    if (ariaLabel.toLowerCase().includes(expectedLabel.toLowerCase())) {
      console.log("Found transcript button via partial match");
      return button;
    }
  }

  // Method 3: Fallback - search for any button containing "transcript" keyword
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

/**
 * Helper function to get an element with type checking.
 *
 * @param {string} selector - The selector to get the element from.
 * @param {new () => T} type - The type of the element to get given the constructor.
 *
 * @returns {T} The element.
 */
export function getElement<T extends HTMLElement>(
  selector: string,
  type: new () => T
): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  if (!(element instanceof type)) {
    throw new Error(`Element ${selector} is not of type ${type.name}`);
  }

  return element;
}

/**
 * Helper function to set the message status for what the user is doing.
 *
 * @param {"info" | "error" | "success"} type - The type of the status to set.
 * @param {string} message - The message to set the status to.
 */
export function setStatus(
  element: HTMLDivElement,
  type: "info" | "error" | "success",
  message: string
) {
  element.textContent = message;
  element.className = `status ${type}`;
  element.classList.remove("hidden");
}

/**
 * Translate text using the Google Translate API.
 *
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The target language to translate the text to.
 * @returns {Promise<string>} The translated text.
 */
export async function translateText(
  text: string,
  targetLang: string
): Promise<string> {
  try {
    const chunkSize = 500;
    const chunks: string[] = [];

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }

    const translatedChunks: string[] = [];

    for (const chunk of chunks) {
      const encodedText = encodeURIComponent(chunk);
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodedText}`
      );

      const data = await response.json();
      translatedChunks.push(data[0][0][0]);
    }

    return translatedChunks.join(" ");
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate text. Please try again.");
  }
}
