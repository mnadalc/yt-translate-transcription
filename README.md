# YouTube Transcript Translator

A minimalist Chrome extension that extracts YouTube video transcripts and translates them into your preferred language.

## Features

- Extract transcripts from YouTube videos
- Translate to 10+ languages
- Remembers your language preference
- Clean, minimal interface
- Free to use (uses MyMemory Translation API)

## Installation

### For Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build the extension:**
   ```bash
   pnpm build
   ```

3. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `dist/` folder from this project

### For Development with Auto-Reload

Run the development watcher:
```bash
pnpm dev
```

This will automatically rebuild when you make changes to the source files. You'll need to manually reload the extension in Chrome after each build.

## Usage

1. Open a YouTube video page
2. Click the extension icon in your browser toolbar
3. Select your target language from the dropdown
4. Click "Get & Translate Transcript"
5. Wait for the transcript to be extracted and translated
6. View the translated transcript in the popup

## Requirements

- The YouTube video must have captions/subtitles enabled
- Active internet connection for translation

## Supported Languages

- Spanish
- French
- German
- Italian
- Portuguese
- Russian
- Chinese
- Japanese
- Korean
- Arabic

## Project Structure

```
chrome-extension/
├── extension/          # Source files
│   ├── manifest.json   # Extension configuration
│   ├── popup.html      # Popup UI
│   ├── popup.ts        # Popup logic (TypeScript)
│   ├── content.ts      # Content script (TypeScript)
│   └── styles.css      # Styles
├── dist/               # Build output (generated)
├── build.js            # Build script
├── tsconfig.json       # TypeScript config
├── package.json        # Dependencies
└── README.md           # This file
```

## Development Scripts

- `pnpm build` - Build the extension once
- `pnpm dev` - Watch mode (auto-rebuild on changes)
- `pnpm clean` - Remove build output

## Technologies Used

- TypeScript
- Chrome Extensions API (Manifest V3)
- MyMemory Translation API (free tier)
- esbuild (bundler)

## Known Limitations

- Only works on videos with available captions
- Translation API has rate limits (free tier)
- Long transcripts may take time to translate
- Chrome only (Firefox support planned)

## Future Enhancements

- [ ] Firefox compatibility
- [ ] Additional translation providers
- [ ] Transcript export (TXT, PDF)
- [ ] Custom styling options
- [ ] Multiple language detection
- [ ] Offline translation support

## License

MIT
