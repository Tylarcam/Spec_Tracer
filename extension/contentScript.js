// Trace Sight Debug View - Content Script
console.log('Trace Sight Content Script loaded');

// State management
let isLogTraceActive = false;
let logTraceInstance = null;
let apiKey = null;
let currentElement = null;
let isHoverPaused = false;
let mousePosition = { x: 0, y: 0 };
let debugEvents = [];

// Initialize content script
function initializeContentScript() {
  console.log('Initializing Trace Sight Content Script');
  
  // Check if already initialized
  if (document.getElementById('log-trace-overlay')) {
    console.log('LogTrace already initialized');
    return;
  }
  
  // Create the main overlay container
  createLogTraceOverlay();
  
  // Set up event listeners
  setupEventListeners();
  
  // Get initial settings
  getExtensionSettings();
}

// Create the main LogTrace overlay
function createLogTraceOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'log-trace-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  document.body.appendChild(overlay);
  
  // Create floating toggle button
  const floatingButton = document.createElement('div');
  floatingButton.id = 'log-trace-toggle-button';
  floatingButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background: #475569;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    pointer-events: auto;
    z-index: 10003;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    user-select: none;
  `;
  
  floatingButton.innerHTML = `
    <div class="button-icon" style="
      font-size: 24px;
      color: #e2e8f0;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    ">🐛</div>
  `;
  
  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.id = 'log-trace-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    background: rgba(15, 23, 42, 0.95);
    color: #e2e8f0;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    z-index: 10004;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    pointer-events: none;
    white-space: nowrap;
    border: 1px solid #334155;
  `;
  tooltip.textContent = 'LogTrace Inactive';
  
  document.body.appendChild(floatingButton);
  document.body.appendChild(tooltip);
  
  // Add event listeners for floating button
  floatingButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLogTraceFromButton();
  });
  
  floatingButton.addEventListener('mouseenter', () => {
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
    floatingButton.style.transform = 'scale(1.1)';
  });
  
  floatingButton.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(10px)';
    floatingButton.style.transform = 'scale(1)';
  });
  
  // Create mouse position indicator
  const mouseIndicator = document.createElement('div');
  mouseIndicator.id = 'mouse-indicator';
  mouseIndicator.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    border: 2px solid #22c55e;
    border-radius: 50%;
    pointer-events: none;
    z-index: 10000;
    display: none;
    transform: translate(-50%, -50%);
  `;
  document.body.appendChild(mouseIndicator);
  
  // Create element highlighter
  const highlighter = document.createElement('div');
  highlighter.id = 'element-highlighter';
  highlighter.style.cssText = `
    position: fixed;
    border: 2px solid #06b6d4;
    background: rgba(6, 182, 212, 0.1);
    pointer-events: none;
    z-index: 9998;
    display: none;
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
  `;
  document.body.appendChild(highlighter);
  
  // Create info panel
  createInfoPanel();
}

// Create information panel
function createInfoPanel() {
  const panel = document.createElement('div');
  panel.id = 'log-trace-info-panel';
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    max-height: 400px;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 16px;
    color: #e2e8f0;
    font-size: 14px;
    z-index: 10001;
    display: none;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  `;
  
  panel.innerHTML = `
    <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 style="margin: 0; color: #06b6d4; font-size: 16px;">🔍 Element Inspector</h3>
      <button id="close-panel" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 18px;">&times;</button>
    </div>
    <div id="element-info" style="margin-bottom: 12px;"></div>
    <div class="actions" style="display: flex; gap: 8px; margin-top: 12px;">
      <button id="debug-element" style="
        flex: 1;
        background: #22c55e;
        color: #0f172a;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 12px;
      ">Debug</button>
      <button id="copy-selector" style="
        flex: 1;
        background: #475569;
        color: #e2e8f0;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 12px;
      ">Copy Selector</button>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // Add event listeners for panel
  document.getElementById('close-panel').addEventListener('click', () => {
    panel.style.display = 'none';
  });
  
  document.getElementById('debug-element').addEventListener('click', () => {
    if (currentElement) {
      openDebugModal(currentElement);
    }
  });
  
  document.getElementById('copy-selector').addEventListener('click', () => {
    if (currentElement) {
      const selector = generateSelector(currentElement);
      navigator.clipboard.writeText(selector);
      showNotification('Selector copied to clipboard!');
    }
  });
}

// Set up event listeners
function setupEventListeners() {
  // Mouse tracking
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('click', handleClick);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown);
  
  // Listen for messages from extension
  chrome.runtime.onMessage.addListener(handleExtensionMessage);
}

// Handle mouse movement
function handleMouseMove(e) {
  if (!isLogTraceActive) return;
  
  mousePosition = { x: e.clientX, y: e.clientY };
  
  const mouseIndicator = document.getElementById('mouse-indicator');
  if (mouseIndicator) {
    mouseIndicator.style.left = e.clientX + 'px';
    mouseIndicator.style.top = e.clientY + 'px';
    mouseIndicator.style.display = 'block';
  }
}

// Handle mouse over
function handleMouseOver(e) {
  if (!isLogTraceActive || isHoverPaused) return;
  
  const element = e.target;
  if (element && !isLogTraceElement(element)) {
    highlightElement(element);
    currentElement = element;
    updateInfoPanel(element);
  }
}

// Handle click
function handleClick(e) {
  if (!isLogTraceActive) return;
  
  // Prevent default if clicking on non-LogTrace elements
  if (!isLogTraceElement(e.target)) {
  e.preventDefault();
  e.stopPropagation();
  
  const element = e.target;
    highlightElement(element);
    currentElement = element;
    updateInfoPanel(element);
    
    // Show info panel
    const panel = document.getElementById('log-trace-info-panel');
    if (panel) {
      panel.style.display = 'block';
    }
    
    // Log the event
    logEvent('click', element);
  }
}

// Handle keyboard shortcuts
function handleKeyDown(e) {
  // Check if user is typing in an input field
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    return; // Don't intercept shortcuts when typing
  }
  
  switch (e.key) {
    case 'd':
      if (!isLogTraceActive) return;
      if (e.ctrlKey) {
        // Ctrl+D: Quick debug
        e.preventDefault();
        if (currentElement) {
          openDebugModal(currentElement);
        }
      } else {
        // D: Pause/Resume hover
        e.preventDefault();
        toggleHoverPause();
      }
      break;
      
    case 's':
      // S: Start (activate LogTrace)
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (!isLogTraceActive) {
          activateLogTrace();
        }
      }
      break;
      
    case 'e':
      // E: End (deactivate LogTrace)
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (isLogTraceActive) {
          deactivateLogTrace();
        }
      }
      break;
      
    case 't':
      // T: Toggle terminal (placeholder - Chrome extension doesn't have terminal)
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        showNotification('Terminal toggle - Feature available in main app');
      }
      break;
      
    case 'Escape':
      if (isLogTraceActive) {
        e.preventDefault();
        deactivateLogTrace();
      }
      break;
  }
}

// Handle messages from extension
function handleExtensionMessage(request, sender, sendResponse) {
  console.log('Content script received message:', request);
  
  switch (request.action) {
    case 'activate':
      apiKey = request.apiKey;
      // Ensure overlay is created if not already
      if (!document.getElementById('log-trace-overlay')) {
        createLogTraceOverlay();
      }
      activateLogTrace();
      sendResponse({ success: true });
      break;
      
    case 'deactivate':
      deactivateLogTrace();
      sendResponse({ success: true });
      break;
      
    case 'checkStatus':
      sendResponse({ active: isLogTraceActive });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
}

// Activate LogTrace
function activateLogTrace() {
  isLogTraceActive = true;
  console.log('LogTrace activated');
  
  // Show overlay elements
  const overlay = document.getElementById('log-trace-overlay');
  if (overlay) {
    overlay.style.display = 'block';
  }
  
  // Update floating button status
  const floatingButton = document.getElementById('log-trace-toggle-button');
  if (floatingButton) {
    floatingButton.style.backgroundColor = '#06b6d4';
    floatingButton.classList.add('log-trace-active');
    const icon = floatingButton.querySelector('.button-icon');
    if (icon) {
      icon.style.color = '#0f172a';
      icon.textContent = '🔍';
      icon.style.fontSize = '24px';
      icon.style.fontWeight = 'normal';
    }
    const tooltip = document.getElementById('log-trace-tooltip');
    if (tooltip) {
      tooltip.textContent = 'LogTrace Active';
      tooltip.style.color = '#06b6d4';
      tooltip.style.borderColor = '#06b6d4';
    }
  }
  
  // Show status indicator
  showNotification('LogTrace activated! S=start, E=end, D=pause hover, Ctrl+D=debug, T=terminal info, Esc=exit');
}

// Deactivate LogTrace
function deactivateLogTrace() {
  isLogTraceActive = false;
  console.log('LogTrace deactivated');
  
  // Hide overlay elements
  const overlay = document.getElementById('log-trace-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
  
  const mouseIndicator = document.getElementById('mouse-indicator');
  if (mouseIndicator) {
    mouseIndicator.style.display = 'none';
  }
  
  const highlighter = document.getElementById('element-highlighter');
  if (highlighter) {
    highlighter.style.display = 'none';
  }
  
  const panel = document.getElementById('log-trace-info-panel');
  if (panel) {
    panel.style.display = 'none';
  }
  
  // Update floating button status
  const floatingButton = document.getElementById('log-trace-toggle-button');
  if (floatingButton) {
    floatingButton.style.backgroundColor = '#475569';
    floatingButton.classList.remove('log-trace-active');
    const icon = floatingButton.querySelector('.button-icon');
    if (icon) {
      icon.style.color = '#e2e8f0';
      icon.textContent = '🐛';
      icon.style.fontSize = '24px';
      icon.style.fontWeight = 'normal';
    }
    const tooltip = document.getElementById('log-trace-tooltip');
    if (tooltip) {
      tooltip.textContent = 'LogTrace Inactive';
      tooltip.style.color = '#e2e8f0';
      tooltip.style.borderColor = '#334155';
    }
  }
  
  // Close debug modal if open
  const modal = document.getElementById('claude-debug-modal');
  if (modal) {
    modal.remove();
  }
  
  showNotification('LogTrace deactivated');
}

// Toggle LogTrace from floating button
function toggleLogTraceFromButton() {
  if (isLogTraceActive) {
    deactivateLogTrace();
  } else {
    activateLogTrace();
  }
  
  // Add click animation
  const button = document.getElementById('log-trace-toggle-button');
  if (button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);
  }
}

// Toggle hover pause
function toggleHoverPause() {
  isHoverPaused = !isHoverPaused;
  const status = isHoverPaused ? 'paused' : 'resumed';
  showNotification(`Hover details ${status}`);
}

// Highlight element
function highlightElement(element) {
  const highlighter = document.getElementById('element-highlighter');
  if (!highlighter) return;
  
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  highlighter.style.cssText = `
    position: fixed;
    border: 2px solid #06b6d4;
    background: rgba(6, 182, 212, 0.1);
    pointer-events: none;
    z-index: 9998;
    display: block;
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
  `;
}

// Update info panel
function updateInfoPanel(element) {
  const infoDiv = document.getElementById('element-info');
  if (!infoDiv) return;
  
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  
  infoDiv.innerHTML = `
    <div style="margin-bottom: 8px;">
      <strong style="color: #06b6d4;">Tag:</strong> ${element.tagName.toLowerCase()}
    </div>
    ${element.id ? `<div style="margin-bottom: 8px;"><strong style="color: #06b6d4;">ID:</strong> #${element.id}</div>` : ''}
    ${element.className ? `<div style="margin-bottom: 8px;"><strong style="color: #06b6d4;">Classes:</strong> .${element.className.split(' ').join('.')}</div>` : ''}
    <div style="margin-bottom: 8px;">
      <strong style="color: #06b6d4;">Size:</strong> ${Math.round(rect.width)}×${Math.round(rect.height)}
    </div>
    <div style="margin-bottom: 8px;">
      <strong style="color: #06b6d4;">Position:</strong> (${Math.round(rect.left)}, ${Math.round(rect.top)})
    </div>
    ${element.textContent ? `<div style="margin-bottom: 8px;"><strong style="color: #06b6d4;">Text:</strong> ${element.textContent.substring(0, 50)}${element.textContent.length > 50 ? '...' : ''}</div>` : ''}
  `;
}

// Open debug modal with enhanced Debug Assistant
function openDebugModal(element) {
  // Remove existing modal
  const existingModal = document.getElementById('claude-debug-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal with enhanced Debug Assistant
  const modal = document.createElement('div');
  modal.id = 'claude-debug-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>🤖 Debug Assistant</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="element-context">
          <h4>Element Context</h4>
          <div class="context-info">
            <div><strong>Tag:</strong> ${element.tagName.toLowerCase()}</div>
            ${element.id ? `<div><strong>ID:</strong> #${element.id}</div>` : ''}
            ${element.className ? `<div><strong>Classes:</strong> .${element.className.split(' ').join('.')}</div>` : ''}
            <div><strong>Position:</strong> x:${Math.round(mousePosition.x)}, y:${Math.round(mousePosition.y)}</div>
            ${element.textContent ? `<div><strong>Text:</strong> "${element.textContent.substring(0, 100)}${element.textContent.length > 100 ? '...' : ''}"</div>` : ''}
          </div>
        </div>
        
        <div class="debug-separator"></div>
        
        <div class="quick-debug-section">
          <h4>Quick Debug</h4>
          <div class="quick-debug-controls">
            <input type="text" id="quick-debug-input" placeholder="Why did this happen?" value="Why did this happen?" maxlength="500">
            <button id="quick-debug-btn" class="debug-btn primary">Debug</button>
          </div>
        </div>
        
        <div class="debug-separator"></div>
        
        <div class="advanced-debug-section">
          <h4>Advanced Debug</h4>
          <textarea id="advanced-debug-input" placeholder="Detailed debugging prompt..." maxlength="2000"></textarea>
          <button id="advanced-debug-btn" class="debug-btn secondary">Advanced Debug</button>
        </div>
        
        <div id="analysis-result"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Set up advanced prompt
  const advancedTextarea = modal.querySelector('#advanced-debug-input');
  advancedTextarea.value = generateAdvancedPrompt(element);
  
  // Add event listeners
  modal.querySelector('.close-btn').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.querySelector('#quick-debug-btn').addEventListener('click', () => {
    const prompt = modal.querySelector('#quick-debug-input').value;
    if (prompt.trim()) {
      analyzeElementWithAI(element, prompt);
    }
  });
  
  modal.querySelector('#advanced-debug-btn').addEventListener('click', () => {
    const prompt = modal.querySelector('#advanced-debug-input').value;
    if (prompt.trim()) {
      analyzeElementWithAI(element, prompt);
    }
  });
  
  // Focus on quick debug input
  modal.querySelector('#quick-debug-input').focus();
  
  // Add keyboard shortcuts
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.remove();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      const activeElement = document.activeElement;
      if (activeElement.id === 'quick-debug-input') {
        modal.querySelector('#quick-debug-btn').click();
      } else if (activeElement.id === 'advanced-debug-input') {
        modal.querySelector('#advanced-debug-btn').click();
      }
    }
  });
}

