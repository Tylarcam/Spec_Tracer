// Background script for Claude Debug Helper
chrome.runtime.onInstalled.addListener(() => {
  console.log('Claude Debug Helper installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeElement') {
    analyzeElementWithClaude(request.query, request.context)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});

// Analyze element with Claude API
async function analyzeElementWithClaude(query, context) {
  // Get API key from storage
  const result = await chrome.storage.sync.get(['claudeApiKey']);
  const apiKey = result.claudeApiKey;
  
  if (!apiKey) {
    throw new Error('Claude API key not set. Please configure it in the extension popup.');
  }
  
  // Prepare the prompt
  const prompt = `
You are a web debugging expert. A user is asking about an HTML element on a webpage. 

Element Context:
- Tag: ${context.tag}
- ID: ${context.id}
- Classes: ${context.classes}
- Text Content: ${context.text}
- HTML: ${context.html}
- Position: ${JSON.stringify(context.position)}
- Styles: ${JSON.stringify(context.styles)}
- Parent: ${JSON.stringify(context.parent)}
- Page URL: ${context.url}
- Page Title: ${context.pageTitle}

User Query: ${query}

Please provide a debugging analysis in the following JSON format:
{
  "analysis": "Brief analysis of the element and potential issues",
  "issues": ["Issue 1", "Issue 2", "Issue 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "codeSnippet": "Any relevant code snippet or CSS fix (optional)"
}

Focus on common web development issues like CSS problems, JavaScript errors, accessibility issues, layout problems, and functionality bugs.
`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.content[0].text;
    
    // Try to parse JSON from the response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.log('Failed to parse JSON, using fallback format');
    }
    
    // Fallback if JSON parsing fails
    return {
      analysis: content,
      issues: ['Could not parse specific issues from response'],
      recommendations: ['Please review the full analysis above'],
      codeSnippet: null
    };
    
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggleDebugMode' });
});