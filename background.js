// Background script to handle the automation
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'summarizeVideo') {
        handleSummarizeVideo(request.prompt)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        
        // Return true to indicate we'll send a response asynchronously
        return true;
    }
});

async function handleSummarizeVideo(prompt) {
    try {
        // Open Gemini in a new tab
        const geminiTab = await chrome.tabs.create({
            url: 'https://gemini.google.com/',
            active: true
        });
        
        // Wait a moment for the page to load, then inject the prompt
        setTimeout(async () => {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: geminiTab.id },
                    func: injectPromptToGemini,
                    args: [prompt]
                });
            } catch (error) {
                console.error('Error injecting script:', error);
            }
        }, 3000); // Wait 3 seconds for Gemini to load
        
        return { success: true };
        
    } catch (error) {
        console.error('Error in handleSummarizeVideo:', error);
        return { success: false, error: error.message };
    }
}

// Function to be injected into the Gemini page
function injectPromptToGemini(prompt) {
    // Function to wait for element to appear
    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Timeout after specified time
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }
    
    // Try multiple selectors for the Gemini chat input
    const possibleSelectors = [
        'div[contenteditable="true"]',
        'textarea[placeholder*="Enter a prompt"]',
        'textarea[aria-label*="Message"]',
        '[data-testid="chat-input"]',
        '.ql-editor',
        'div[role="textbox"]',
        'rich-textarea textarea',
        'div.ql-editor.ql-blank'
    ];
    
    async function findAndFillInput() {
        for (const selector of possibleSelectors) {
            try {
                const inputElement = await waitForElement(selector, 2000);
                
                if (inputElement) {
                    console.log('Found input element with selector:', selector);
                    
                    // Focus on the element
                    inputElement.focus();
                    
                    // Clear any existing content
                    if (inputElement.tagName === 'TEXTAREA') {
                        inputElement.value = '';
                        inputElement.value = prompt;
                        
                        // Trigger input events
                        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
                    } else {
                        // For contenteditable divs
                        inputElement.innerHTML = '';
                        inputElement.textContent = prompt;
                        
                        // Trigger input events
                        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    
                    // Wait a moment, then try to find and click the send button
                    setTimeout(() => {
                        const sendSelectors = [
                            'button[aria-label*="Send"]',
                            'button[data-testid="send-button"]',
                            'button[type="submit"]',
                            'button svg[data-testid="send-icon"]',
                            '.send-button',
                            'button:has(svg)',
                            '[data-mat-icon-name="send"]'
                        ];
                        
                        for (const sendSelector of sendSelectors) {
                            const sendButton = document.querySelector(sendSelector);
                            if (sendButton && !sendButton.disabled) {
                                console.log('Found send button with selector:', sendSelector);
                                sendButton.click();
                                return;
                            }
                        }
                        
                        // If no send button found, try pressing Enter
                        console.log('No send button found, trying Enter key');
                        const enterEvent = new KeyboardEvent('keydown', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                            which: 13,
                            bubbles: true
                        });
                        inputElement.dispatchEvent(enterEvent);
                        
                    }, 500);
                    
                    return;
                }
            } catch (error) {
                console.log(`Selector ${selector} not found, trying next...`);
                continue;
            }
        }
        
        console.error('Could not find Gemini input field');
        
        // Fallback: try to paste using clipboard API if available
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(prompt);
                console.log('Prompt copied to clipboard as fallback');
            } catch (err) {
                console.error('Could not copy to clipboard:', err);
            }
        }
    }
    
    // Start the process
    findAndFillInput();
}