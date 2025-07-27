# YouTube Video Summarizer Chrome Extension

A Chrome extension that automatically summarizes YouTube videos using Google Gemini AI.

## Features

- 🎥 One-click YouTube video summarization
- 🤖 Automatic integration with Google Gemini
- ⚙️ Customizable prompt templates
- 🎯 Floating button on YouTube pages for quick access
- 💾 Settings persistence across browser sessions

## Installation

1. **Download the extension files** and save them in a folder on your computer.

2. **Open Chrome** and navigate to `chrome://extensions/`

3. **Enable Developer Mode** by toggling the switch in the top-right corner.

4. **Click "Load unpacked"** and select the folder containing the extension files.

5. **Pin the extension** to your toolbar for easy access.

## Required Files

Make sure you have all these files in your extension folder:

```
youtube-summarizer/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── content.js
└── README.md
```

## Usage

### Method 1: Extension Popup

1. Navigate to any YouTube video
2. Click the extension icon in your toolbar
3. Click "Summarize Current Video"
4. The extension will automatically open Gemini in a new tab and submit the prompt

### Method 2: Floating Button

1. When on a YouTube video page, you'll see a floating "🤖 Summarize" button
2. Click the button for instant summarization
3. Gemini will open automatically with your video URL

## Customization

### Custom Prompt Templates

1. Click the extension icon
2. Modify the prompt template in the text area
3. Use `{URL}` as a placeholder for the video URL
4. Click "Save Settings" or wait for auto-save

### Default Prompt

```
Please summarize this YouTube video in detail, including the main points, key insights, and important takeaways: {URL}
```

## How It Works

1. **Detects YouTube videos** - The extension only activates on YouTube watch pages
2. **Extracts video URL** - Captures the current video URL from the browser
3. **Formats prompt** - Inserts the URL into your custom prompt template
4. **Opens Gemini** - Creates a new tab with Google Gemini
5. **Auto-submits** - Automatically pastes the prompt and submits it

## Permissions Explained

- `activeTab` - Access the current YouTube tab to get the video URL
- `tabs` - Create new tabs for Gemini
- `scripting` - Inject scripts to automate Gemini interaction
- `https://www.youtube.com/*` - Work on YouTube pages
- `https://gemini.google.com/*` - Interact with Gemini

## Troubleshooting

### Extension doesn't work

- Make sure you're on a YouTube video page (URL contains `/watch`)
- Check that the extension is enabled in `chrome://extensions/`
- Try refreshing the YouTube page

### Gemini doesn't auto-submit

- The extension waits 3 seconds for Gemini to load
- If auto-submit fails, the prompt will be in the text box - just press Enter
- Make sure you're signed into your Google account

### Floating button doesn't appear

- Refresh the YouTube page
- Make sure you're on a video page, not the homepage
- Check if the button is hidden behind other page elements

## Privacy & Security

- This extension only accesses YouTube video URLs
- No video content is processed locally
- All summarization is handled by Google Gemini
- No data is stored or transmitted to third parties

## Updates & Support

To update the extension:

1. Replace the files with new versions
2. Go to `chrome://extensions/`
3. Click the refresh button on the extension

## License

This extension is provided as-is for educational and personal use.
