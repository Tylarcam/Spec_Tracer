// Content script for Claude Debug Helper - SECURITY HARDENED VERSION
let isDebugMode = false;
let debugModal = null;
let selectedElement = null;
let originalOutline = '';

// Security utilities
const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

const sanitizeText = (input, maxLength = 500) => {
  if (typeof input !== 'string') return '';
  return sanitizeHtml(input.slice(0, maxLength));
};

const validateInput = (input, maxLength = 2000) => {
  if (typeof input !== 'string') return false;
  if (input.length === 0 || input.length > maxLength) return false;
  
  // Check for potentially malicious patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
};

// Rate limiting
class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  isAllowed() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// Initialize debug mode
function initializeDebugMode() {
  createDebugButton();
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleDebugMode') {
      toggleDebugMode();
      sendResponse({status: 'toggled'});
    }
  });

  document.addEventListener('keydown', (e) => {
    if (isDebugMode && e.key === 'Escape') {
      toggleDebugMode();
    }
  });
}

// Create floating debug button with enhanced security
function createDebugButton() {
  const button = document.createElement('div');
  button.id = 'claude-debug-btn';
  
  // Use textContent instead of innerHTML for security
  button.textContent = '🐛';
  
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: #4f46e5;
    color: white;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
  `;
  
  button.addEventListener('click', toggleDebugMode);
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
  });
  
  document.body.appendChild(button);
}

// Toggle debug mode
function toggleDebugMode() {
  isDebugMode = !isDebugMode;
  const button = document.getElementById('claude-debug-btn');
  
  if (isDebugMode) {
    button.style.background = '#ef4444';
    button.textContent = '🔍';
    addElementListeners();
    showDebugOverlay();
  } else {
    button.style.background = '#4f46e5';
    button.textContent = '🐛';
    removeElementListeners();
    hideDebugOverlay();
  }
}

// Add click listeners to all elements
function addElementListeners() {
  document.addEventListener('click', handleElementClick, true);
  document.addEventListener('mouseover', handleElementHover, true);
  document.addEventListener('mouseout', handleElementOut, true);
}

// Remove element listeners
function removeElementListeners() {
  document.removeEventListener('click', handleElementClick, true);
  document.removeEventListener('mouseover', handleElementHover, true);
  document.removeEventListener('mouseout', handleElementOut, true);
}

// Handle element hover
function handleElementHover(e) {
  if (!isDebugMode) return;
  
  const element = e.target;
  if (element.id === 'claude-debug-btn' || element.closest('#claude-debug-modal')) return;
  
  originalOutline = element.style.outline;
  element.style.outline = '2px solid #4f46e5';
}

// Handle element out
function handleElementOut(e) {
  if (!isDebugMode) return;
  
  const element = e.target;
  if (element.id === 'claude-debug-btn' || element.closest('#claude-debug-modal')) return;
  
  element.style.outline = originalOutline;
}

// Handle element click
function handleElementClick(e) {
  if (!isDebugMode) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const element = e.target;
  if (element.id === 'claude-debug-btn' || element.closest('#claude-debug-modal')) return;
  
  selectedElement = element;
  showDebugModal(element);
}

// Show debug overlay
function showDebugOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'claude-debug-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.1);
    z-index: 9999;
    pointer-events: none;
  `;
  document.body.appendChild(overlay);
}

// Hide debug overlay
function hideDebugOverlay() {
  const overlay = document.getElementById('claude-debug-overlay');
  if (overlay) overlay.remove();
}

