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

// Function to create summarize button next to video title
function createTitleButton() {
    // Check if button already exists
    if (document.getElementById('yt-summarizer-title-btn')) {
        return;
    }
    
    // Wait for YouTube's title element to load
    const titleSelectors = [
        // 'h1.ytd-watch-metadata yt-formatted-string',
        // 'h1.ytd-video-primary-info-renderer',
        // 'h1[class*="title"]',
        // '.ytd-watch-metadata h1',
        // '.ytd-watch-metadata',
        // 'h1[class*="ytd-watch-metadata"]',
        'div#title.ytd-watch-metadata'
    ];
    
    let titleElement = null;
    for (const selector of titleSelectors) {
        titleElement = document.querySelector(selector);
        if (titleElement) break;
    }
    
    if (!titleElement) {
        // Retry after a short delay if title not found
        setTimeout(createTitleButton, 1000);
        return;
    }
    
    // Find the best container for the button (usually the title's parent container)
    let buttonContainer = titleElement.closest('.ytd-watch-metadata') || 
                         titleElement.closest('.ytd-video-primary-info-renderer') ||
                         titleElement.parentElement;
    
    if (!buttonContainer) {
        buttonContainer = titleElement.parentElement;
    }
    
    // Create the button
    const button = document.createElement('button');
    button.id = 'yt-summarizer-title-btn';
    button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Summarize this video
    `;
    
    // Style the button to match YouTube's design
    button.style.cssText = `
        display: inline-flex;
        align-items: center;
        background: rgba(255, 0, 0, 0.7);
        color: var(--yt-spec-text-primary, #fff);
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 8px 16px;
        border-radius: 18px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        margin: 8px 0 8px 0;
        transition: all 0.2s ease;
        font-family: "Roboto", sans-serif;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    // Hover effects
    button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(255, 255, 255, 0.2)';
        button.style.transform = 'translateY(-1px)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = 'rgba(255, 0, 0, 0.7)';
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'none';
    });
    
    // Click handler
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            // Get the prompt template from storage
            const result = await chrome.storage.sync.get(['promptTemplate']);
            const promptTemplate = result.promptTemplate || PROMPT_TEMPLATE
            const prompt = promptTemplate.replace('{URL}', window.location.href);
            
            // Visual feedback
            const originalHTML = button.innerHTML;
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; animation: spin 1s linear infinite;">
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Opening Gemini...
            `;
            button.style.background = 'rgba(52, 168, 83, 0.2)';
            button.disabled = true;
            
            // Add spinning animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            // Send message to background script
            chrome.runtime.sendMessage({
                action: 'summarizeVideo',
                prompt: prompt
            });
            
            // Reset button after delay
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = 'rgba(255, 255, 255, 0.1)';
                button.disabled = false;
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 3000);
            
        } catch (error) {
            console.error('Error in title button click:', error);
            
            // Error feedback
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Error occurred
            `;
            button.style.background = 'rgba(234, 67, 53, 0.2)';
            
            setTimeout(() => {
                button.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Summarize this video
                `;
                button.style.background = 'rgba(255, 255, 255, 0.1)';
                button.disabled = false;
            }, 3000);
        }
    });
    
    // Insert button after the title
    if (buttonContainer) {
        // Create a wrapper div for better positioning
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.cssText = `
            margin: 8px 0;
            display: flex;
            align-items: center;
        `;
        buttonWrapper.appendChild(button);
        
        // Insert after title element
        titleElement.after(buttonWrapper);
    }
}

// Optional: Add a floating button on YouTube pages for backup access
function createFloatingButton() {
    // Check if button already exists
    if (document.getElementById('yt-summarizer-btn')) {
        return;
    }
    
    const button = document.createElement('button');
    button.id = 'yt-summarizer-btn';
    button.innerHTML = '🤖';
    button.title = 'Summarize Video (Backup)';
    
    // Make it smaller and less intrusive since we have the title button now
    button.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        z-index: 9999;
        background: rgba(255, 255, 255);
        color: white;
        border: none;
        padding: 12px;
        border-radius: 50%;
        font-size: 16px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
    `;
    
    // Hover effects
    button.addEventListener('mouseenter', () => {
        button.style.opacity = '1';
        button.style.transform = 'scale(1.1)';
        button.style.background = 'rgba(66, 133, 244, 0.9)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.opacity = '0.7';
        button.style.transform = 'scale(1)';
        button.style.background = 'rgba(255, 255, 255)';
    });
    
    // Click handler - same as title button
    button.addEventListener('click', async () => {
        try {
            const result = await chrome.storage.sync.get(['promptTemplate']);
            const promptTemplate = result.promptTemplate || PROMPT_TEMPLATE
            const prompt = promptTemplate.replace('{URL}', window.location.href);
            
            // Visual feedback
            button.textContent = '✓';
            button.style.background = 'rgba(52, 168, 83, 0.9)';
            
            chrome.runtime.sendMessage({
                action: 'summarizeVideo',
                prompt: prompt
            });
            
            setTimeout(() => {
                button.innerHTML = '🤖';
                button.style.background = 'rgba(0, 0, 0, 0.7)';
            }, 2000);
            
        } catch (error) {
            console.error('Error in floating button click:', error);
            button.textContent = '❌';
            button.style.background = 'rgba(234, 67, 53, 0.9)';
            
            setTimeout(() => {
                button.innerHTML = '🤖';
                button.style.background = 'rgba(0, 0, 0, 0.7)';
            }, 2000);
        }
    });
    
    document.body.appendChild(button);
}

// Initialize buttons when page loads
function initializeButtons() {
    if (window.location.href.includes('youtube.com/watch')) {
        createTitleButton();
        createFloatingButton(); // Keep as backup
    }
}

// Create buttons when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeButtons);
} else {
    initializeButtons();
}

// Handle navigation changes on YouTube (since it's a SPA)
let currentUrl = window.location.href;

// Listen for URL changes and YouTube's dynamic loading
const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        
        // Remove existing buttons
        const existingTitleButton = document.getElementById('yt-summarizer-title-btn');
        const existingFloatingButton = document.getElementById('yt-summarizer-btn');
        
        if (existingTitleButton) {
            existingTitleButton.closest('div')?.remove();
        }
        if (existingFloatingButton) {
            existingFloatingButton.remove();
        }
        
        // Add buttons if on video page
        if (currentUrl.includes('youtube.com/watch')) {
            // Wait for page content to load
            setTimeout(initializeButtons, 1500);
        }
    }
    
    // Also watch for title changes (in case title loads after URL change)
    if (currentUrl.includes('youtube.com/watch') && !document.getElementById('yt-summarizer-title-btn')) {
        setTimeout(createTitleButton, 1000);
    }
});

observer.observe(document.body, { 
    childList: true, 
    subtree: true 
});

// Additional observer specifically for YouTube's metadata area
function observeMetadata() {
    const metadataSelector = '#below-the-fold, #above-the-fold, .ytd-watch-metadata, #primary-inner';
    const metadataContainer = document.querySelector(metadataSelector);
    
    if (metadataContainer) {
        const metadataObserver = new MutationObserver(() => {
            if (window.location.href.includes('youtube.com/watch') && !document.getElementById('yt-summarizer-title-btn')) {
                setTimeout(createTitleButton, 500);
            }
        });
        
        metadataObserver.observe(metadataContainer, {
            childList: true,
            subtree: true
        });
    } else {
        // Retry if metadata container not found yet
        setTimeout(observeMetadata, 1000);
    }
}

// Start observing metadata changes
setTimeout(observeMetadata, 2000);

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