// Generate advanced debugging prompt
function generateAdvancedPrompt(element) {
  const styles = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase()) || 
                       element.onclick !== null || 
                       styles.cursor === 'pointer';

  return `Debug this element in detail:

Element: <${element.tagName.toLowerCase()}${element.id ? ` id="${element.id}"` : ''}${element.className ? ` class="${element.className}"` : ''}>
Text: "${element.textContent ? element.textContent.substring(0, 200) : 'None'}"
Position: x:${Math.round(mousePosition.x)}, y:${Math.round(mousePosition.y)}
Size: ${Math.round(rect.width)}×${Math.round(rect.height)}
Interactive: ${isInteractive ? 'Yes' : 'No'}
Cursor: ${styles.cursor}
Display: ${styles.display}
Visibility: ${styles.visibility}
Pointer Events: ${styles.pointerEvents}
Z-Index: ${styles.zIndex}

Consider:
1. Why might this element not be behaving as expected?
2. Are there any CSS properties preventing interaction?
3. Are there any event listeners that might be interfering?
4. What accessibility concerns might exist?
5. How could the user experience be improved?

Provide specific, actionable debugging steps and potential solutions.`;
}

// Enhanced AI analysis function
async function analyzeElementWithAI(element, prompt) {
  const quickBtn = document.getElementById('quick-debug-btn');
  const advancedBtn = document.getElementById('advanced-debug-btn');
  const resultDiv = document.getElementById('analysis-result');
  
  // Show loading state
  const isQuickDebug = document.activeElement?.id === 'quick-debug-input' || 
                      document.querySelector('#quick-debug-input')?.value === prompt;
  
  const activeBtn = isQuickDebug ? quickBtn : advancedBtn;
  const originalText = activeBtn.textContent;
  
  activeBtn.disabled = true;
  activeBtn.textContent = 'Analyzing...';
  activeBtn.classList.add('loading');
  
  // Show loading in results
  resultDiv.innerHTML = `
    <div class="analysis-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">🤖 Analyzing element...</div>
    </div>
  `;
  resultDiv.style.display = 'block';
  
  try {
    // Gather comprehensive element context
    const context = gatherElementContext(element);
    
    // Send to background script with enhanced context
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'analyzeElement',
        query: prompt,
        context: context,
        debugMode: true // Flag for enhanced debugging
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
    
    // Display enhanced results
    displayEnhancedAnalysisResult(response, prompt);
    
    // Log the debug event
    logEvent('ai_debug', element, { prompt, response: response.summary });
    
  } catch (error) {
    console.error('Analysis failed:', error);
    resultDiv.innerHTML = `
      <div class="analysis-error">
        <h4>❌ Analysis Failed</h4>
        <p>${error.message}</p>
        <div class="error-actions">
          <button onclick="this.parentElement.parentElement.parentElement.style.display='none'">Dismiss</button>
        </div>
      </div>
    `;
  } finally {
    // Restore button state
    activeBtn.disabled = false;
    activeBtn.textContent = originalText;
    activeBtn.classList.remove('loading');
  }
}

