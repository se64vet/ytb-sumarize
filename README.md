# YouTube Video Summarizer Chrome Extension

A Chrome extension that automatically summarizes YouTube videos using Google Gemini AI with one-click functionality.

## Features

- 🎯 **One-click summarization** - Click the extension icon to instantly summarize
- 🤖 **Automatic Gemini integration** - Opens and submits prompt automatically
- ⚙️ **Customizable prompts** - Dedicated options page for prompt templates
- 🎮 **Floating button** - Quick access button on YouTube pages
- 🔔 **Smart notifications** - Status updates and error handling
- 💾 **Auto-save settings** - Prompts saved automatically

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
├── options.html
├── options.js
├── background.js
├── content.js
└── README.md
```

## Usage

### One-Click Summarization

1. Navigate to any YouTube video
2. Click the extension icon in your toolbar
3. Gemini will automatically open in a new tab with your summary request

### Floating Button (Alternative)

- Look for the "🤖 Summarize" button on YouTube video pages
- Click for instant summarization

### Customizing Prompts

1. Right-click the extension icon → "Options"
2. Or go to `chrome://extensions/` → Find the extension → "Extension options"
3. Modify the prompt template (use `{URL}` as placeholder)
4. Settings save automatically

## How It Works

1. **One-click activation** - Extension icon directly triggers summarization
2. **URL extraction** - Gets the current YouTube video URL
3. **Prompt formatting** - Inserts URL into your custom template
4. **Auto-Gemini** - Opens Gemini and submits the prompt automatically
5. **Smart notifications** - Shows status updates and handles errors

## Customization Options

### Example Prompt Templates

**Detailed Summary:**

```
Please provide a comprehensive summary of this YouTube video, including main points, key insights, and important takeaways: {URL}
```

**Bullet Points:**

```
Summarize this YouTube video in bullet points, highlighting the most important information: {URL}
```

**Educational Focus:**

```
Analyze this educational YouTube video and provide: 1) Main concepts taught, 2) Key learning objectives, 3) Practical applications: {URL}
```

**Quick Overview:**

```
Give me a quick 3-sentence summary of what this YouTube video is about: {URL}
```

## Permissions Explained

- `activeTab` - Access current YouTube tab for URL extraction
- `tabs` - Create new tabs for Gemini
- `scripting` - Automate Gemini interaction
- `storage` - Save your custom prompt templates
- `notifications` - Show status messages
- YouTube & Gemini host permissions for functionality

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
