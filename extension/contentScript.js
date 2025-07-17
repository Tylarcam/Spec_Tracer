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
// Stores structured AI debug conversations (for the terminal)
let debugResponses = [];

// Terminal UI state
let isTerminalVisible = false;
let terminalActiveTab = 'events';

// --- LogTrace Activation State and Overlay Management ---
let overlayListenersRegistered = false;

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
    width: 320px;
    max-height: 500px;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(6, 182, 212, 0.5);
    border-radius: 8px;
    padding: 16px;
    color: #e2e8f0;
    font-size: 14px;
    z-index: 10001;
    display: none;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(6, 182, 212, 0.05);
    transition: all 0.2s ease;
  `;
  
  panel.innerHTML = `
    <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; cursor: move;">
      <h3 style="margin: 0; color: #06b6d4; font-size: 16px; display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        Element Inspector
      </h3>
      <div style="display: flex; gap: 8px;">
        <button id="pin-panel" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 16px; display: flex; align-items: center; padding: 4px;" title="Pin panel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </button>
        <button id="close-panel" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 16px; display: flex; align-items: center; padding: 4px;" title="Close panel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Basic Info Accordion Section -->
    <div class="accordion-section">
      <div class="accordion-header" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; cursor: pointer; border-bottom: 1px solid rgba(34, 197, 94, 0.2);">
        <h4 style="margin: 0; color: #06b6d4; font-size: 14px; display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Basic Info
        </h4>
        <span class="accordion-icon" style="color: #64748b; transition: transform 0.2s;">▼</span>
      </div>
      <div class="accordion-content" style="padding: 8px 0; display: block;">
        <div id="element-info" style="margin-bottom: 12px;"></div>
      </div>
    </div>
    
    <!-- Computed Styles Accordion Section -->
    <div class="accordion-section">
      <div class="accordion-header" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; cursor: pointer; border-bottom: 1px solid rgba(168, 85, 247, 0.2);">
        <h4 style="margin: 0; color: #a855f7; font-size: 14px; display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Computed Styles
        </h4>
        <span class="accordion-icon" style="color: #64748b; transition: transform 0.2s;">▲</span>
      </div>
      <div class="accordion-content" style="padding: 8px 0; display: none;">
        <div id="computed-styles" style="margin-bottom: 12px; font-size: 12px;"></div>
      </div>
    </div>
    
    <!-- Attributes Accordion Section -->
    <div class="accordion-section">
      <div class="accordion-header" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; cursor: pointer; border-bottom: 1px solid rgba(249, 115, 22, 0.2);">
        <h4 style="margin: 0; color: #f97316; font-size: 14px; display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" x2="20" y1="9" y2="9"></line>
            <line x1="4" x2="20" y1="15" y2="15"></line>
            <line x1="10" x2="8" y1="3" y2="21"></line>
            <line x1="16" x2="14" y1="3" y2="21"></line>
          </svg>
          Attributes
        </h4>
        <span class="accordion-icon" style="color: #64748b; transition: transform 0.2s;">▲</span>
      </div>
      <div class="accordion-content" style="padding: 8px 0; display: none;">
        <div id="element-attributes" style="margin-bottom: 12px; font-size: 12px;"></div>
      </div>
    </div>
    
    <div class="actions" style="display: flex; gap: 8px; margin-top: 16px;">
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
      ">Debug with AI</button>
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
  
  // Make panel draggable
  let isPanelPinned = false;
  let isDragging = false;
  let offsetX, offsetY;
  
  const panelHeader = panel.querySelector('.panel-header');
  
  panelHeader.addEventListener('mousedown', (e) => {
    if (isPanelPinned) return;
    
    isDragging = true;
    offsetX = e.clientX - panel.getBoundingClientRect().left;
    offsetY = e.clientY - panel.getBoundingClientRect().top;
    
    panel.style.cursor = 'grabbing';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
    panel.style.right = 'auto';
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    panel.style.cursor = 'default';
  });
  
  // Pin/unpin functionality
  const pinButton = document.getElementById('pin-panel');
  pinButton.addEventListener('click', () => {
    isPanelPinned = !isPanelPinned;
    pinButton.style.color = isPanelPinned ? '#22c55e' : '#64748b';
    pinButton.title = isPanelPinned ? 'Unpin panel' : 'Pin panel';
    
    // Update icon based on pinned state
    const lockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>`;
    
    const unlockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 0 0 0v4"></path>
    </svg>`;
    
    pinButton.innerHTML = isPanelPinned ? lockIcon : unlockIcon;
  });
  
  // Accordion functionality
  const accordionSections = panel.querySelectorAll('.accordion-section');
  accordionSections.forEach(section => {
    const header = section.querySelector('.accordion-header');
    const content = section.querySelector('.accordion-content');
    const icon = section.querySelector('.accordion-icon');
    
    header.addEventListener('click', () => {
      const isOpen = content.style.display === 'block';
      content.style.display = isOpen ? 'none' : 'block';
      icon.textContent = isOpen ? '▲' : '▼';
      icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  });
  
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
    showHoverOverlay(element, e.clientX, e.clientY);
  }
}