// Enhanced element context gathering for Debug Assistant
function gatherElementContext(element) {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  
  return {
    tag: element.tagName.toLowerCase(),
    id: element.id || null,
    classes: element.className ? element.className.split(' ').filter(c => c) : [],
    text: element.textContent ? element.textContent.substring(0, 200) : null,
    html: element.outerHTML.substring(0, 500),
    position: {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    },
    styles: {
      display: styles.display,
      position: styles.position,
      visibility: styles.visibility,
      opacity: styles.opacity,
      zIndex: styles.zIndex,
      overflow: styles.overflow,
      cursor: styles.cursor,
      pointerEvents: styles.pointerEvents,
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      fontSize: styles.fontSize,
      fontFamily: styles.fontFamily,
      border: styles.border,
      margin: styles.margin,
      padding: styles.padding,
      width: styles.width,
      height: styles.height,
      maxWidth: styles.maxWidth,
      maxHeight: styles.maxHeight,
      minWidth: styles.minWidth,
      minHeight: styles.minHeight,
      boxSizing: styles.boxSizing,
      float: styles.float,
      clear: styles.clear,
      textAlign: styles.textAlign,
      verticalAlign: styles.verticalAlign,
      lineHeight: styles.lineHeight,
      whiteSpace: styles.whiteSpace,
      wordWrap: styles.wordWrap,
      textOverflow: styles.textOverflow,
      transform: styles.transform,
      transition: styles.transition,
      animation: styles.animation,
      borderRadius: styles.borderRadius,
      boxShadow: styles.boxShadow,
      outline: styles.outline,
      userSelect: styles.userSelect,
      resize: styles.resize,
      filter: styles.filter,
      backdropFilter: styles.backdropFilter,
      // Layout properties
      flexDirection: styles.flexDirection,
      flexWrap: styles.flexWrap,
      justifyContent: styles.justifyContent,
      alignItems: styles.alignItems,
      gridTemplateColumns: styles.gridTemplateColumns,
      gridTemplateRows: styles.gridTemplateRows,
      gridArea: styles.gridArea
    },
    parent: element.parentElement ? {
      tag: element.parentElement.tagName.toLowerCase(),
      id: element.parentElement.id || null,
      classes: element.parentElement.className ? element.parentElement.className.split(' ').filter(c => c) : [],
      display: window.getComputedStyle(element.parentElement).display,
      position: window.getComputedStyle(element.parentElement).position
    } : null,
    attributes: Array.from(element.attributes).reduce((acc, attr) => {
      acc[attr.name] = attr.value;
      return acc;
    }, {}),
    eventListeners: getEventListenerInfo(element),
    accessibility: {
      hasAriaLabel: element.hasAttribute('aria-label'),
      hasAriaDescribedBy: element.hasAttribute('aria-describedby'),
      hasRole: element.hasAttribute('role'),
      tabIndex: element.tabIndex,
      isHidden: element.hidden || styles.display === 'none' || styles.visibility === 'hidden'
    },
    performance: {
      hasTransforms: styles.transform !== 'none',
      hasAnimations: styles.animation !== 'none',
      hasFilters: styles.filter !== 'none',
      hasBlur: styles.backdropFilter !== 'none'
    },
    url: window.location.href,
    pageTitle: document.title,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    }
  };
}

