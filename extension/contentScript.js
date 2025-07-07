// Content script for Claude Debug Helper
let isDebugMode = false;
let debugModal = null;
let selectedElement = null;
let originalOutline = '';

// Initialize debug mode
function initializeDebugMode() {
  // Add debug button to page
  createDebugButton();
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleDebugMode') {
      toggleDebugMode();
      sendResponse({status: 'toggled'});
    }
  });

  // Listen for ESC key to stop debug mode
  document.addEventListener('keydown', (e) => {
    if (isDebugMode && e.key === 'Escape') {
      toggleDebugMode();
    }
  });
}

// Create floating debug button
function createDebugButton() {
  const button = document.createElement('div');
  button.id = 'claude-debug-btn';
  button.innerHTML = '🐛';
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
    button.innerHTML = '🔍';
    addElementListeners();
    showDebugOverlay();
  } else {
    button.style.background = '#4f46e5';
    button.innerHTML = '🐛';
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

// Show debug modal
function showDebugModal(element) {
  if (debugModal) {
    debugModal.remove();
  }
  
  debugModal = document.createElement('div');
  debugModal.id = 'claude-debug-modal';
  debugModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Debug Element</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="element-info">
          <h4>Element Information:</h4>
          <p><strong>Tag:</strong> ${element.tagName.toLowerCase()}</p>
          <p><strong>Classes:</strong> ${element.className || 'None'}</p>
          <p><strong>ID:</strong> ${element.id || 'None'}</p>
          <p><strong>Text:</strong> ${element.textContent?.substring(0, 100) || 'None'}...</p>
        </div>
        
        <div class="query-section">
          <h4>What would you like to debug?</h4>
          <textarea id="debug-query" placeholder="e.g., Why isn't this button working? What's causing the layout issue?"></textarea>
          <button id="analyze-btn">Analyze with Claude</button>
        </div>
        
        <div id="analysis-result" style="display: none;">
          <h4>Analysis Result:</h4>
          <div id="analysis-content"></div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(debugModal);
  
  // Add event listeners
  debugModal.querySelector('.close-btn').addEventListener('click', closeDebugModal);
  debugModal.querySelector('#analyze-btn').addEventListener('click', analyzeElement);
  
  // Focus on textarea
  debugModal.querySelector('#debug-query').focus();
}

// Close debug modal
function closeDebugModal() {
  if (debugModal) {
    debugModal.remove();
    debugModal = null;
  }
}

// Analyze element with Claude
async function analyzeElement() {
  const query = document.getElementById('debug-query').value;
  if (!query.trim()) return;
  
  const analyzeBtn = document.getElementById('analyze-btn');
  const resultDiv = document.getElementById('analysis-result');
  const contentDiv = document.getElementById('analysis-content');
  
  analyzeBtn.textContent = 'Analyzing...';
  analyzeBtn.disabled = true;
  
  try {
    // Get element context
    const elementContext = getElementContext(selectedElement);
    
    // Send to background script for API call
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeElement',
      query: query,
      context: elementContext
    });
    
    if (response.success) {
      contentDiv.innerHTML = formatAnalysisResult(response.data);
      resultDiv.style.display = 'block';
    } else {
      contentDiv.innerHTML = `<p class="error">Error: ${response.error}</p>`;
      resultDiv.style.display = 'block';
    }
    
  } catch (error) {
    contentDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    resultDiv.style.display = 'block';
  }
  
  analyzeBtn.textContent = 'Analyze with Claude';
  analyzeBtn.disabled = false;
}

// Get element context for analysis
function getElementContext(element) {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  
  return {
    tag: element.tagName.toLowerCase(),
    id: element.id,
    classes: element.className,
    text: element.textContent?.substring(0, 200),
    html: element.outerHTML.substring(0, 500),
    position: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    },
    styles: {
      display: styles.display,
      position: styles.position,
      visibility: styles.visibility,
      opacity: styles.opacity,
      zIndex: styles.zIndex,
      backgroundColor: styles.backgroundColor,
      color: styles.color
    },
    parent: element.parentElement ? {
      tag: element.parentElement.tagName.toLowerCase(),
      classes: element.parentElement.className
    } : null,
    url: window.location.href,
    pageTitle: document.title
  };
}

// Format analysis result
function formatAnalysisResult(data) {
  return `
    <div class="analysis-sections">
      <div class="section">
        <h5>🔍 Analysis</h5>
        <p>${data.analysis}</p>
      </div>
      
      <div class="section">
        <h5>🎯 Potential Issues</h5>
        <ul>
          ${data.issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>
      </div>
      
      <div class="section">
        <h5>💡 Recommendations</h5>
        <ul>
          ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
      
      ${data.codeSnippet ? `
        <div class="section">
          <h5>📝 Code Snippet</h5>
          <pre><code>${data.codeSnippet}</code></pre>
        </div>
      ` : ''}
    </div>
  `;
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDebugMode);
} else {
  initializeDebugMode();
}