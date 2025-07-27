// Default prompt template
const DEFAULT_PROMPT = `
Given a YouTube video URL {URL}, generate a summary of its content in English, regardless of the video’s language, with a total length of 150-300 words. Base the summary solely on the video’s audio and visual content for the main sections, ensuring consistent output for the same URL every time. Follow this structure and instructions:

1. TL;DR Summary: Write a 2-3 sentence overview (50-70 words) capturing the video’s main topic and purpose in a simple, casual tone.

2. Practical Takeaways: List 2-3 actionable insights or key lessons from the video in bullet points, each 1-2 sentences, focusing on practical applications.

3. Main Points: Provide 4-6 bullet points, each 1-2 sentences, summarizing key facts, concepts, or arguments from the video. Include approximate timestamps (e.g., ‘[2:30]’) for each point. Do not include external information in this section.

4. External Context: Include 1-2 bullet points with relevant information from the web or other sources to provide additional context, clearly noting that this information is not from the video.

5. Evaluation: Include 1-2 sentences evaluating the video’s credibility or quality (e.g., clarity, reliability of information).


- Tone: Use a simple words, casual tone for accessibility to a general audience.

- Focus: Emphasize facts, concepts, and key arguments in the main points; avoid personal opinions in the summary.

- Length: Ensure the total word count (excluding timestamps) is 150-300 words.

- Consistency: For the TL;DR, Practical Takeaways, and Main Points, use only video content to ensure identical output for the same URL.

Example output structure: 

###TL;DR Summary: [Brief overview of video’s topic and purpose] 

###Practical Takeaways:
[Actionable insight]
[Actionable insight] 

###Main Points:
[Timestamp]: [Key point]
[Timestamp]: [Key point]

###External Context:
[Web-based info, noted as external] 

###Evaluation: 
[1-2 sentences on credibility/quality]
`
// Load saved settings
function loadSettings() {
    chrome.storage.sync.get(['promptTemplate'], function(result) {
        const promptTemplate = result.promptTemplate || DEFAULT_PROMPT;
        document.getElementById('promptTemplate').value = promptTemplate;
    });
}

// Save settings
function saveSettings() {
    const promptTemplate = document.getElementById('promptTemplate').value || DEFAULT_PROMPT;
    
    chrome.storage.sync.set({
        promptTemplate: promptTemplate
    }, function() {
        showStatus('Settings saved successfully!', 'success');
    });
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// Check if current tab is YouTube
async function isYouTubeTab() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab.url && tab.url.includes('youtube.com/watch');
    } catch (error) {
        console.error('Error checking tab:', error);
        return false;
    }
}

// Main summarize function
async function summarizeVideo() {
    const summarizeBtn = document.getElementById('summarizeBtn');
    
    try {
        // Check if we're on YouTube
        if (!(await isYouTubeTab())) {
            showStatus('Please navigate to a YouTube video first', 'error');
            return;
        }
        
        // Disable button and show processing status
        summarizeBtn.disabled = true;
        summarizeBtn.textContent = 'Processing...';
        showStatus('Getting video URL...', 'info');
        
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Get the prompt template
        const result = await chrome.storage.sync.get(['promptTemplate']);
        const promptTemplate = result.promptTemplate || DEFAULT_PROMPT;
        
        // Create the prompt with the video URL
        const prompt = promptTemplate.replace('{URL}', tab.url);
        
        showStatus('Opening Gemini...', 'info');
        
        // Send message to background script to handle the automation
        chrome.runtime.sendMessage({
            action: 'summarizeVideo',
            prompt: prompt
        }, (response) => {
            if (response && response.success) {
                showStatus('Successfully opened Gemini with prompt!', 'success');
            } else {
                showStatus('Error: ' + (response?.error || 'Unknown error'), 'error');
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        showStatus('An error occurred: ' + error.message, 'error');
    } finally {
        // Re-enable button
        summarizeBtn.disabled = false;
        summarizeBtn.textContent = 'Summarize Current Video';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    
    document.getElementById('summarizeBtn').addEventListener('click', summarizeVideo);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
});

// Auto-save prompt template when typing (with debounce)
let saveTimeout;
document.addEventListener('DOMContentLoaded', function() {
    const promptTextarea = document.getElementById('promptTemplate');
    
    promptTextarea.addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveSettings();
        }, 1000); // Auto-save after 1 second of no typing
    });
});