// Helper function to get event listener information
function getEventListenerInfo(element) {
  const listeners = {};
  
  // Check for common event properties
  const commonEvents = ['onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 
                       'onkeydown', 'onkeyup', 'onkeypress', 'onfocus', 'onblur', 'onchange', 
                       'onsubmit', 'onload', 'onerror', 'onresize', 'onscroll'];
  
  commonEvents.forEach(event => {
    if (element[event]) {
      listeners[event] = 'attached';
    }
  });
  
  // Check for data attributes that might indicate event handling
  Array.from(element.attributes).forEach(attr => {
    if (attr.name.startsWith('data-') && (attr.name.includes('click') || attr.name.includes('event'))) {
      listeners[attr.name] = attr.value;
    }
  });
  
  return listeners;
}

// Display analysis result
function displayAnalysisResult(data) {
  const resultDiv = document.getElementById('analysis-result');
  
  resultDiv.innerHTML = `
    <h4>🤖 AI Analysis Results</h4>
    <div class="analysis-sections">
      ${data.summary ? `
        <div class="section">
          <h5>📋 Summary</h5>
          <p>${data.summary}</p>
        </div>
      ` : ''}
      
      <div class="section">
        <h5>🔍 Analysis</h5>
        <p>${data.analysis}</p>
      </div>
      
      ${data.issues && data.issues.length > 0 ? `
        <div class="section">
          <h5>⚠️ Issues Found</h5>
          <ul>
            ${data.issues.map(issue => `<li>${issue}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${data.recommendations && data.recommendations.length > 0 ? `
        <div class="section">
          <h5>💡 Recommendations</h5>
          <ul>
            ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${data.codeSnippets && (data.codeSnippets.css || data.codeSnippets.javascript || data.codeSnippets.html) ? `
        <div class="section">
          <h5>💻 Code Snippets</h5>
          ${data.codeSnippets.css ? `<pre><code>${data.codeSnippets.css}</code></pre>` : ''}
          ${data.codeSnippets.javascript ? `<pre><code>${data.codeSnippets.javascript}</code></pre>` : ''}
          ${data.codeSnippets.html ? `<pre><code>${data.codeSnippets.html}</code></pre>` : ''}
        </div>
      ` : ''}
      
      ${data.debugging_steps && data.debugging_steps.length > 0 ? `
        <div class="section">
          <h5>🔧 Debugging Steps</h5>
          <ol>
            ${data.debugging_steps.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
      ` : ''}
    </div>
  `;
}

// Enhanced result display
function displayEnhancedAnalysisResult(data, originalPrompt) {
  const resultDiv = document.getElementById('analysis-result');
  
  resultDiv.innerHTML = `
    <div class="analysis-header">
      <h4>🤖 Debug Analysis Results</h4>
      <div class="analysis-meta">
        <span class="prompt-preview">Query: "${originalPrompt.substring(0, 50)}${originalPrompt.length > 50 ? '...' : ''}"</span>
      </div>
    </div>
    
    <div class="analysis-content">
      ${data.summary ? `
        <div class="analysis-section summary">
          <h5>📋 Summary</h5>
          <p>${data.summary}</p>
        </div>
      ` : ''}
      
      <div class="analysis-section analysis">
        <h5>🔍 Analysis</h5>
        <div class="analysis-text">${data.analysis}</div>
      </div>
      
      ${data.issues && data.issues.length > 0 ? `
        <div class="analysis-section issues">
          <h5>⚠️ Issues Found</h5>
          <ul class="issue-list">
            ${data.issues.map(issue => `<li>${issue}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${data.recommendations && data.recommendations.length > 0 ? `
        <div class="analysis-section recommendations">
          <h5>💡 Recommendations</h5>
          <ul class="recommendation-list">
            ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${data.codeSnippets && (data.codeSnippets.css || data.codeSnippets.javascript || data.codeSnippets.html) ? `
        <div class="analysis-section code-snippets">
          <h5>💻 Code Solutions</h5>
          ${data.codeSnippets.css ? `
            <div class="code-block">
              <div class="code-header">CSS</div>
              <pre><code>${data.codeSnippets.css}</code></pre>
            </div>
          ` : ''}
          ${data.codeSnippets.javascript ? `
            <div class="code-block">
              <div class="code-header">JavaScript</div>
              <pre><code>${data.codeSnippets.javascript}</code></pre>
            </div>
          ` : ''}
          ${data.codeSnippets.html ? `
            <div class="code-block">
              <div class="code-header">HTML</div>
              <pre><code>${data.codeSnippets.html}</code></pre>
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      ${data.debugging_steps && data.debugging_steps.length > 0 ? `
        <div class="analysis-section debugging-steps">
          <h5>🔧 Debugging Steps</h5>
          <ol class="steps-list">
            ${data.debugging_steps.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
      ` : ''}
    </div>
    
    <div class="analysis-actions">
      <button onclick="this.parentElement.parentElement.style.display='none'" class="action-btn dismiss">Dismiss</button>
      <button onclick="navigator.clipboard.writeText(this.parentElement.parentElement.innerText)" class="action-btn copy">Copy Results</button>
    </div>
  `;
}

// Utility functions
function isLogTraceElement(element) {
  if (!element) return false;
  
  const logTraceIds = [
    'log-trace-overlay',
    'mouse-indicator', 
    'element-highlighter',
    'log-trace-info-panel',
    'claude-debug-modal',
    'log-trace-toggle-button',
    'log-trace-tooltip'
  ];
  
  return logTraceIds.includes(element.id) || 
         element.closest('#log-trace-overlay') ||
         element.closest('#log-trace-info-panel') ||
         element.closest('#claude-debug-modal') ||
         element.closest('#log-trace-toggle-button') ||
         element.closest('#log-trace-tooltip');
}

function generateSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.className) {
    return `.${element.className.split(' ').join('.')}`;
  }
  
  return element.tagName.toLowerCase();
}

function logEvent(type, element, details = {}) {
  const event = {
    type,
    timestamp: Date.now(),
    element: {
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      classes: element.className || null,
      text: element.textContent ? element.textContent.substring(0, 50) : null
    },
    position: mousePosition,
    ...details
  };
  
  debugEvents.push(event);
  console.log('LogTrace Event:', event);
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.95);
    color: #22c55e;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10002;
    border: 1px solid #22c55e;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideDown 0.3s ease-out;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function getExtensionSettings() {
  chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
    if (response && response.success) {
      apiKey = response.settings.apiKey;
      if (response.settings.isActive) {
        activateLogTrace();
      }
    }
  });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translate(-50%, -100%); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translate(-50%, 0); opacity: 1; }
    to { transform: translate(-50%, -100%); opacity: 0; }
  }
  
  @keyframes logTracePulse {
    0% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(34, 197, 94, 0.7); }
    50% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(34, 197, 94, 0.2); }
    100% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(34, 197, 94, 0); }
  }
  
  .log-trace-active {
    animation: logTracePulse 2s infinite;
  }
  
  .log-trace-button-hover {
    transform: scale(1.1) !important;
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}