// Remove hover overlay on mouse out
function handleMouseOut(e) {
  const overlay = document.getElementById('log-trace-hover-overlay');
  if (!overlay) return;
  // Only remove if the new target is not the overlay or its children
  if (e && e.relatedTarget && overlay.contains(e.relatedTarget)) return;
  overlay.remove();
}

document.addEventListener('mouseout', handleMouseOut, true);

function showHoverOverlay(element, mouseX, mouseY) {
  // Remove existing hover overlay
  const existingOverlay = document.getElementById('log-trace-hover-overlay');
  if (existingOverlay) existingOverlay.remove();

  // Extract colors from element
  const colors = extractColorsFromElement(element);
  // Get event listeners count
  const eventListeners = getEventListenerInfo(element);
  const eventCount = eventListeners.length;

  // Create hover overlay
  const overlay = document.createElement('div');
  overlay.id = 'log-trace-hover-overlay';
  overlay.style.cssText = `
    position: fixed;
    z-index: 10002;
    pointer-events: auto;
    cursor: pointer;
    transform: translate(-50%, -100%);
  `;

  // Position the overlay
  const padding = 8;
  let left = mouseX;
  let top = mouseY - 10;

  // Card content
  const parentPath = element.parentElement ? element.parentElement.tagName.toLowerCase() + (element.parentElement.className ? '.' + String(element.parentElement.className).split(' ').join('.') : '') : '';
  const cardHTML = `
    <div style="
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(6, 182, 212, 0.5);
      border-radius: 8px;
      padding: 12px;
      backdrop-filter: blur(16px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      min-width: 200px;
      max-width: 320px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      color: #e2e8f0;
      position: relative;
    ">
      <div style="
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        border-radius: 50%;
        box-shadow: 0 0 32px 12px rgba(34,211,238,0.35), 0 0 0 4px rgba(34,211,238,0.15);
        background: radial-gradient(circle, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0.08) 80%, transparent 100%);
        pointer-events: none;
        z-index: -1;
      "></div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
        <span style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">${element.tagName.toLowerCase()}</span>
        ${element.id ? `<span style=\"border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; padding: 2px 6px; border-radius: 4px; font-size: 11px;\">#${element.id}</span>` : ''}
        <span style="border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${eventCount > 0 ? eventCount + ' events' : 'No events'}</span>
        <span style="border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Errors: None</span>
      </div>
      ${colors.length > 0 ? `<div style=\"display: flex; gap: 4px; margin-bottom: 8px;\">${colors.map(color => `<div style=\\"width: 16px; height: 16px; border-radius: 2px; border: 1px solid #475569; background-color: ${color.value};\\" title=\\"${color.property}: ${color.value}\\"></div>`).join('')}</div>` : ''}
      ${element.className ? `<div style=\"color: #22c55e; margin-bottom: 4px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px;\">.${element.className.split(' ').join('.').slice(0, 60)}${element.className.length > 60 ? '…' : ''}</div>` : ''}
      ${element.textContent ? `<div style=\"color: #d1d5db; margin-bottom: 4px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px;\">\"${element.textContent.trim().replace(/\s+/g, ' ').slice(0, 60)}${element.textContent.length > 60 ? '…' : ''}\"</div>` : ''}
      ${parentPath ? `<div style=\"color: #a3e635; font-size: 10px; margin-bottom: 4px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\">Parent: ${parentPath.slice(0, 60)}${parentPath.length > 60 ? '…' : ''}</div>` : ''}
      <div style="color: #a855f7; font-size: 11px; margin-bottom: 4px;">Press D to pause details</div>
      <div style="color: #06b6d4; font-size: 11px;">Click for details</div>
    </div>
  `;
  overlay.innerHTML = cardHTML;
  document.body.appendChild(overlay);

  // Position overlay in viewport
  const overlayRect = overlay.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  if (left + overlayRect.width / 2 > viewportWidth - padding) {
    left = viewportWidth - overlayRect.width / 2 - padding;
  }
  if (left - overlayRect.width / 2 < padding) {
    left = overlayRect.width / 2 + padding;
  }
  if (top - overlayRect.height < padding) {
    top = mouseY + 20;
    overlay.style.transform = 'translate(-50%, 0)';
  }
  if (top + overlayRect.height > viewportHeight - padding) {
    top = viewportHeight - overlayRect.height - padding;
  }
  overlay.style.left = `${left}px`;
  overlay.style.top = `${top}px`;

  // On click, show detailed info panel and remove overlay
  overlay.addEventListener('click', () => {
    updateInfoPanel(element);
    const panel = document.getElementById('log-trace-info-panel');
    if (panel) {
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const panelWidth = 300;
      let left = rect.right + 10;
      if (left + panelWidth > viewportWidth - 20) {
        left = Math.max(20, rect.left - panelWidth - 10);
      }
      let top = rect.top;
      if (top + 300 > viewportHeight - 20) {
        top = Math.max(20, viewportHeight - 320);
      }
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      panel.style.right = 'auto';
      panel.style.display = 'block';
    }
    overlay.remove();
  });
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
    
    // Show info panel near the clicked element
    const panel = document.getElementById('log-trace-info-panel');
    if (panel) {
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const panelWidth = 300; // Default panel width
      
      // Position panel to the right of the element if there's enough space,
      // otherwise position to the left
      let left = rect.right + 10;
      if (left + panelWidth > viewportWidth - 20) {
        left = Math.max(20, rect.left - panelWidth - 10);
      }
      
      // Ensure panel is fully visible vertically
      let top = rect.top;
      if (top + 300 > viewportHeight - 20) { // Assuming a reasonable max height
        top = Math.max(20, viewportHeight - 320);
      }
      
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      panel.style.right = 'auto';
      panel.style.display = 'block';
    }
    
    // Log the event
    logEvent('click', element);
  }
}

// Handle keyboard shortcuts
function handleKeyDown(e) {
  // Ignore shortcuts while the user is typing or inside the terminal
  const activeElement = document.activeElement;
  if (
    activeElement &&
    (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable ||
      activeElement.closest('#log-trace-terminal')
    )
  ) {
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
      // T: Toggle LogTrace Terminal
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        toggleTerminal();
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
  registerOverlayListeners();
  // Show overlays if needed
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
  unregisterOverlayListeners();
  // Hide overlays and highlights
  removeOverlayUI();
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
  const computedStylesDiv = document.getElementById('computed-styles');
  const attributesDiv = document.getElementById('element-attributes');
  
  if (!infoDiv || !computedStylesDiv || !attributesDiv) return;
  
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  
  // Basic Info Section
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
  
  // Computed Styles Section
  const importantStyles = [
    'display', 'position', 'width', 'height', 'margin', 'padding',
    'color', 'background-color', 'font-size', 'font-family',
    'z-index', 'opacity', 'visibility', 'overflow'
  ];
  
  let stylesHTML = '';
  importantStyles.forEach(prop => {
    const value = styles.getPropertyValue(prop);
    if (value) {
      stylesHTML += `
        <div style="margin-bottom: 4px; display: flex;">
          <strong style="color: #06b6d4; min-width: 100px;">${prop}:</strong> 
          <span style="color: #e2e8f0; word-break: break-all;">${value}</span>
        </div>
      `;
    }
  });
  
  computedStylesDiv.innerHTML = stylesHTML || '<em style="color: #64748b;">No computed styles available</em>';
  
  // Attributes Section
  let attributesHTML = '';
  for (const attr of element.attributes) {
    if (attr.name !== 'style') { // Skip style attribute as it's usually too long
      attributesHTML += `
        <div style="margin-bottom: 4px; display: flex;">
          <strong style="color: #06b6d4; min-width: 100px;">${attr.name}:</strong> 
          <span style="color: #e2e8f0; word-break: break-all;">${attr.value.substring(0, 100)}${attr.value.length > 100 ? '...' : ''}</span>
        </div>
      `;
    }
  }
  
  attributesDiv.innerHTML = attributesHTML || '<em style="color: #64748b;">No attributes available</em>';
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
  // Check if user is authenticated before proceeding
  if (!checkUserAuthentication()) {
    showSignInModal();
    return;
  }

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
    
    // Log & store the debug conversation
    logEvent('ai_debug', element, { prompt, response: response.summary });
    debugResponses.push({
      id: Date.now().toString(),
      prompt,
      response: response.summary || response.analysis || 'Analysis completed',
      timestamp: Date.now()
    });
    if (isTerminalVisible) renderTerminal(); // live-refresh
    
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
    'log-trace-tooltip',
    'log-trace-terminal',
    'log-trace-signin-modal'
  ];
  
  return logTraceIds.includes(element.id) || 
         element.closest('#log-trace-overlay') ||
         element.closest('#log-trace-info-panel') ||
         element.closest('#claude-debug-modal') ||
         element.closest('#log-trace-toggle-button') ||
         element.closest('#log-trace-tooltip') ||
         element.closest('#log-trace-terminal') ||
         element.closest('#log-trace-signin-modal');
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

  // Auto-refresh terminal if it's open
  if (isTerminalVisible) renderTerminal();
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

/* ------------------------------------------------------------------ *
 *      Sign-In Modal for Account Management                          *
 * ------------------------------------------------------------------ */

function createSignInModal() {
  const modal = document.createElement('div');
  modal.id = 'log-trace-signin-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10010;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  modal.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border: 2px solid #22c55e;
      border-radius: 16px;
      padding: 32px;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
      position: relative;
    ">
      <button id="signin-close-btn" style="
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        color: #64748b;
        font-size: 24px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
      ">&times;</button>
      
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="
          width: 64px;
          height: 64px;
          background: linear-gradient(45deg, #22c55e, #06b6d4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 28px;
        ">🔍</div>
        <h2 style="
          color: #22c55e;
          margin: 0 0 8px;
          font-size: 24px;
          font-weight: 600;
        ">LogTrace AI Debugging</h2>
        <p style="
          color: #94a3b8;
          margin: 0;
          font-size: 16px;
        ">Sign up to unlock AI-powered element debugging</p>
      </div>

      <div style="margin-bottom: 24px;">
        <div style="
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        ">
          <h3 style="
            color: #22c55e;
            margin: 0 0 8px;
            font-size: 16px;
            font-weight: 600;
          ">✨ What you'll get:</h3>
          <ul style="
            color: #e2e8f0;
            margin: 0;
            padding-left: 20px;
            font-size: 14px;
            line-height: 1.6;
          ">
            <li>AI-powered element analysis</li>
            <li>CSS debugging suggestions</li>
            <li>JavaScript error detection</li>
            <li>Accessibility recommendations</li>
            <li>Performance optimization tips</li>
          </ul>
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <button id="signin-signup-btn" style="
          flex: 1;
          background: linear-gradient(45deg, #22c55e, #16a34a);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">Sign Up Free</button>
        <button id="signin-login-btn" style="
          flex: 1;
          background: transparent;
          color: #06b6d4;
          border: 2px solid #06b6d4;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">Log In</button>
      </div>

      <div style="text-align: center;">
        <p style="
          color: #64748b;
          margin: 0;
          font-size: 12px;
        ">Free account • No credit card required • Start debugging instantly</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  modal.querySelector('#signin-close-btn').addEventListener('click', () => {
    modal.remove();
  });

  modal.querySelector('#signin-signup-btn').addEventListener('click', () => {
    // Open main app sign-up page
    const returnUrl = encodeURIComponent(`${window.location.origin}?auth=extension`);
    const authUrl = `http://localhost:8081/auth?mode=signup&return=${returnUrl}`;
    window.open(authUrl, '_blank');
    modal.remove();
  });

  modal.querySelector('#signin-login-btn').addEventListener('click', () => {
    // Open main app login page
    const returnUrl = encodeURIComponent(`${window.location.origin}?auth=extension`);
    const authUrl = `http://localhost:8081/auth?mode=signin&return=${returnUrl}`;
    window.open(authUrl, '_blank');
    modal.remove();
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Add hover effects
  const signupBtn = modal.querySelector('#signin-signup-btn');
  const loginBtn = modal.querySelector('#signin-login-btn');
  const closeBtn = modal.querySelector('#signin-close-btn');

  signupBtn.addEventListener('mouseenter', () => {
    signupBtn.style.transform = 'translateY(-2px)';
    signupBtn.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
  });
  signupBtn.addEventListener('mouseleave', () => {
    signupBtn.style.transform = 'translateY(0)';
    signupBtn.style.boxShadow = 'none';
  });

  loginBtn.addEventListener('mouseenter', () => {
    loginBtn.style.background = 'rgba(6, 182, 212, 0.1)';
    loginBtn.style.transform = 'translateY(-2px)';
  });
  loginBtn.addEventListener('mouseleave', () => {
    loginBtn.style.background = 'transparent';
    loginBtn.style.transform = 'translateY(0)';
  });

  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'rgba(239, 68, 68, 0.1)';
    closeBtn.style.color = '#ef4444';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'none';
    closeBtn.style.color = '#64748b';
  });
}