// Show debug modal with enhanced security
function showDebugModal(element) {
  if (debugModal) {
    debugModal.remove();
  }
  
  debugModal = document.createElement('div');
  debugModal.id = 'claude-debug-modal';
  
  // Create elements safely without innerHTML
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  
  const headerTitle = document.createElement('h3');
  headerTitle.textContent = 'Debug Element';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', closeDebugModal);
  
  modalHeader.appendChild(headerTitle);
  modalHeader.appendChild(closeBtn);
  
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  
  const elementInfo = document.createElement('div');
  elementInfo.className = 'element-info';
  
  const infoTitle = document.createElement('h4');
  infoTitle.textContent = 'Element Information:';
  elementInfo.appendChild(infoTitle);
  
  // Safely add element information
  const tagInfo = document.createElement('p');
  tagInfo.innerHTML = `<strong>Tag:</strong> ${sanitizeText(element.tagName.toLowerCase())}`;
  
  const classInfo = document.createElement('p');
  classInfo.innerHTML = `<strong>Classes:</strong> ${sanitizeText(element.className || 'None')}`;
  
  const idInfo = document.createElement('p');
  idInfo.innerHTML = `<strong>ID:</strong> ${sanitizeText(element.id || 'None')}`;
  
  const textInfo = document.createElement('p');
  const elementText = element.textContent?.substring(0, 100) || 'None';
  textInfo.innerHTML = `<strong>Text:</strong> ${sanitizeText(elementText)}...`;
  
  elementInfo.appendChild(tagInfo);
  elementInfo.appendChild(classInfo);
  elementInfo.appendChild(idInfo);
  elementInfo.appendChild(textInfo);
  
  const querySection = document.createElement('div');
  querySection.className = 'query-section';
  
  const queryTitle = document.createElement('h4');
  queryTitle.textContent = 'What would you like to debug?';
  
  const textarea = document.createElement('textarea');
  textarea.id = 'debug-query';
  textarea.placeholder = 'e.g., Why isn\'t this button working? What\'s causing the layout issue?';
  textarea.maxLength = 2000;
  
  const analyzeBtn = document.createElement('button');
  analyzeBtn.id = 'analyze-btn';
  analyzeBtn.textContent = 'Analyze with OpenAI';
  analyzeBtn.addEventListener('click', analyzeElement);
  
  querySection.appendChild(queryTitle);
  querySection.appendChild(textarea);
  querySection.appendChild(analyzeBtn);
  
  const resultDiv = document.createElement('div');
  resultDiv.id = 'analysis-result';
  resultDiv.style.display = 'none';
  
  const resultTitle = document.createElement('h4');
  resultTitle.textContent = 'Analysis Result:';
  
  const contentDiv = document.createElement('div');
  contentDiv.id = 'analysis-content';
  
  resultDiv.appendChild(resultTitle);
  resultDiv.appendChild(contentDiv);
  
  modalBody.appendChild(elementInfo);
  modalBody.appendChild(querySection);
  modalBody.appendChild(resultDiv);
  
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  
  debugModal.appendChild(modalContent);
  document.body.appendChild(debugModal);
  
  // Focus on textarea
  textarea.focus();
}

// Close debug modal
function closeDebugModal() {
  if (debugModal) {
    debugModal.remove();
    debugModal = null;
  }
}

