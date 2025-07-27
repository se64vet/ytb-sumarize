// Default prompt template
const DEFAULT_PROMPT = "Please provide a comprehensive summary of this YouTube video, including main points, key insights, and important takeaways: {URL}";

// Load saved settings when page loads
function loadSettings() {
    chrome.storage.sync.get(['promptTemplate'], function(result) {
        const promptTemplate = result.promptTemplate || DEFAULT_PROMPT;
        document.getElementById('promptTemplate').value = promptTemplate;
    });
}

// Save settings
function saveSettings() {
    const promptTemplate = document.getElementById('promptTemplate').value.trim() || DEFAULT_PROMPT;
    
    chrome.storage.sync.set({
        promptTemplate: promptTemplate
    }, function() {
        showStatus('Settings saved successfully!', 'success');
    });
}

// Reset to default prompt
function resetToDefault() {
    document.getElementById('promptTemplate').value = DEFAULT_PROMPT;
    saveSettings();
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

// Use example prompt
function useExample(element) {
    const promptText = element.textContent.replace(/^[^:]+:\s*/, '').trim();
    document.getElementById('promptTemplate').value = promptText;
    
    // Auto-save when using example
    saveSettings();
    
    // Visual feedback
    element.style.backgroundColor = '#e3f2fd';
    setTimeout(() => {
        element.style.backgroundColor = 'white';
    }, 500);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('resetToDefault').addEventListener('click', resetToDefault);
    
    // Auto-save on Ctrl+S
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveSettings();
        }
    });
    
    // Auto-save with debounce when typing
    let saveTimeout;
    document.getElementById('promptTemplate').addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveSettings();
        }, 2000); // Auto-save after 2 seconds of no typing
    });
});

// Make useExample available globally
window.useExample = useExample;