function showSignInModal() {
  // Remove existing modal if present
  const existing = document.getElementById('log-trace-signin-modal');
  if (existing) {
    existing.remove();
  }
  
  createSignInModal();
}

function checkUserAuthentication() {
  try {
    // Check if user has API key
  const hasApiKey = apiKey && apiKey.trim() !== '';
    
    // Check for stored auth using new format
    const storedAuth = localStorage.getItem('logtrace_extension_auth');
    let hasValidAuth = false;
    
    if (storedAuth) {
      try {
        const { user, session, timestamp } = JSON.parse(storedAuth);
        // Check if auth is not older than 24 hours and has valid data
        if (user && session && timestamp && (Date.now() - timestamp < 24 * 60 * 60 * 1000)) {
          hasValidAuth = true;
        } else {
          // Clear expired or invalid auth
          localStorage.removeItem('logtrace_extension_auth');
        }
      } catch (parseError) {
        console.warn('Failed to parse auth data:', parseError);
        localStorage.removeItem('logtrace_extension_auth');
      }
    }
    
    return hasApiKey || hasValidAuth;
  } catch (error) {
    // Handle extension context invalidation and other errors
    console.warn('Authentication check failed (extension context may be invalidated):', error);
    return false;
  }
}

/* ------------------------------------------------------------------ *
 *      LogTrace Terminal (events + AI debug)                         *
 * ------------------------------------------------------------------ */

