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
  const urlParams = new URLSearchParams(window.location.search);
  const paramLanguage = urlParams.get("hl");
  if (paramLanguage) {
    return paramLanguage.split("-")[0].toLowerCase();
  }

  const htmlLang = document.documentElement.getAttribute("lang");
  if (htmlLang) {
    return htmlLang.split("-")[0].toLowerCase();
  }

  const browserLang = navigator.language || "en";
  return browserLang.split("-")[0].toLowerCase();
}

const MAX_CHUNK_SIZE = 500;

/**
 * Splits text into chunks at sentence boundaries while respecting max size.
 *
 * @param {string} text - The text to chunk.
 * @param {number} MAX_CHUNK_SIZE - Maximum size of each chunk in characters.
 * @returns {string[]} Array of text chunks.
 */
export function smartChunkText(text: string): string[] {
  const chunks: string[] = [];

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if (
      currentChunk &&
      currentChunk.length + trimmedSentence.length + 1 > MAX_CHUNK_SIZE
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedSentence;
    } else if (trimmedSentence.length > MAX_CHUNK_SIZE) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      const words = trimmedSentence.split(" ");
      let longChunk = "";

      for (const word of words) {
        if ((longChunk + word).length > MAX_CHUNK_SIZE) {
          if (longChunk) {
            chunks.push(longChunk.trim());
          }
          longChunk = word + " ";
        } else {
          longChunk += word + " ";
        }
      }

      if (longChunk) {
        currentChunk = longChunk;
      }
    } else {
      currentChunk += (currentChunk ? " " : "") + trimmedSentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
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
    const chunks = smartChunkText(text);

    const translatedChunks: string[] = [];

    console.log("%cChunks:", "background-color: green; color: white", chunks);
    for (const chunk of chunks) {
      const encodedText = encodeURIComponent(chunk);
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodedText}`
      );

      const data = await response.json();
      translatedChunks.push(data[0][0][0]);
    }

    console.log(
      "%cTranslated chunks:",
      "background-color: green; color: white",
      translatedChunks.join(" ")
    );
    return translatedChunks.join(" ");
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate text. Please try again.");
  }
}
