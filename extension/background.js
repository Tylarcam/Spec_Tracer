// Background script for Trace Sight Debug View Extension
console.log('Trace Sight Debug View Extension loaded');

// Extension installation handler
chrome.runtime.onInstalled.addListener(() => {
  console.log('Trace Sight Debug View Extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    isActive: false,
    apiKey: null
  });
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'analyzeElement':
      handleAnalyzeElement(request, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'getSettings':
      handleGetSettings(sendResponse);
      return true;
      
    case 'saveSettings':
      handleSaveSettings(request.settings, sendResponse);
      return true;
      
    case 'toggleLogTrace':
      handleToggleLogTrace(request.tabId, request.activate, request.apiKey, sendResponse);
      return true;
      
    case 'injectContentScript':
      handleInjectContentScript(request.tabId, sendResponse);
      return true;
      
    default:
      console.log('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }
});

// Handle element analysis with AI
async function handleAnalyzeElement(request, sendResponse) {
  try {
    const result = await analyzeElementWithAI(request.query, request.context);
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('Error analyzing element:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Get settings from storage
async function handleGetSettings(sendResponse) {
  try {
    const result = await chrome.storage.sync.get(['apiKey', 'isActive']);
    sendResponse({ success: true, settings: result });
  } catch (error) {
    console.error('Error getting settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Save settings to storage
async function handleSaveSettings(settings, sendResponse) {
  try {
    await chrome.storage.sync.set(settings);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle content script injection
async function handleInjectContentScript(tabId, sendResponse) {
  try {
    // Check if tab exists and is accessible
    const tab = await chrome.tabs.get(tabId);
    
    // Don't inject into chrome:// or extension pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      sendResponse({ success: false, error: 'Cannot inject into this page type' });
      return;
    }
    
    // Inject CSS first
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['contentScript.css']
    });
    
    // Then inject JavaScript
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['contentScript.js']
    });
    
    // Wait a moment for content script to initialize
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { action: 'activate' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Content script not ready yet, but injection successful');
        }
      });
    }, 100);
    
    sendResponse({ success: true });
    
  } catch (error) {
    console.error('Error injecting content script:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Toggle LogTrace on/off
async function handleToggleLogTrace(tabId, activate, apiKey, sendResponse) {
  try {
    // Update storage with new state
    await chrome.storage.sync.set({ isActive: activate });
    
    if (activate) {
      // First inject the content script if not already present
      try {
        // Check if tab exists and is accessible
        const tab = await chrome.tabs.get(tabId);
        
        // Don't inject into chrome:// or extension pages
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
          sendResponse({ success: false, error: 'Cannot activate LogTrace on this page type' });
          return;
        }
        
        // Inject CSS first
        await chrome.scripting.insertCSS({
          target: { tabId },
          files: ['contentScript.css']
        });
        
        // Then inject JavaScript
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['contentScript.js']
        });
        
        // Wait a moment for content script to initialize, then activate
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, { 
            action: 'activate',
            apiKey: apiKey 
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.log('Content script activation pending');
            }
          });
        }, 500);
        
      } catch (injectionError) {
        console.error('Error injecting content script:', injectionError);
        sendResponse({ success: false, error: 'Failed to inject LogTrace into this page' });
        return;
      }
    } else {
      // Deactivate LogTrace
      chrome.tabs.sendMessage(tabId, { action: 'deactivate' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Content script not available for deactivation');
        }
      });
    }
    
    sendResponse({ success: true, isActive: activate });
  } catch (error) {
    console.error('Error toggling LogTrace:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// AI-powered element analysis
async function analyzeElementWithAI(query, context) {
  // Get API key from storage
  const result = await chrome.storage.sync.get(['apiKey']);
  const apiKey = result.apiKey;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please set it in the extension popup.');
  }
  
  // Prepare the analysis prompt
  const prompt = `
You are a web development debugging expert. A user is asking about an HTML element on a webpage.

Element Context:
- Tag: ${context.tag || 'Unknown'}
- ID: ${context.id || 'None'}
- Classes: ${context.classes || 'None'}
- Text Content: ${context.text || 'None'}
- HTML: ${context.html || 'Not available'}
- Position: ${JSON.stringify(context.position || {})}
- Computed Styles: ${JSON.stringify(context.styles || {})}
- Parent Element: ${JSON.stringify(context.parent || {})}
- Page URL: ${context.url || 'Unknown'}
- Page Title: ${context.pageTitle || 'Unknown'}
- Viewport: ${JSON.stringify(context.viewport || {})}

User Query: ${query}

Please provide a comprehensive debugging analysis in JSON format:
{
  "summary": "Brief summary of the element and its current state",
  "analysis": "Detailed analysis of the element, its behavior, and potential issues",
  "issues": [
    "Specific Issue 1",
    "Specific Issue 2",
    "Specific Issue 3"
  ],
  "recommendations": [
    "Actionable Recommendation 1",
    "Actionable Recommendation 2", 
    "Actionable Recommendation 3"
  ],
  "codeSnippets": {
    "css": "/* CSS fixes or improvements */",
    "javascript": "// JavaScript solutions",
    "html": "<!-- HTML structure improvements -->"
  },
  "debugging_steps": [
    "Step 1: Check this first",
    "Step 2: Then verify this",
    "Step 3: Finally test this"
  ]
}

Focus on:
- CSS layout and styling issues
- JavaScript functionality problems
- Accessibility concerns
- Performance implications
- Cross-browser compatibility
- Mobile responsiveness
- SEO considerations
- User experience problems

Provide specific, actionable advice that a developer can immediately implement.
`;

  try {
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web developer and debugging specialist. Always respond with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse JSON from the response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON from AI response, using fallback format');
    }
    
    // Fallback if JSON parsing fails
    return {
      summary: "Analysis completed",
      analysis: content,
      issues: ["Could not parse specific issues from AI response"],
      recommendations: ["Please review the full analysis provided"],
      codeSnippets: {
        css: "/* No specific CSS provided */",
        javascript: "// No specific JavaScript provided",
        html: "<!-- No specific HTML provided -->"
      },
      debugging_steps: [
        "Review the analysis above",
        "Check browser developer tools",
        "Test in different browsers"
      ]
    };
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Get current state
    const result = await chrome.storage.sync.get(['isActive']);
    const newState = !result.isActive;
    
    // Update state
    await chrome.storage.sync.set({ isActive: newState });
    
    // Inject content script if activating
    if (newState) {
      try {
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['contentScript.css']
        });
        
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['contentScript.js']
        });
      } catch (injectError) {
        console.error('Failed to inject content script:', injectError);
      }
    }
    
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { 
      action: newState ? 'activate' : 'deactivate' 
    });
    
  } catch (error) {
    console.error('Error handling extension icon click:', error);
  }
});

// Handle tab updates to maintain LogTrace state
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const result = await chrome.storage.sync.get(['isActive']);
      if (result.isActive) {
        // Re-inject content script if LogTrace is active
        setTimeout(async () => {
          try {
            await chrome.scripting.insertCSS({
              target: { tabId },
              files: ['contentScript.css']
            });
            
            await chrome.scripting.executeScript({
              target: { tabId },
              files: ['contentScript.js']
            });
            
            chrome.tabs.sendMessage(tabId, { action: 'activate' });
          } catch (error) {
            console.log('Could not inject into tab:', error.message);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error handling tab update:', error);
    }
  }
});

// Listen for storage changes to sync across tabs
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.isActive) {
    const newValue = changes.isActive.newValue;
    
    // Notify all tabs about the state change
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { 
          action: newValue ? 'activate' : 'deactivate' 
        }).catch(() => {
          // Ignore errors for tabs that don't have content script
        });
      });
    });
  }
});