function toggleTerminal() {
  const existing = document.getElementById('log-trace-terminal');
  if (existing) {
    isTerminalVisible = existing.style.display === 'none';
    existing.style.display = isTerminalVisible ? 'block' : 'none';
    if (isTerminalVisible) renderTerminal();
    return;
  }
  createTerminalModal();
  isTerminalVisible = true;
  renderTerminal();
}

function createTerminalModal() {
  const term = document.createElement('div');
  term.id = 'log-trace-terminal';
  term.style.cssText = `
    position: fixed;
    left: 0; right: 0; bottom: 0;
    max-height: 50vh;
    background: rgba(15,23,42,0.95);
    color: #e2e8f0;
    font-family: ui-monospace, SFMono-Regular, monospace;
    border-top: 2px solid #22c55e;
    z-index: 10005;
    display: none;
  `;

  term.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:#0f172a;">
      <span style="color:#22c55e;font-weight:600;">LogTrace Terminal</span>
      <button id="terminal-close-btn" style="background:none;border:none;color:#e2e8f0;font-size:20px;cursor:pointer;">&times;</button>
    </div>
    <div style="display:flex;border-bottom:1px solid #334155;">
      <div id="terminal-tab-events" class="terminal-tab terminal-tab-active" style="padding:6px 12px;cursor:pointer;">Events</div>
      <div id="terminal-tab-debug"  class="terminal-tab"              style="padding:6px 12px;cursor:pointer;">AI&nbsp;Debug</div>
    </div>
    <div id="terminal-content" style="padding:8px 12px;font-size:12px;overflow-y:auto;max-height:40vh;"></div>
  `;

  document.body.appendChild(term);

  term.querySelector('#terminal-close-btn').addEventListener('click', () => toggleTerminal());
  term.querySelector('#terminal-tab-events').addEventListener('click', () => { terminalActiveTab = 'events'; switchTab(); });
  term.querySelector('#terminal-tab-debug').addEventListener('click', () => { terminalActiveTab = 'debug';  switchTab(); });

  function switchTab() {
    term.querySelectorAll('.terminal-tab').forEach(t => t.classList.remove('terminal-tab-active'));
    term.querySelector('#terminal-tab-' + terminalActiveTab).classList.add('terminal-tab-active');
    renderTerminal();
  }
}

function renderTerminal() {
  const container = document.getElementById('terminal-content');
  if (!container) return;

  if (terminalActiveTab === 'events') {
    const clicks = debugEvents.filter(e => e.type === 'click');
    container.innerHTML = clicks.length === 0
      ? '<em>No click events yet…</em>'
      : clicks.map(ev => {
          const t = new Date(ev.timestamp).toLocaleTimeString();
          const el = ev.element;
          return `[${t}] CLICK ${el.tag}${el.id ? '#' + el.id : ''}${el.classes ? '.' + el.classes.replace(/\s+/g,'.') : ''}`;
        }).join('<br>');
  } else {
    container.innerHTML = debugResponses.length === 0
      ? '<em>No AI debug responses yet…</em>'
      : debugResponses.map(r => {
          const t = new Date(r.timestamp).toLocaleTimeString();
          return `<div style="margin-bottom:8px;">
                    <span style="color:#a78bfa;">[${t}] Prompt:</span><br>
                    ${r.prompt}<br>
                    <span style="color:#22c55e;">Response:</span><br>
                    ${r.response}
                  </div>`;
        }).join('');
  }
}

// Basic styles for the active tab
const termStyle = document.createElement('style');
termStyle.textContent = `
  .terminal-tab-active {
    background:#073b4c;
    color:#22c55e !important;
  }
`;
document.head.appendChild(termStyle);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}

// Debounced mousemove for hover detection (only when active)
let hoverTimeout;
function debouncedOverlayMouseMove(e) {
  if (!isLogTraceActive) return;
  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    const el = e.target;
    if (!el.closest('#log-trace-hover-overlay')) {
      highlightElement(el);
      showOverlayCard(el, e.clientX, e.clientY);
    }
  }, 10);
}

// --- Keyboard Shortcuts for Activation/Deactivation ---
document.addEventListener('keydown', function(e) {
  if (e.key === 's' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    if (!isLogTraceActive) activateLogTrace();
  }
  if (e.key === 'e' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    if (isLogTraceActive) deactivateLogTrace();
  }
  if (e.key === 'Escape' && isLogTraceActive) {
    e.preventDefault();
    deactivateLogTrace();
  }
});

// --- Ensure overlays are only shown when active ---
// Remove any overlays/highlights on page load
removeOverlayUI();

function registerOverlayListeners() {
  if (overlayListenersRegistered) return;
  document.addEventListener('mousemove', debouncedOverlayMouseMove, true);
  document.addEventListener('mouseout', handleMouseOut, true);
  overlayListenersRegistered = true;
}

function unregisterOverlayListeners() {
  if (!overlayListenersRegistered) return;
  document.removeEventListener('mousemove', debouncedOverlayMouseMove, true);
  document.removeEventListener('mouseout', handleMouseOut, true);
  overlayListenersRegistered = false;
}

function removeOverlayUI() {
  // Remove overlay card
  const card = document.getElementById('log-trace-hover-overlay');
  if (card) card.remove();
  // Hide highlighter
  const highlighter = document.getElementById('element-highlighter');
  if (highlighter) highlighter.style.display = 'none';
}

// Utility to extract up to 3 unique colors from computed styles (getComputedStyle only)
function extractColorsFromElement(element) {
  if (!element) return [];
  const styles = window.getComputedStyle(element);
  const colorProperties = [
    'color',
    'background-color',
    'border-color',
    'outline-color',
    'text-decoration-color',
    'fill',
    'stroke'
  ];
  const colors = [];
  colorProperties.forEach(property => {
    const value = styles.getPropertyValue(property);
    if (
      value &&
      value !== 'transparent' &&
      value !== 'rgba(0, 0, 0, 0)' &&
      value !== 'initial' &&
      !colors.includes(value.trim())
    ) {
      colors.push(value.trim());
    }
  });
  return colors.slice(0, 3);
}

function showOverlayCard(element, x, y) {
  // Remove old card
  let card = document.getElementById('log-trace-hover-overlay');
  if (card) card.remove();

  // Extract info
  const tag = element.tagName ? element.tagName.toLowerCase() : '';
  const id = element.id ? `#${element.id}` : '';
  const classes = element.className ? '.' + String(element.className).split(' ').join('.') : '';
  const text = element.textContent ? element.textContent.trim().replace(/\s+/g, ' ').slice(0, 60) : '';
  const parent = element.parentElement ? element.parentElement.tagName.toLowerCase() : '';
  const parentClasses = element.parentElement && element.parentElement.className ? '.' + String(element.parentElement.className).split(' ').join('.') : '';
  const parentPath = parent ? `${parent}${parentClasses}` : '';
  const colors = extractColorsFromElement(element);

  // Create card
  card = document.createElement('div');
  card.id = 'log-trace-hover-overlay';
  card.className = 'log-trace-hover-overlay';
  card.style.cssText = `
    position: fixed;
    z-index: 10002;
    pointer-events: auto;
    cursor: pointer;
    transform: translate(-50%, -100%);
    left: ${x}px;
    top: ${y - 10}px;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(6, 182, 212, 0.5);
    border-radius: 8px;
    padding: 12px;
    backdrop-filter: blur(16px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    min-width: 200px;
    max-width: 320px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
    color: #e2e8f0;
    position: fixed;
  `;
  // Card content
  card.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
      <span style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">${tag}</span>
      ${id ? `<span style=\"border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; padding: 2px 6px; border-radius: 4px; font-size: 11px;\">${id}</span>` : ''}
      ${classes ? `<span style=\"color: #22c55e; font-size: 11px;\">${classes.slice(0, 40)}${classes.length > 40 ? '…' : ''}</span>` : ''}
    </div>
    ${colors.length > 0 ? `<div style=\"display: flex; gap: 4px; margin-bottom: 8px;\">${colors.map(color => `<div style=\\"width: 16px; height: 16px; border-radius: 2px; border: 1px solid #475569; background-color: ${color.value};\\" title=\\"${color.property}: ${color.value}\\"></div>`).join('')}</div>` : ''}
    ${text ? `<div style=\"color: #d1d5db; margin-bottom: 4px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px;\">\"${text}${element.textContent.length > 60 ? '…' : ''}\"</div>` : ''}
    ${parentPath ? `<div style=\"color: #a3e635; font-size: 10px; margin-bottom: 4px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\">Parent: ${parentPath.slice(0, 60)}${parentPath.length > 60 ? '…' : ''}</div>` : ''}
    <div style=\"color: #a855f7; font-size: 11px; margin-bottom: 4px;\">Press D to pause details</div>
    <div style=\"color: #06b6d4; font-size: 11px;\">Click for details</div>
  `;
  document.body.appendChild(card);
}
