// Content script for YouTube pages
// This script runs on YouTube pages and can interact with the page content

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getCurrentVideoUrl') {
        const currentUrl = window.location.href;
        
        // Check if we're on a video page
        if (currentUrl.includes('youtube.com/watch')) {
            sendResponse({ success: true, url: currentUrl });
        } else {
            sendResponse({ success: false, error: 'Not on a YouTube video page' });
        }
    }
    
    return true; // Keep the message channel open for async responses
});

// Optional: Add a floating button on YouTube pages
function createFloatingButton() {
    // Check if button already exists
    if (document.getElementById('yt-summarizer-btn')) {
        return;
    }
    
    const button = document.createElement('button');
    button.id = 'yt-summarizer-btn';
    button.innerHTML = '🤖 Summarize';
    button.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        background: #4285f4;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    
    // Hover effects
    button.addEventListener('mouseenter', () => {
        button.style.background = '#3367d6';
        button.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = '#4285f4';
        button.style.transform = 'scale(1)';
    });
    
    // Click handler
    button.addEventListener('click', () => {
        // Send message to background script to start summarization
        chrome.runtime.sendMessage({
            action: 'summarizeFromFloatingButton',
            url: window.location.href
        });
        
        // Visual feedback
        button.textContent = '✓ Opening Gemini...';
        button.style.background = '#34a853';
        
        setTimeout(() => {
            button.innerHTML = '🤖 Summarize';
            button.style.background = '#4285f4';
        }, 2000);
    });
    
    document.body.appendChild(button);
}

// Create floating button when page loads
if (window.location.href.includes('youtube.com/watch')) {
    // Wait for page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createFloatingButton);
    } else {
        createFloatingButton();
    }
}

// Handle navigation changes on YouTube (since it's a SPA)
let currentUrl = window.location.href;

// Listen for URL changes
const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        
        // If navigated to a video page, create the floating button
        if (currentUrl.includes('youtube.com/watch')) {
            setTimeout(createFloatingButton, 1000); // Wait for page to load
        } else {
            // Remove button if not on video page
            const existingButton = document.getElementById('yt-summarizer-btn');
            if (existingButton) {
                existingButton.remove();
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// Handle the floating button click message in background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'summarizeFromFloatingButton') {
        // Get the prompt template and create the full prompt
        chrome.storage.sync.get(['promptTemplate'], (result) => {
            const promptTemplate = result.promptTemplate || PROMPT_TEMPLATE;
            const prompt = promptTemplate.replace('{URL}', request.url);
            
            // Send to background script for processing
            chrome.runtime.sendMessage({
                action: 'summarizeVideo',
                prompt: prompt
            });
        });
    }
});

// Prompt template
let PROMPT_TEMPLATE = `

Given a YouTube video URL {URL}, generate a summary of its content in English, regardless of the video's language, with a total length of 150-300 words. Base the summary solely on the video's audio and visual content for the main sections, ensuring consistent output for the same URL every time. Follow this structure and instructions:

1. TL;DR Summary: Write a 2-3 sentence overview (50-70 words) capturing the video's main topic and purpose in a simple, casual tone.

2. Practical Takeaways: List 2-3 actionable insights or key lessons from the video in bullet points, each 1-2 sentences, focusing on practical applications.

3. Main Points: Provide 4-6 bullet points, each 1-2 sentences, summarizing key facts, concepts, or arguments from the video. Include approximate timestamps (e.g., '[2:30]') for each point. Do not include external information in this section.

4. External Context: Include 1-2 bullet points with relevant information from the web or other sources to provide additional context, clearly noting that this information is not from the video.

5. Evaluation: Include 1-2 sentences evaluating the video's credibility or quality (e.g., clarity, reliability of information).


- Tone: Use a simple words, casual tone for accessibility to a general audience.

- Focus: Emphasize facts, concepts, and key arguments in the main points; avoid personal opinions in the summary.

- Length: Ensure the total word count (excluding timestamps) is 150-300 words.

- Consistency: For the TL;DR, Practical Takeaways, and Main Points, use only video content to ensure identical output for the same URL.

Example output structure: 

###TL;DR Summary: [Brief overview of video's topic and purpose] 

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