// Analyze element with enhanced security
async function analyzeElement() {
  const queryTextarea = document.getElementById('debug-query');
  const query = queryTextarea.value;
  
  if (!query.trim()) {
    alert('Please enter a debugging question.');
    return;
  }
  
  if (!validateInput(query, 2000)) {
    alert('Invalid input. Please check your query and try again.');
    return;
  }
  
  if (!rateLimiter.isAllowed()) {
    alert('Too many requests. Please wait before trying again.');
    return;
  }
  
  const analyzeBtn = document.getElementById('analyze-btn');
  const resultDiv = document.getElementById('analysis-result');
  const contentDiv = document.getElementById('analysis-content');
  
  analyzeBtn.textContent = 'Analyzing...';
  analyzeBtn.disabled = true;
  
  try {
    const elementContext = getElementContext(selectedElement);
    // Use OpenAI GPT-4o Mini API directly
    const apiKey = localStorage.getItem('logtrace-api-key') || '';
    if (!apiKey) throw new Error('Missing OpenAI API key. Configure it in settings.');
    const prompt = `Debug this element in detail:\n\nElement: <${elementContext.tag}${elementContext.id ? ` id=\"${elementContext.id}\"` : ''}${elementContext.classes ? ` class=\"${elementContext.classes}\"` : ''}>\nText: \"${elementContext.text}\"\nPosition: x:${elementContext.position.x}, y:${elementContext.position.y}\n\nConsider:\n1. Why might this element not be behaving as expected?\n2. Are there any CSS properties preventing interaction?\n3. Are there any event listeners that might be interfering?\n4. What accessibility concerns might exist?\n5. How could the user experience be improved?\n\nProvide specific, actionable debugging steps and potential solutions.`;
    const userPrompt = `${prompt}\n\nUser question: ${query}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert web developer and debugger. Provide clear, actionable debugging advice.' },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });
    if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
    const data = await response.json();
    const llmResponse = data.choices[0].message.content;
    contentDiv.textContent = llmResponse;
    resultDiv.style.display = 'block';
  } catch (error) {
    const errorElement = document.createElement('p');
    errorElement.className = 'error';
    errorElement.textContent = `Error: ${sanitizeText(error.message)}`;
    contentDiv.textContent = '';
    contentDiv.appendChild(errorElement);
    resultDiv.style.display = 'block';
  }
  
  analyzeBtn.textContent = 'Analyze with OpenAI';
  analyzeBtn.disabled = false;
}

// Get element context with sanitization
function getElementContext(element) {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  
  return {
    tag: sanitizeText(element.tagName.toLowerCase()),
    id: sanitizeText(element.id),
    classes: sanitizeText(element.className),
    text: sanitizeText(element.textContent?.substring(0, 200) || ''),
    html: sanitizeText(element.outerHTML.substring(0, 500)),
    position: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    },
    styles: {
      display: sanitizeText(styles.display),
      position: sanitizeText(styles.position),
      visibility: sanitizeText(styles.visibility),
      opacity: sanitizeText(styles.opacity),
      zIndex: sanitizeText(styles.zIndex),
      backgroundColor: sanitizeText(styles.backgroundColor),
      color: sanitizeText(styles.color)
    },
    parent: element.parentElement ? {
      tag: sanitizeText(element.parentElement.tagName.toLowerCase()),
      classes: sanitizeText(element.parentElement.className)
    } : null,
    url: sanitizeText(window.location.href),
    pageTitle: sanitizeText(document.title)
  };
}

// Format analysis result with DOM manipulation instead of innerHTML
function formatAnalysisResult(data) {
  const container = document.createElement('div');
  container.className = 'analysis-sections';
  
  // Analysis section
  const analysisSection = document.createElement('div');
  analysisSection.className = 'section';
  
  const analysisTitle = document.createElement('h5');
  analysisTitle.textContent = '🔍 Analysis';
  
  const analysisText = document.createElement('p');
  analysisText.textContent = sanitizeText(data.analysis);
  
  analysisSection.appendChild(analysisTitle);
  analysisSection.appendChild(analysisText);
  
  // Issues section
  const issuesSection = document.createElement('div');
  issuesSection.className = 'section';
  
  const issuesTitle = document.createElement('h5');
  issuesTitle.textContent = '🎯 Potential Issues';
  
  const issuesList = document.createElement('ul');
  if (Array.isArray(data.issues)) {
    data.issues.forEach(issue => {
      const listItem = document.createElement('li');
      listItem.textContent = sanitizeText(issue);
      issuesList.appendChild(listItem);
    });
  }
  
  issuesSection.appendChild(issuesTitle);
  issuesSection.appendChild(issuesList);
  
  // Recommendations section
  const recsSection = document.createElement('div');
  recsSection.className = 'section';
  
  const recsTitle = document.createElement('h5');
  recsTitle.textContent = '💡 Recommendations';
  
  const recsList = document.createElement('ul');
  if (Array.isArray(data.recommendations)) {
    data.recommendations.forEach(rec => {
      const listItem = document.createElement('li');
      listItem.textContent = sanitizeText(rec);
      recsList.appendChild(listItem);
    });
  }
  
  recsSection.appendChild(recsTitle);
  recsSection.appendChild(recsList);
  
  // Code snippet section (if available)
  if (data.codeSnippet) {
    const codeSection = document.createElement('div');
    codeSection.className = 'section';
    
    const codeTitle = document.createElement('h5');
    codeTitle.textContent = '📝 Code Snippet';
    
    const codeElement = document.createElement('pre');
    const codeContent = document.createElement('code');
    codeContent.textContent = sanitizeText(data.codeSnippet);
    codeElement.appendChild(codeContent);
    
    codeSection.appendChild(codeTitle);
    codeSection.appendChild(codeElement);
    container.appendChild(codeSection);
  }
  
  container.appendChild(analysisSection);
  container.appendChild(issuesSection);
  container.appendChild(recsSection);
  
  return container;
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDebugMode);
} else {
  initializeDebugMode();
}
