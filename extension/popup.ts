/// <reference types="chrome-types" />

import { initTranslationSection } from "./translation/popup.js";

async function init(): Promise<void> {
  await initTranslationSection();
}

init().catch((error) => {
  console.error("Failed to initialize popup:", error);
});
