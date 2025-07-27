// Trace Sight Debug View - Content Script v1.0.0
console.log('Trace Sight Content Script v1.0.0 loaded');

// Lucid Icons Utility - Consistent icon system
const LucidIcons = {
  // Debug & Analysis
  zap: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>',
  bug: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88L16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>',
  sparkles: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/></svg>',
  
  // Actions
  copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  camera: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  
  // Navigation & UI
  chevronDown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"/></svg>',
  chevronUp: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18,15 12,9 6,15"/></svg>',
  x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  minus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>',
  
  // Status & Feedback
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>',
  alertCircle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  
  // Terminal & Console
  terminal: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,17 10,11 4,5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  code: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>',
  fileText: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>',
  
  // Layout & Design
  square: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>',
  circle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>',
  triangle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0l-8.14-13.9A2 2 0 0 1 4.14 4h16.72a2 2 0 0 1 1.73 3.1z"/></svg>',
  
  // Interactive Elements
  mousePointer: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>',
  hand: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>',
  
  // Data & Analysis
  barChart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
  activity: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>',
  
  // Utility
  download: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  refreshCw: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>',
  
  // Get icon with optional size and color
  get: (name, size = 16, color = 'currentColor') => {
    const icon = LucidIcons[name];
    if (!icon) return '';
    return icon.replace(/width="16" height="16"/g, `width="${size}" height="${size}"`).replace(/stroke="currentColor"/g, `stroke="${color}"`);
  }
};

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

// Pinned details state
let pinnedDetails = [];
let pinnedDetailsCount = 0;

  // Screenshot state
  let activeScreenshotOverlay = null;
  let screenshotMode = null;
  
  // Quick actions state
  let quickActionsVisible = false;
  let quickActionsElement = null;
  let expandedQuickAction = null;
  let customQuickActionInput = '';
  
  // Context engine state
  let contextEngine = {
    elementInfo: null,
    computedStyles: {},
    eventListeners: [],
    consoleLogs: [],
    userIntent: ''
  };

// --- LogTrace Activation State and Overlay Management ---
let overlayListenersRegistered = false;

// Inspector hover state management
let isInspectorHovered = false;
let pausedElement = null;
let pausedPosition = { x: 0, y: 0 };

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
    pointer-events: none;
    z-index: 9998;
    display: none;
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
    width: 350px;
    max-height: 80vh;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(6, 182, 212, 0.5);
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 14px;
    z-index: 10001;
    display: none;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(6, 182, 212, 0.05);
    transition: all 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  panel.innerHTML = `
    <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid rgba(6, 182, 212, 0.2); cursor: move;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">ELEMENT INSPECTOR</div>
        <div style="border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; padding: 4px 8px; border-radius: 4px; font-size: 12px; display: none;" id="interactive-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 4px;">
            <polyline points="9,11 12,14 22,4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          Interactive
        </div>
      </div>
      <div style="display: flex; gap: 4px;">
        <button id="pin-panel" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 16px; display: flex; align-items: center; padding: 4px; border-radius: 4px; transition: all 0.2s;" title="Pin panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </button>
        <button id="debug-element" style="background: none; border: none; color: #a855f7; cursor: pointer; font-size: 16px; display: flex; align-items: center; padding: 4px; border-radius: 4px; transition: all 0.2s;" title="Debug with AI">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16,18 22,12 16,6"></polyline>
            <polyline points="8,6 2,12 8,18"></polyline>
          </svg>
        </button>
        <button id="close-panel" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 16px; display: flex; align-items: center; padding: 4px; border-radius: 4px; transition: all 0.2s;" title="Close panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <div style="padding: 16px;">
      <!-- Basic Info Accordion Section -->
      <div class="accordion-section">
        <div class="accordion-header" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; cursor: pointer; border-bottom: 1px solid rgba(6, 182, 212, 0.2);">
          <h4 style="margin: 0; color: #06b6d4; font-size: 14px; display: flex; align-items: center; gap: 8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      
      <!-- Attributes Accordion Section -->
      <div class="accordion-section">
        <div class="accordion-header" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; cursor: pointer; border-bottom: 1px solid rgba(168, 85, 247, 0.2);">
          <h4 style="margin: 0; color: #a855f7; font-size: 14px; display: flex; align-items: center; gap: 8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      
      <!-- Computed Styles Accordion Section -->
      <div class="accordion-section">
        <div class="accordion-header" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; cursor: pointer; border-bottom: 1px solid rgba(249, 115, 22, 0.2);">
          <h4 style="margin: 0; color: #f97316; font-size: 14px; display: flex; align-items: center; gap: 8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      
      <!-- Event Listeners Accordion Section -->
      <div class="accordion-section">
        <div class="accordion-header" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; cursor: pointer; border-bottom: 1px solid rgba(234, 179, 8, 0.2);">
          <h4 style="margin: 0; color: #eab308; font-size: 14px; display: flex; align-items: center; gap: 8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,11 12,14 22,4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Event Listeners
          </h4>
          <span class="accordion-icon" style="color: #64748b; transition: transform 0.2s;">▲</span>
        </div>
        <div class="accordion-content" style="padding: 8px 0; display: none;">
          <div id="event-listeners" style="margin-bottom: 12px; font-size: 12px;"></div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // Add inspector panel mouse event handlers
  panel.addEventListener('mouseenter', () => {
    if (!isInspectorHovered) {
      isInspectorHovered = true;
      pauseHoverOverlay();
    }
  });
  
  panel.addEventListener('mouseleave', () => {
    isInspectorHovered = false;
    resumeHoverOverlay();
  });
  
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
    const lockIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>`;
    
    const unlockIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 0 0 0v4"></path>
    </svg>`;
    
    pinButton.innerHTML = isPanelPinned ? lockIcon : unlockIcon;
    
    // If pinning, create a pinned details panel
    if (isPanelPinned && currentElement) {
      createPinnedDetailsPanel(currentElement, mousePosition);
    }
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
    // Resume hover overlay when closing inspector
    resumeHoverOverlay();
  });
  
  document.getElementById('debug-element').addEventListener('click', () => {
    if (currentElement) {
      openDebugModal(currentElement);
    }
  });
}

// Set up event listeners
function setupEventListeners() {
  // Mouse tracking
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('click', handleClick);
  
  // Right-click for quick actions
  document.addEventListener('contextmenu', handleRightClick);
  
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

// Handle right-click for quick actions
function handleRightClick(e) {
  if (!isLogTraceActive) return;
  
  e.preventDefault();
  const element = e.target;
  
  // Don't show quick actions on LogTrace elements
  if (isLogTraceElement(element)) return;
  
  currentElement = element;
  mousePosition = { x: e.clientX, y: e.clientY };
  
  // Show quick actions
  showQuickActions(e.clientX, e.clientY, element);
}

// Handle mouse over
function handleMouseOver(e) {
  if (!isLogTraceActive || isHoverPaused) return;
  
  const element = e.target;
  
  // Check if mouse is over inspector panel
  if (element && isInspectorElement(element)) {
    if (!isInspectorHovered) {
      isInspectorHovered = true;
      pauseHoverOverlay();
    }
    return;
  }
  
  // Resume hover if leaving inspector
  if (isInspectorHovered) {
    isInspectorHovered = false;
    resumeHoverOverlay();
  }
  
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
    pointer-events: none;
    transform: translate(-50%, -100%);
  `;

  // Position the overlay (matching web app logic)
  const padding = 8;
  let left = mouseX;
  let top = mouseY - 10;
  let below = false;

  // Get element attributes for specific data attributes
  const attributes = Array.from(element.attributes).map(attr => ({
    name: attr.name,
    value: attr.value
  }));

  // Card content matching web UI exactly
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
    ">
      <!-- Header: tag, event listeners, errors -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
        <!-- Tag name badge -->
        <span style="background: #22c55e; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">${element.tagName.toLowerCase()}</span>
        <!-- Event Listeners badge: shows count or 'No events' -->
        <span style="background: #22c55e; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${eventCount > 0 ? eventCount + ' events' : 'No events'}</span>
        <!-- Console Errors badge: placeholder for error count -->
        <span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Errors: None</span>
      </div>
      
      <!-- Color palette: up to 3 squares for main colors -->
      ${colors.length > 0 ? `<div style="display: flex; gap: 4px; margin-bottom: 8px;">${colors.map((color, i) => `<div style="width: 16px; height: 16px; border-radius: 2px; border: 1px solid #475569; background-color: ${color.value};" title="${color.property}: ${color.value}"></div>`).join('')}</div>` : ''}
      
      <!-- Basic Info Section -->
      <div style="margin-bottom: 4px;">
        <!-- data-lov-id value -->
        ${attributes.some(attr => attr.name === 'data-lov-id') ? `<span style="color: #c084fc; display: block; margin-bottom: 4px; font-size: 11px; font-family: monospace;">data-lov-id: ${attributes.find(attr => attr.name === 'data-lov-id')?.value}</span>` : ''}
        <!-- data-component-line value -->
        ${attributes.some(attr => attr.name === 'data-component-line') ? `<span style="color: #06b6d4; display: block; margin-bottom: 4px; font-size: 11px; font-family: monospace;">data-component-line: ${attributes.find(attr => attr.name === 'data-component-line')?.value}</span>` : ''}
        ${element.className ? `<span style="color: #22c55e; display: block; margin-bottom: 4px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; font-family: monospace;">class: .${element.className.split(' ').map(c => sanitizeText(c)).join(' .')}</span>` : ''}
        <!-- Position (x, y) -->
        <span style="color: #fdba74; display: block; margin-bottom: 4px; font-size: 11px; font-family: monospace;">Position: (${mouseX}, ${mouseY})</span>
      </div>
    </div>
  `;
  overlay.innerHTML = cardHTML;
  document.body.appendChild(overlay);

  // Position overlay in viewport (matching web app logic)
  const overlayRect = overlay.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Horizontal overflow handling
  if (left + overlayRect.width / 2 > viewportWidth - padding) {
    left = viewportWidth - overlayRect.width / 2 - padding;
  }
  if (left - overlayRect.width / 2 < padding) {
    left = overlayRect.width / 2 + padding;
  }
  
  // Vertical overflow handling
  if (top - overlayRect.height < padding) {
    top = mouseY + 20;
    below = true;
  }
  if (top + overlayRect.height > viewportHeight - padding) {
    top = viewportHeight - overlayRect.height - padding;
  }
  
  // Apply positioning with dynamic transform
  overlay.style.left = `${left}px`;
  overlay.style.top = `${top}px`;
  overlay.style.transform = `translate(-50%, ${below ? '0' : '-100%'})`;
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

// Helper function to check if an element is in an input field
function isInInputField(element) {
  if (!element) return false;
  
  return (
    // Standard input elements
    element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.tagName === 'SELECT' ||
    // Content editable elements
    element.isContentEditable ||
    // Any element with contenteditable attribute
    element.getAttribute('contenteditable') === 'true' ||
    // Check if element is inside a form
    element.closest('form') ||
    // Check if element is inside any input-related container
    element.closest('[role="textbox"]') ||
    element.closest('[role="searchbox"]') ||
    element.closest('[role="combobox"]') ||
    // LogTrace UI elements
    element.closest('#log-trace-terminal') ||
    element.closest('#log-trace-info-panel') ||
    element.closest('#log-trace-hover-overlay') ||
    element.closest('.debug-modal') ||
    element.closest('.quick-actions-menu') ||
    // Check for common input-related classes
    element.classList.contains('input') ||
    element.classList.contains('textarea') ||
    element.classList.contains('editor') ||
    // Check if element has input-related attributes
    element.hasAttribute('data-input') ||
    element.hasAttribute('data-editor')
  );
}

// Handle keyboard shortcuts
function handleKeyDown(e) {
  // Ignore shortcuts while the user is typing or inside any input field
  if (isInInputField(document.activeElement)) {
    return; // Don't intercept shortcuts when typing or in input fields
  }
  
  // Ctrl+S: Start/Stop tracing 
  if (e.ctrlKey && e.key.toLowerCase() === 's') {
    e.preventDefault();
    if (!isLogTraceActive) {
      activateLogTrace();
    } else {
      deactivateLogTrace();
    }
    return;
  }
  
  // Ctrl+E: End tracing session
  if (e.ctrlKey && e.key.toLowerCase() === 'e') {
    e.preventDefault();
    if (isLogTraceActive) {
      deactivateLogTrace();
    }
    return;
  }
  
  // Ctrl+T: Toggle terminal panel
  if (e.ctrlKey && e.key.toLowerCase() === 't') {
    e.preventDefault();
    toggleTerminal();
    return;
  }
  
  // Ctrl+D: Trigger AI debug
  if (e.ctrlKey && e.key.toLowerCase() === 'd') {
    e.preventDefault();
    if (currentElement) {
      openDebugModal(currentElement);
    }
    return;
  }
  
  // Ctrl+P: Pause/Resume hover tracking
  if (e.ctrlKey && e.key.toLowerCase() === 'p') {
    e.preventDefault();
    toggleHoverPause();
    return;
  }
  
  // Q: Quick actions (show context menu)
  if (e.key.toLowerCase() === 'q' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    if (isLogTraceActive && currentElement) {
      // Show quick actions menu at current mouse position
      showQuickActionsMenu(currentElement, mousePosition.x, mousePosition.y);
    }
    return;
  }
  
  // Escape: Close panels/modals
  if (e.key === 'Escape') {
    if (isLogTraceActive) {
      // Close any open modals first
      const terminalModal = document.getElementById('log-trace-terminal-modal');
      if (terminalModal) {
        terminalModal.remove();
        return;
      }
      
      const debugModal = document.querySelector('.debug-modal');
      if (debugModal) {
        debugModal.remove();
        return;
      }
      
      // If no modals open, deactivate LogTrace
      deactivateLogTrace();
    }
    return;
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

// Pause hover overlay (for inspector or quick actions)
function pauseHoverOverlay() {
  if (!isHoverPaused) {
    isHoverPaused = true;
    pausedElement = currentElement;
    pausedPosition = { ...mousePosition };
    
    // Keep the current overlay visible
    const overlay = document.getElementById('log-trace-hover-overlay');
    if (overlay) {
      overlay.style.pointerEvents = 'none';
    }
  }
}

// Resume hover overlay
function resumeHoverOverlay() {
  if (isHoverPaused && !isInspectorHovered) {
    isHoverPaused = false;
    pausedElement = null;
    pausedPosition = { x: 0, y: 0 };
    
    // Remove the paused overlay
    const overlay = document.getElementById('log-trace-hover-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

// Check if element is part of inspector panel
function isInspectorElement(element) {
  return element && (
    element.closest('#log-trace-info-panel') ||
    element.closest('.debug-modal') ||
    element.closest('.quick-actions-menu') ||
    element.closest('[data-inspector-panel]')
  );
}

// Highlight element
function highlightElement(element) {
  const highlighter = document.getElementById('element-highlighter');
  if (!highlighter) return;
  
  const rect = element.getBoundingClientRect();
  
  highlighter.style.cssText = `
    position: fixed;
    border: 2px solid #06b6d4;
    pointer-events: none;
    z-index: 9998;
    display: block;
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
  const eventListenersDiv = document.getElementById('event-listeners');
  const interactiveBadge = document.getElementById('interactive-badge');
  
  if (!infoDiv || !computedStylesDiv || !attributesDiv || !eventListenersDiv) return;
  
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  
  // Check if element is interactive
  const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase()) || 
                       element.onclick !== null ||
                       styles.cursor === 'pointer';
  
  // Show/hide interactive badge
  if (interactiveBadge) {
    interactiveBadge.style.display = isInteractive ? 'flex' : 'none';
  }
  
  // Get element hierarchy
  const hierarchy = [];
  let parent = element.parentElement;
  let depth = 0;
  while (parent && depth < 3) {
    const tagName = parent.tagName.toLowerCase();
    const id = parent.id ? `#${parent.id}` : '';
    const className = parent.className ? `.${parent.className.split(' ')[0]}` : '';
    hierarchy.unshift(`${tagName}${id}${className}`);
    parent = parent.parentElement;
    depth++;
  }
  const hierarchyPath = hierarchy.length > 0 ? hierarchy.join(' > ') + ' > ' : '';
  
  // Basic Info Section
  infoDiv.innerHTML = `
    <div style="background: rgba(30, 41, 59, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(6, 182, 212, 0.2);">
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="color: #94a3b8;">Tag:</span>
        <span style="color: #06b6d4; font-family: monospace;">&lt;${element.tagName.toLowerCase()}&gt;</span>
      </div>
      ${element.id ? `<div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="color: #94a3b8;">ID:</span>
        <span style="color: #22c55e; font-family: monospace;">#${element.id}</span>
      </div>` : ''}
      ${element.className ? `<div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="color: #94a3b8;">Classes:</span>
        <span style="color: #22c55e; font-family: monospace; text-align: right; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">
          .${element.className.split(' ').join(' .')}
        </span>
      </div>` : ''}
      ${element.textContent ? `<div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="color: #94a3b8;">Text:</span>
        <span style="color: #3b82f6; font-family: monospace; text-align: right; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">
          "${element.textContent.trim().replace(/\s+/g, ' ').substring(0, 50)}${element.textContent.length > 50 ? '...' : ''}"
        </span>
      </div>` : ''}
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="color: #94a3b8;">Position:</span>
        <span style="color: #f97316; font-family: monospace;">
          (${Math.round(mousePosition.x)}, ${Math.round(mousePosition.y)})
        </span>
      </div>
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="color: #94a3b8;">Size:</span>
        <span style="color: #f97316; font-family: monospace;">
          ${Math.round(rect.width)}×${Math.round(rect.height)}
        </span>
      </div>
      ${hierarchyPath ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(107, 114, 128, 0.3);">
        <span style="color: #94a3b8; font-size: 12px;">Path:</span>
        <div style="color: #a855f7; font-family: monospace; font-size: 12px; margin-top: 4px; word-break: break-all;">
          ${hierarchyPath}${element.tagName.toLowerCase()}
        </div>
      </div>` : ''}
    </div>
  `;
  
  // Computed Styles Section
  const importantStyles = {
    // Layout
    display: styles.display,
    position: styles.position,
    zIndex: styles.zIndex,
    visibility: styles.visibility,
    opacity: styles.opacity,
    overflow: styles.overflow,
    // Dimensions
    width: styles.width,
    height: styles.height,
    margin: styles.margin,
    padding: styles.padding,
    border: styles.border,
    // Typography
    color: styles.color,
    backgroundColor: styles.backgroundColor,
    fontSize: styles.fontSize,
    fontFamily: styles.fontFamily,
    lineHeight: styles.lineHeight,
    textAlign: styles.textAlign,
    // Interactive
    pointerEvents: styles.pointerEvents,
    cursor: styles.cursor,
    userSelect: styles.userSelect,
    // Flexbox
    flexDirection: styles.flexDirection,
    alignItems: styles.alignItems,
    justifyContent: styles.justifyContent,
    flexWrap: styles.flexWrap,
    // Grid
    gridTemplateColumns: styles.gridTemplateColumns,
    gridTemplateRows: styles.gridTemplateRows,
    gridArea: styles.gridArea,
    // Visual Effects
    borderRadius: styles.borderRadius,
    boxShadow: styles.boxShadow,
    transform: styles.transform,
    filter: styles.filter,
  };
  
  let stylesHTML = `
    <div style="background: rgba(30, 41, 59, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(249, 115, 22, 0.2); max-height: 200px; overflow-y: auto;">
      <table style="width: 100%; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(107, 114, 128, 0.3);">
            <th style="text-align: left; padding: 4px 8px; color: #f97316; font-weight: 500;">property</th>
            <th style="text-align: left; padding: 4px 8px; color: #f97316; font-weight: 500;">value</th>
            <th style="text-align: left; padding: 4px 8px; color: #f97316; font-weight: 500; width: 60px;">copy</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  Object.entries(importantStyles).forEach(([property, value]) => {
    if (value && value !== 'initial' && value !== 'normal') {
      stylesHTML += `
        <tr style="border-bottom: 1px solid rgba(107, 114, 128, 0.2);">
          <td style="padding: 4px 8px; color: #f97316; font-family: monospace; vertical-align: top;">${property}</td>
          <td style="padding: 4px 8px; vertical-align: top;">
            <span style="color: #e2e8f0; font-family: monospace; word-break: break-all; max-width: 200px; display: inline-block;">${value}</span>
          </td>
          <td style="padding: 4px 8px; vertical-align: top;">
            <button onclick="navigator.clipboard.writeText('${value}'); this.style.color='#22c55e'; setTimeout(()=>this.style.color='#64748b', 1000);" style="background: none; border: none; color: #64748b; cursor: pointer; padding: 2px;" title="Copy value">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="20" x="8" y="2" rx="2" ry="2"></rect>
                <path d="M22 20c.552 0 1-.448 1-1V9c0-.552-.448-1-1-1h-6.626c-.437 0-.853.174-1.162.484l-3.374 3.374A1.64 1.64 0 0 1 10 12.374V20c0 .552.448 1 1 1h11z"></path>
              </svg>
            </button>
          </td>
        </tr>
      `;
    }
  });
  
  stylesHTML += `
        </tbody>
      </table>
    </div>
  `;
  
  computedStylesDiv.innerHTML = stylesHTML;
  
  // Attributes Section
  let attributesHTML = `
    <div style="background: rgba(30, 41, 59, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(168, 85, 247, 0.2); max-height: 200px; overflow-y: auto;">
  `;
  
  if (element.attributes.length > 0) {
    attributesHTML += `
      <table style="width: 100%; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(107, 114, 128, 0.3);">
            <th style="text-align: left; padding: 4px 8px; color: #a855f7; font-weight: 500;">attribute</th>
            <th style="text-align: left; padding: 4px 8px; color: #a855f7; font-weight: 500;">value</th>
            <th style="text-align: left; padding: 4px 8px; color: #a855f7; font-weight: 500; width: 60px;">copy</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    for (const attr of element.attributes) {
      if (attr.name !== 'style') { // Skip style attribute as it's usually too long
        const displayValue = attr.value.length > 50 ? attr.value.substring(0, 50) + '...' : attr.value;
        attributesHTML += `
          <tr style="border-bottom: 1px solid rgba(107, 114, 128, 0.2);">
            <td style="padding: 4px 8px; color: #a855f7; font-family: monospace; vertical-align: top;">${attr.name}</td>
            <td style="padding: 4px 8px; vertical-align: top;">
              <span style="color: #e2e8f0; font-family: monospace; word-break: break-all; max-width: 200px; display: inline-block;" title="${attr.value.length > 50 ? attr.value : ''}">"${displayValue}"</span>
            </td>
            <td style="padding: 4px 8px; vertical-align: top;">
              <button onclick="navigator.clipboard.writeText('${attr.value}'); this.style.color='#22c55e'; setTimeout(()=>this.style.color='#64748b', 1000);" style="background: none; border: none; color: #64748b; cursor: pointer; padding: 2px;" title="Copy value">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="14" height="20" x="8" y="2" rx="2" ry="2"></rect>
                  <path d="M22 20c.552 0 1-.448 1-1V9c0-.552-.448-1-1-1h-6.626c-.437 0-.853.174-1.162.484l-3.374 3.374A1.64 1.64 0 0 1 10 12.374V20c0 .552.448 1 1 1h11z"></path>
                </svg>
              </button>
            </td>
          </tr>
        `;
      }
    }
    
    attributesHTML += `
        </tbody>
      </table>
    `;
  } else {
    attributesHTML += '<em style="color: #64748b;">No attributes available</em>';
  }
  
  attributesHTML += '</div>';
  attributesDiv.innerHTML = attributesHTML;
  
  // Event Listeners Section
  const eventListeners = getEventListenerInfo(element);
  let eventListenersHTML = `
    <div style="background: rgba(30, 41, 59, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(234, 179, 8, 0.2);">
  `;
  
  if (eventListeners.length > 0) {
    eventListenersHTML += `
      <div style="font-weight: 500; color: #eab308; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,11 12,14 22,4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        Events (${eventListeners.length})
      </div>
      <table style="width: 100%; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(107, 114, 128, 0.3);">
            <th style="text-align: left; padding: 4px 8px; color: #eab308; font-weight: 500;">Type</th>
            <th style="text-align: left; padding: 4px 8px; color: #eab308; font-weight: 500;">Handler</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    eventListeners.forEach((listener, index) => {
      eventListenersHTML += `
        <tr style="border-bottom: 1px solid rgba(107, 114, 128, 0.2);">
          <td style="padding: 4px 8px; color: #eab308; font-family: monospace;">${listener.type}</td>
          <td style="padding: 4px 8px; color: #e2e8f0;">${listener.handler}</td>
        </tr>
      `;
    });
    
    eventListenersHTML += `
        </tbody>
      </table>
    `;
  } else {
    eventListenersHTML += '<em style="color: #64748b;">No event listeners found</em>';
  }
  
  eventListenersHTML += '</div>';
  eventListenersDiv.innerHTML = eventListenersHTML;
}

// Open debug modal with enhanced Debug Assistant v1.0.0
function openDebugModal(element) {
  // Remove existing modal
  const existingModal = document.getElementById('claude-debug-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Pause hover overlay when opening debug modal
  pauseHoverOverlay();

  // Create modal with enhanced Debug Assistant matching main app
  const modal = document.createElement('div');
  modal.id = 'claude-debug-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-left">
          <div class="header-icon">${LucidIcons.get('bug', 24, '#06b6d4')}</div>
          <div class="header-text">
            <h3>Debug Assistant</h3>
            <p>AI-powered element analysis</p>
          </div>
        </div>
        <button class="close-btn">${LucidIcons.get('x', 20, '#9ca3af')}</button>
      </div>
      
      <div class="modal-body">
        <div class="modal-layout">
          <!-- Left Panel - Element Context -->
          <div class="left-panel">
            <div class="element-context">
              <div class="context-header">
                <span class="context-title">Selected Element</span>
                <button class="expand-btn" id="expand-context">${LucidIcons.get('chevronDown', 12, '#64748b')}</button>
              </div>
              <div class="context-content" id="context-content">
                <div class="element-badges">
                  <span class="badge tag-badge">${element.tagName.toLowerCase()}</span>
                  ${['button','a','input','select','textarea'].includes(element.tagName.toLowerCase()) || element.onclick ? '<span class="badge interactive-badge">Interactive</span>' : ''}
                </div>
                <div class="element-details">
                  ${element.id ? `<div class="detail-item"><span class="label">ID:</span><span class="value">#${element.id}</span></div>` : ''}
                  ${element.className ? `<div class="detail-item"><span class="label">Classes:</span><span class="value">.${element.className.split(' ').join(' .')}</span></div>` : ''}
                  ${element.textContent ? `<div class="detail-item"><span class="label">Text:</span><span class="value">"${element.textContent.substring(0, 50)}${element.textContent.length > 50 ? '...' : ''}"</span></div>` : ''}
                </div>
              </div>
            </div>
            
            <div class="context-summary">
              <div class="summary-header">
                <span class="summary-title">Element Context</span>
              </div>
              <div class="summary-content">
                <div class="summary-item"><span class="label">Tag:</span><span class="value">&lt;${element.tagName.toLowerCase()}&gt;</span></div>
                ${element.id ? `<div class="summary-item"><span class="label">ID:</span><span class="value">#${element.id}</span></div>` : ''}
                ${element.className ? `<div class="summary-item"><span class="label">Classes:</span><span class="value">.${element.className.split(' ').join(' .')}</span></div>` : ''}
                ${['button','a','input','select','textarea'].includes(element.tagName.toLowerCase()) || element.onclick ? '<div class="summary-item"><span class="value interactive">Interactive element</span></div>' : ''}
              </div>
            </div>
          </div>

          <!-- Right Panel - Debug Interface -->
          <div class="right-panel">
            <div class="tabs-container">
              <div class="tabs-header">
                <button class="tab-btn active" data-tab="quick">
                  <span class="tab-icon">${LucidIcons.get('zap', 16, '#06b6d4')}</span>
                  <span>Quick</span>
                </button>
                <button class="tab-btn" data-tab="advanced">
                  <span class="tab-icon">${LucidIcons.get('settings', 16, '#64748b')}</span>
                  <span>Advanced</span>
                </button>
                <button class="tab-btn" data-tab="prompt">
                  <span class="tab-icon">${LucidIcons.get('sparkles', 16, '#64748b')}</span>
                  <span>Prompt</span>
                </button>
              </div>
              
              <div class="tab-content">
                <!-- Quick Tab -->
                <div class="tab-pane active" id="quick-tab">
                  <div class="quick-intro">
                    <div class="intro-icon">${LucidIcons.get('zap', 32, '#06b6d4')}</div>
                    <h4>Quick Debug</h4>
                    <p>Describe what you want to fix or improve</p>
                  </div>
                  
                  <div class="quick-objectives">
                    <button class="objective-btn" data-objective="Fix alignment">Fix alignment</button>
                    <button class="objective-btn" data-objective="Check accessibility">Check accessibility</button>
                    <button class="objective-btn" data-objective="Make clickable">Make clickable</button>
                    <button class="objective-btn" data-objective="Improve contrast">Improve contrast</button>
                    <button class="objective-btn" data-objective="Fix overflow/scroll">Fix overflow/scroll</button>
                    <button class="objective-btn" data-objective="Add aria-label">Add aria-label</button>
                    <button class="objective-btn" data-objective="Make responsive">Make responsive</button>
                    <button class="objective-btn" data-objective="Remove outline">Remove outline</button>
                    <button class="objective-btn" data-objective="Add hover effect">Add hover effect</button>
                    <button class="objective-btn" data-objective="Fix font size">Fix font size</button>
                    <button class="objective-btn" data-objective="Make button primary">Make button primary</button>
                    <button class="objective-btn" data-objective="Add tooltip">Add tooltip</button>
                  </div>
                  
                  <div class="quick-input-section">
                    <div class="input-container">
                      <input type="text" id="quick-debug-input" placeholder="Describe what you want to fix or improve..." maxlength="500">
                                             <button id="quick-debug-btn" class="debug-btn primary">
                         <span class="btn-icon">${LucidIcons.get('zap', 16, '#ffffff')}</span>
                         <span>Debug</span>
                       </button>
                    </div>
                  </div>
                </div>
                
                <!-- Advanced Tab -->
                <div class="tab-pane" id="advanced-tab">
                  <div class="advanced-intro">
                    <div class="intro-icon">${LucidIcons.get('settings', 32, '#a855f7')}</div>
                    <h4>Advanced Debug</h4>
                    <p>Deep analysis with detailed context</p>
                  </div>
                  
                  <div class="advanced-questions">
                    <label>Common Questions</label>
                    <div class="question-buttons">
                      <button class="question-btn" data-question="Why might this element not be behaving as expected?">Why might this element not be behaving as expected?</button>
                      <button class="question-btn" data-question="Are there any CSS properties preventing interaction?">Are there any CSS properties preventing interaction?</button>
                      <button class="question-btn" data-question="What accessibility concerns might exist?">What accessibility concerns might exist?</button>
                      <button class="question-btn" data-question="How could the user experience be improved?">How could the user experience be improved?</button>
                    </div>
                  </div>
                  
                  <div class="advanced-input-section">
                    <textarea id="advanced-debug-input" placeholder="Describe your advanced debug question or issue..." maxlength="2000"></textarea>
                                         <button id="advanced-debug-btn" class="debug-btn secondary">
                       <span class="btn-icon">${LucidIcons.get('settings', 16, '#ffffff')}</span>
                       <span>Advanced Debug</span>
                     </button>
                  </div>
                </div>
                
                <!-- Prompt Tab -->
                <div class="tab-pane" id="prompt-tab">
                  <div class="prompt-intro">
                    <div class="intro-icon">${LucidIcons.get('sparkles', 32, '#22c55e')}</div>
                    <h4>Context Prompt</h4>
                    <p>AI-generated prompts with full context</p>
                  </div>
                  
                  <div class="prompt-section">
                    <div class="prompt-header">
                      <label>Generated Prompt</label>
                                           <button id="copy-prompt-btn" class="copy-btn" disabled>
                       <span class="copy-icon">${LucidIcons.get('copy', 16, '#22c55e')}</span>
                       <span>Copy</span>
                     </button>
                    </div>
                    <div class="prompt-content">
                      <textarea id="generated-prompt" placeholder="Generated prompt will appear here..." readonly></textarea>
                    </div>
                    <div class="prompt-actions" id="prompt-actions" style="display: none;">
                                             <button id="debug-with-prompt-btn" class="debug-btn primary">
                         <span class="btn-icon">${LucidIcons.get('sparkles', 16, '#ffffff')}</span>
                         <span>Debug with Prompt</span>
                       </button>
                       <button id="copy-prompt-btn-2" class="copy-btn">
                         <span class="copy-icon">${LucidIcons.get('copy', 16, '#22c55e')}</span>
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div id="analysis-result"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add debug modal mouse event handlers
  modal.addEventListener('mouseenter', () => {
    if (!isInspectorHovered) {
      isInspectorHovered = true;
      pauseHoverOverlay();
    }
  });
  
  modal.addEventListener('mouseleave', () => {
    isInspectorHovered = false;
    resumeHoverOverlay();
  });
  
  // Set up advanced prompt
  const advancedTextarea = modal.querySelector('#advanced-debug-input');
  advancedTextarea.value = generateAdvancedPrompt(element);
  
  // Add event listeners for new modal structure
  modal.querySelector('.close-btn').addEventListener('click', () => {
    modal.remove();
    resumeHoverOverlay();
  });
  
  // Tab switching
  modal.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Update active tab button and icon colors
      modal.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        const icon = b.querySelector('.tab-icon svg');
        if (icon) {
          icon.style.stroke = '#64748b';
        }
      });
      btn.classList.add('active');
      
      // Set active tab icon color
      const activeIcon = btn.querySelector('.tab-icon svg');
      if (activeIcon) {
        activeIcon.style.stroke = '#06b6d4';
      }
      
      // Update active tab content
      modal.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      modal.querySelector(`#${tabName}-tab`).classList.add('active');
    });
  });
  
  // Context expand/collapse
  modal.querySelector('#expand-context').addEventListener('click', () => {
    const content = modal.querySelector('#context-content');
    const btn = modal.querySelector('#expand-context');
    const isExpanded = content.style.display !== 'none';
    
    content.style.display = isExpanded ? 'none' : 'block';
    btn.innerHTML = isExpanded ? LucidIcons.get('chevronDown', 12, '#64748b') : LucidIcons.get('chevronUp', 12, '#64748b');
  });
  
  // Quick objectives
  modal.querySelectorAll('.objective-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const objective = btn.dataset.objective;
      const input = modal.querySelector('#quick-debug-input');
      input.value = objective;
      input.focus();
      
      // Update active objective
      modal.querySelectorAll('.objective-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Advanced questions
  modal.querySelectorAll('.question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const question = btn.dataset.question;
      const textarea = modal.querySelector('#advanced-debug-input');
      textarea.value = question;
      textarea.focus();
      
      // Update active question
      modal.querySelectorAll('.question-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Debug buttons
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
  
  // Prompt generation
  modal.querySelector('#quick-debug-input').addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value) {
      generateContextPrompt(element, value);
    }
  });
  
  // Copy prompt functionality
  modal.querySelector('#copy-prompt-btn').addEventListener('click', () => {
    const prompt = modal.querySelector('#generated-prompt').value;
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      showNotification('Prompt copied to clipboard');
    }
  });
  
  modal.querySelector('#copy-prompt-btn-2').addEventListener('click', () => {
    const prompt = modal.querySelector('#generated-prompt').value;
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      showNotification('Prompt copied to clipboard');
    }
  });
  
  // Debug with prompt
  modal.querySelector('#debug-with-prompt-btn').addEventListener('click', () => {
    const prompt = modal.querySelector('#generated-prompt').value;
    if (prompt) {
      analyzeElementWithAI(element, prompt);
    }
  });
  
  // Focus on quick debug input
  modal.querySelector('#quick-debug-input').focus();
  
  // Add keyboard shortcuts
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !isInInputField(document.activeElement)) {
      modal.remove();
      resumeHoverOverlay();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      const activeElement = document.activeElement;
      if (activeElement.id === 'quick-debug-input') {
        modal.querySelector('#quick-debug-btn').click();
      } else if (activeElement.id === 'advanced-debug-input') {
        modal.querySelector('#advanced-debug-btn').click();
      }
    }
  });

  document.body.appendChild(modal);
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

// Generate context prompt for the new prompt tab
async function generateContextPrompt(element, userIntent) {
  if (!userIntent.trim()) return;
  
  try {
    // Update context engine state
    contextEngine.elementInfo = {
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      classes: element.className ? element.className.split(' ').filter(c => c) : [],
      text: element.textContent ? element.textContent.substring(0, 200) : null,
      parentPath: getElementPath(element)
    };
    
    contextEngine.computedStyles = getComputedStyles(element);
    contextEngine.eventListeners = getEventListenerInfo(element);
    contextEngine.userIntent = userIntent;
    
    // Generate the prompt using context engine
    const prompt = generateContextEnginePrompt();
    
    // Update the prompt textarea
    const promptTextarea = document.querySelector('#generated-prompt');
    const copyBtn = document.querySelector('#copy-prompt-btn');
    const promptActions = document.querySelector('#prompt-actions');
    
    if (promptTextarea) {
      promptTextarea.value = prompt;
      copyBtn.disabled = false;
      promptActions.style.display = 'flex';
    }
    
    // Switch to prompt tab
    const promptTab = document.querySelector('[data-tab="prompt"]');
    if (promptTab) {
      promptTab.click();
    }
    
  } catch (error) {
    console.error('Error generating context prompt:', error);
    showNotification('Failed to generate context prompt', 'error');
  }
}

// Generate prompt using context engine
function generateContextEnginePrompt() {
  const { elementInfo, computedStyles, eventListeners, userIntent } = contextEngine;
  
  return `You are an expert web development debugging assistant. Analyze the following element and provide a comprehensive debugging response.

Element Context:
- Tag: ${elementInfo.tag}
- ID: ${elementInfo.id || 'None'}
- Classes: ${elementInfo.classes.join(', ') || 'None'}
- Text: "${elementInfo.text || 'None'}"
- Parent Path: ${elementInfo.parentPath}
- Position: x:${Math.round(mousePosition.x)}, y:${Math.round(mousePosition.y)}
- Event Listeners: ${eventListeners.length > 0 ? eventListeners.map(l => l.type).join(', ') : 'None'}

Computed Styles:
${Object.entries(computedStyles).map(([prop, value]) => `- ${prop}: ${value}`).join('\n')}

User Intent: ${userIntent}

Please provide a comprehensive debugging analysis that addresses the user's specific intent and provides actionable solutions.`;
}

// Get element path for context
function getElementPath(element) {
  const path = [];
  let current = element;
  
  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    const id = current.id ? `#${current.id}` : '';
    const classes = current.className ? `.${current.className.split(' ').join('.')}` : '';
    path.unshift(`${tag}${id}${classes}`);
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

// Get computed styles for context
function getComputedStyles(element) {
  const styles = window.getComputedStyle(element);
  const relevantProps = [
    'display', 'position', 'top', 'left', 'right', 'bottom',
    'width', 'height', 'margin', 'padding', 'border',
    'flex-direction', 'justify-content', 'align-items',
    'grid-template-columns', 'grid-template-rows',
    'z-index', 'opacity', 'visibility', 'overflow',
    'background', 'color', 'font-size', 'font-weight',
    'cursor', 'pointer-events', 'user-select'
  ];
  
  const result = {};
  relevantProps.forEach(prop => {
    const value = styles.getPropertyValue(prop);
    if (value && value !== 'initial' && value !== 'normal') {
      result[prop] = value;
    }
  });
  
  return result;
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
  const listeners = [];
  
  // Check for common event properties (matching web app)
  const commonEvents = [
    'onclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmouseout',
    'onmouseenter', 'onmouseleave', 'onkeydown', 'onkeyup', 'oninput',
    'onchange', 'onfocus', 'onblur', 'onsubmit', 'onload', 'onerror'
  ];
  
  commonEvents.forEach(event => {
    if (typeof element[event] === 'function') {
      listeners.push({
        type: event.replace('on', ''),
        handler: 'attached'
      });
    }
  });
  
  // Check for data attributes that might indicate event handling
  Array.from(element.attributes).forEach(attr => {
    if (attr.name.startsWith('data-') && (attr.name.includes('click') || attr.name.includes('event'))) {
      listeners.push({
        type: attr.name,
        handler: attr.value || 'data attribute'
      });
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
    if (e.key === 'Escape' && !isInInputField(document.activeElement)) {
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
      <div style="display:flex;gap:8px;">
        <button id="terminal-export-btn" style="background:none;border:1px solid #334155;color:#e2e8f0;padding:4px 8px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;">
          ${LucidIcons.get('download', 12, '#e2e8f0')} Export
        </button>
        <button id="terminal-clear-btn" style="background:none;border:1px solid #334155;color:#e2e8f0;padding:4px 8px;border-radius:4px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;">
          ${LucidIcons.get('refreshCw', 12, '#e2e8f0')} Clear
        </button>
        <button id="terminal-close-btn" style="background:none;border:none;color:#e2e8f0;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;width:24px;height:24px;">
          ${LucidIcons.get('x', 16, '#e2e8f0')}
        </button>
      </div>
    </div>
    <div style="display:flex;border-bottom:1px solid #334155;">
      <div id="terminal-tab-events" class="terminal-tab terminal-tab-active" style="padding:6px 12px;cursor:pointer;display:flex;align-items:center;gap:4px;">
        ${LucidIcons.get('activity', 12, '#22c55e')} Events
      </div>
      <div id="terminal-tab-debug"  class="terminal-tab"              style="padding:6px 12px;cursor:pointer;display:flex;align-items:center;gap:4px;">
        ${LucidIcons.get('bug', 12, '#64748b')} AI Debug
      </div>
      <div id="terminal-tab-console" class="terminal-tab"             style="padding:6px 12px;cursor:pointer;display:flex;align-items:center;gap:4px;">
        ${LucidIcons.get('code', 12, '#64748b')} Console
      </div>
    </div>
    <div id="terminal-content" style="padding:8px 12px;font-size:12px;overflow-y:auto;max-height:40vh;"></div>
  `;

  document.body.appendChild(term);

  term.querySelector('#terminal-close-btn').addEventListener('click', () => toggleTerminal());
  term.querySelector('#terminal-export-btn').addEventListener('click', () => exportTerminalData());
  term.querySelector('#terminal-clear-btn').addEventListener('click', () => clearTerminalData());
  term.querySelector('#terminal-tab-events').addEventListener('click', () => { terminalActiveTab = 'events'; switchTab(); });
  term.querySelector('#terminal-tab-debug').addEventListener('click', () => { terminalActiveTab = 'debug';  switchTab(); });
  term.querySelector('#terminal-tab-console').addEventListener('click', () => { terminalActiveTab = 'console'; switchTab(); });

  function switchTab() {
    term.querySelectorAll('.terminal-tab').forEach(t => {
      t.classList.remove('terminal-tab-active');
      // Reset icon colors to muted
      const icon = t.querySelector('svg');
      if (icon) {
        icon.style.stroke = '#64748b';
      }
    });
    
    const activeTab = term.querySelector('#terminal-tab-' + terminalActiveTab);
    activeTab.classList.add('terminal-tab-active');
    
    // Set active tab icon color
    const activeIcon = activeTab.querySelector('svg');
    if (activeIcon) {
      activeIcon.style.stroke = '#22c55e';
    }
    
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
  } else if (terminalActiveTab === 'debug') {
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
  } else if (terminalActiveTab === 'console') {
    // Capture console logs
    const consoleLogs = captureConsoleLogs();
    container.innerHTML = consoleLogs.length === 0
      ? '<em>No console logs captured…</em>'
      : consoleLogs.map(log => {
          const t = new Date(log.timestamp).toLocaleTimeString();
          const level = log.level || 'log';
          const color = level === 'error' ? '#ef4444' : level === 'warn' ? '#f59e0b' : '#06b6d4';
          return `<div style="margin-bottom:4px;">
                    <span style="color:${color};">[${t}] ${level.toUpperCase()}:</span>
                    <span style="color:#e2e8f0;"> ${log.message}</span>
                  </div>`;
        }).join('');
  }
}

// Capture console logs
function captureConsoleLogs() {
  // This is a simplified version - in a real implementation you'd want to
  // override console methods to capture logs
  return [];
}

// Export terminal data
function exportTerminalData() {
  const data = {
    events: debugEvents,
    debugResponses: debugResponses,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `logtrace-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showNotification('Terminal data exported successfully');
}

// Clear terminal data
function clearTerminalData() {
  debugEvents = [];
  debugResponses = [];
  renderTerminal();
  showNotification('Terminal data cleared');
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
      showHoverOverlay(el, e.clientX, e.clientY);
    }
  }, 10);
}

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

// Sanitization utility (matching web app)
function sanitizeText(text, maxLength = 500) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, maxLength);
}

// Utility to extract up to 3 unique colors from computed styles (matching web UI)
function extractColorsFromElement(element) {
  if (!element) return [];
  const styles = window.getComputedStyle(element);
  const colorProperties = [
    'color',
    'background-color',
    'border-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
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
      value !== 'inherit'
    ) {
      colors.push({
        property,
        value: value.trim()
      });
    }
  });
  // Remove duplicates and limit to 3
  const uniqueColors = colors.filter((color, idx, arr) =>
    arr.findIndex(c => c.value === color.value) === idx
  );
  return uniqueColors.slice(0, 3);
}



// Show quick actions menu at specified position
function showQuickActions(x, y, element) {
  // Remove any existing quick actions
  const existingPill = document.querySelector('.quick-actions-pill');
  if (existingPill) {
    existingPill.remove();
  }

  // Pause hover overlay when opening quick actions
  pauseHoverOverlay();

  const pill = document.createElement('div');
  pill.className = 'quick-actions-pill';
  pill.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y - 48}px;
    z-index: 1000;
    background: rgba(30, 41, 59, 0.95);
    border: 1px solid rgba(34, 211, 238, 0.6);
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(34, 211, 238, 0.2);
    padding: 12px 16px;
    gap: 8px;
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    min-width: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create main action buttons
  const createActionButton = (icon, label, action, hasDropdown = false) => {
    const button = document.createElement('button');
    button.innerHTML = `
      <span style="color: #67e8f9; font-size: 16px; margin-right: 8px;">${icon}</span>
      <span style="color: #67e8f9; font-weight: 500; font-size: 14px;">${label}</span>
      ${hasDropdown ? '<span style="color: #67e8f9; font-size: 12px; margin-left: 4px;">▼</span>' : ''}
    `;
    button.style.cssText = `
      display: flex;
      align-items: center;
      min-width: 64px;
      background: rgba(51, 65, 85, 0.8);
      border: 1px solid transparent;
      border-radius: 8px;
      color: #67e8f9;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      padding: 8px 16px;
      cursor: pointer;
      outline: none;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(6, 182, 212, 0.6)';
      button.style.borderColor = 'rgba(6, 182, 212, 0.4)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(51, 65, 85, 0.8)';
      button.style.borderColor = 'transparent';
    });
    
    button.addEventListener('click', () => {
      if (action === 'screenshot' || action === 'context' || action === 'debug') {
        expandQuickAction(pill, action, element);
      } else {
        handleQuickAction(action, element);
        pill.remove();
        resumeHoverOverlay();
      }
    });
    
    return button;
  };

  // Add main action buttons
  pill.appendChild(createActionButton(LucidIcons.get('copy', 16, '#67e8f9'), 'Copy', 'copy'));
  pill.appendChild(createActionButton(LucidIcons.get('camera', 16, '#67e8f9'), 'Shot', 'screenshot', true));
  pill.appendChild(createActionButton(LucidIcons.get('sparkles', 16, '#67e8f9'), 'Gen', 'context', true));
  pill.appendChild(createActionButton(LucidIcons.get('bug', 16, '#67e8f9'), 'Fix', 'debug', true));

  // Store references
  quickActionsElement = pill;
  quickActionsVisible = true;

  // Close on outside click
  const closeOnOutsideClick = (e) => {
    if (!pill.contains(e.target)) {
      pill.remove();
      quickActionsVisible = false;
      quickActionsElement = null;
      expandedQuickAction = null;
      document.removeEventListener('click', closeOnOutsideClick);
      resumeHoverOverlay();
    }
  };
  
  setTimeout(() => {
    document.addEventListener('click', closeOnOutsideClick);
  }, 100);

  // Close on Escape key
  const closeOnEscape = (e) => {
    if (e.key === 'Escape') {
      if (expandedQuickAction) {
        collapseQuickAction(pill);
      } else {
        pill.remove();
        quickActionsVisible = false;
        quickActionsElement = null;
        document.removeEventListener('keydown', closeOnEscape);
        resumeHoverOverlay();
      }
    }
  };
  document.addEventListener('keydown', closeOnEscape);

  document.body.appendChild(pill);
}

function expandQuickAction(pill, action, element) {
  expandedQuickAction = action;
  
  // Clear existing content
  pill.innerHTML = '';
  pill.style.flexDirection = 'column';
  pill.style.alignItems = 'stretch';
  pill.style.minWidth = '280px';
  
  const options = getQuickActionOptions(action);
  const color = getActionColor(action);
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: ${color};
    font-weight: 500;
    font-size: 14px;
  `;
  header.innerHTML = `
    <span style="font-size: 16px;">${getActionIcon(action)}</span>
    <span>${getActionTitle(action)}</span>
  `;
  pill.appendChild(header);
  
  // Options
  options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option.label;
    button.style.cssText = `
      width: 100%;
      text-align: left;
      padding: 8px 12px;
      background: rgba(30, 41, 59, 0.8);
      border: none;
      color: ${color};
      font-size: 14px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 4px;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.background = `${color}20`;
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(30, 41, 59, 0.8)';
    });
    
    button.addEventListener('click', () => {
      handleQuickActionWithMode(action, option.mode, element);
      pill.remove();
      quickActionsVisible = false;
      quickActionsElement = null;
      expandedQuickAction = null;
      resumeHoverOverlay();
    });
    
    pill.appendChild(button);
  });
  
  // Custom input section
  const inputSection = document.createElement('div');
  inputSection.style.cssText = `
    padding-top: 8px;
    border-top: 1px solid rgba(100, 116, 139, 0.5);
    margin-top: 8px;
  `;
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = `Custom ${action} prompt...`;
  input.style.cssText = `
    width: 100%;
    padding: 8px 12px;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(100, 116, 139, 0.6);
    border-radius: 4px;
    color: #e2e8f0;
    font-size: 14px;
    outline: none;
    margin-bottom: 8px;
  `;
  
  input.addEventListener('focus', () => {
    input.style.borderColor = color;
  });
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      handleQuickActionWithMode(action, 'custom', element, input.value.trim());
      pill.remove();
      quickActionsVisible = false;
      quickActionsElement = null;
      expandedQuickAction = null;
      resumeHoverOverlay();
    }
  });
  
  const submitButton = document.createElement('button');
  submitButton.textContent = action === 'screenshot' ? 'Take Shot' : action === 'context' ? 'Generate' : 'Debug';
  submitButton.style.cssText = `
    width: 100%;
    padding: 8px 12px;
    background: ${color};
    border: none;
    color: #000;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 500;
  `;
  
  submitButton.addEventListener('click', () => {
    if (input.value.trim()) {
      handleQuickActionWithMode(action, 'custom', element, input.value.trim());
      pill.remove();
      quickActionsVisible = false;
      quickActionsElement = null;
      expandedQuickAction = null;
      resumeHoverOverlay();
    }
  });
  
  inputSection.appendChild(input);
  inputSection.appendChild(submitButton);
  pill.appendChild(inputSection);
}

function collapseQuickAction(pill) {
  expandedQuickAction = null;
  showQuickActions(
    parseInt(pill.style.left),
    parseInt(pill.style.top) + 48,
    currentElement
  );
}

function getQuickActionOptions(action) {
  switch (action) {
    case 'screenshot':
      return [
        { label: 'Rectangle', mode: 'rectangle' },
        { label: 'Window', mode: 'window' },
        { label: 'Full Screen', mode: 'fullscreen' },
        { label: 'Freeform', mode: 'freeform' }
      ];
    case 'context':
      return [
        { label: 'Analyze Layout', mode: 'layout' },
        { label: 'Check Accessibility', mode: 'accessibility' },
        { label: 'Performance Review', mode: 'performance' }
      ];
    case 'debug':
      return [
        { label: 'Why not working?', mode: 'why-not-working' },
        { label: 'CSS Issues', mode: 'css-issues' },
        { label: 'Event Problems', mode: 'event-problems' }
      ];
    default:
      return [];
  }
}

function getActionColor(action) {
  switch (action) {
    case 'screenshot': return '#f97316';
    case 'context': return '#eab308';
    case 'debug': return '#a855f7';
    default: return '#67e8f9';
  }
}

function getActionIcon(action) {
  switch (action) {
    case 'screenshot': return LucidIcons.get('camera', 16, '#f97316');
    case 'context': return LucidIcons.get('sparkles', 16, '#eab308');
    case 'debug': return LucidIcons.get('bug', 16, '#a855f7');
    default: return LucidIcons.get('zap', 16, '#67e8f9');
  }
}

function getActionTitle(action) {
  switch (action) {
    case 'screenshot': return 'Screenshot Options';
    case 'context': return 'Context Generation';
    case 'debug': return 'Debug Questions';
    default: return 'Quick Actions';
  }
}

// Handle quick action selection
function handleQuickAction(action, element) {
  switch (action) {
    case 'copy':
      // Copy element selector
      const selector = generateSelector(element);
      navigator.clipboard.writeText(selector);
      showNotification('Element selector copied to clipboard');
      break;
    case 'debug':
      // Open AI debug modal
      openDebugModal(element);
      break;
    case 'screenshot':
      // Take screenshot of element
      takeElementScreenshot(element);
      break;
    case 'context':
      // Show context analysis
      showContextAnalysis(element);
      break;
  }
}

// Handle quick action with mode
function handleQuickActionWithMode(action, mode, element, customInput = null) {
  switch (action) {
    case 'screenshot':
      handleScreenshotAction(mode, element);
      break;
    case 'context':
      handleContextAction(mode, element, customInput);
      break;
    case 'debug':
      handleDebugAction(mode, element, customInput);
      break;
  }
}

function handleScreenshotAction(mode, element) {
  switch (mode) {
    case 'rectangle':
      startRectangleScreenshot();
      break;
    case 'window':
      takeWindowScreenshot();
      break;
    case 'fullscreen':
      takeFullscreenScreenshot();
      break;
    case 'freeform':
      startFreeformScreenshot();
      break;
    case 'custom':
      takeElementScreenshot(element);
      break;
  }
}

function handleContextAction(mode, element, customInput) {
  let prompt = customInput;
  
  if (!prompt) {
    switch (mode) {
      case 'layout':
        prompt = 'Analyze the layout and positioning';
        break;
      case 'accessibility':
        prompt = 'Check accessibility features and issues';
        break;
      case 'performance':
        prompt = 'Review performance implications';
        break;
      default:
        prompt = 'Provide general analysis';
    }
  }
  
  analyzeElementWithAI(element, prompt);
}

function handleDebugAction(mode, element, customInput) {
  let prompt = customInput;
  
  if (!prompt) {
    switch (mode) {
      case 'why-not-working':
        prompt = 'Why might this element not be behaving as expected?';
        break;
      case 'css-issues':
        prompt = 'Are there any CSS properties preventing interaction?';
        break;
      case 'event-problems':
        prompt = 'What event handling issues might exist?';
        break;
      default:
        prompt = 'Debug this element';
    }
  }
  
  analyzeElementWithAI(element, prompt);
}

// Show detailed element information
function showElementDetails(element) {
  const details = gatherElementContext(element);
  const modal = createModal('Element Details', `
    <div style="max-height: 400px; overflow-y: auto;">
      <h3 style="color: #10b981; margin-bottom: 12px;">Element Information</h3>
      <div style="margin-bottom: 16px;">
        <strong>Tag:</strong> ${element.tagName}<br>
        <strong>ID:</strong> ${element.id || 'None'}<br>
        <strong>Classes:</strong> ${element.className || 'None'}<br>
        <strong>Text:</strong> ${element.textContent?.substring(0, 100) || 'None'}${element.textContent?.length > 100 ? '...' : ''}
      </div>
      
      <h4 style="color: #3b82f6; margin-bottom: 8px;">Attributes</h4>
      <div style="margin-bottom: 16px; font-family: monospace; font-size: 12px;">
        ${Object.entries(details.attributes || {}).map(([key, value]) => 
          `<div>${key}: "${value}"</div>`
        ).join('')}
      </div>
      
      <h4 style="color: #3b82f6; margin-bottom: 8px;">Computed Styles</h4>
      <div style="font-family: monospace; font-size: 12px;">
        ${Object.entries(details.computedStyles || {}).slice(0, 10).map(([key, value]) => 
          `<div>${key}: ${value}</div>`
        ).join('')}
      </div>
    </div>
  `);
}

// Take screenshot of element
function takeElementScreenshot(element) {
  // This would require additional implementation for screenshot functionality
  showNotification('Screenshot feature coming soon!', 'info');
}

function startRectangleScreenshot() {
  screenshotMode = 'rectangle';
  createScreenshotOverlay();
  showNotification('Click and drag to select area for screenshot');
}

function startFreeformScreenshot() {
  screenshotMode = 'freeform';
  createScreenshotOverlay();
  showNotification('Click to start drawing freeform selection');
}

function takeWindowScreenshot() {
  // Capture current window
  chrome.runtime.sendMessage({ action: 'takeScreenshot', type: 'window' }, (response) => {
    if (response && response.success) {
      showNotification('Window screenshot captured');
    } else {
      showNotification('Failed to capture window screenshot', 'error');
    }
  });
}

function takeFullscreenScreenshot() {
  // Capture full screen
  chrome.runtime.sendMessage({ action: 'takeScreenshot', type: 'fullscreen' }, (response) => {
    if (response && response.success) {
      showNotification('Fullscreen screenshot captured');
    } else {
      showNotification('Failed to capture fullscreen screenshot', 'error');
    }
  });
}

function createScreenshotOverlay() {
  // Remove existing overlay
  if (activeScreenshotOverlay) {
    activeScreenshotOverlay.remove();
  }
  
  const overlay = document.createElement('div');
  overlay.id = 'screenshot-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 10007;
    cursor: crosshair;
  `;
  
  let isDrawing = false;
  let startX, startY;
  let selectionBox = null;
  
  if (screenshotMode === 'rectangle') {
    overlay.addEventListener('mousedown', (e) => {
      isDrawing = true;
      startX = e.clientX;
      startY = e.clientY;
      
      selectionBox = document.createElement('div');
      selectionBox.style.cssText = `
        position: fixed;
        border: 2px solid #06b6d4;
        background: rgba(6, 182, 212, 0.1);
        z-index: 10008;
      `;
      document.body.appendChild(selectionBox);
    });
    
    overlay.addEventListener('mousemove', (e) => {
      if (!isDrawing || !selectionBox) return;
      
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      
      selectionBox.style.left = left + 'px';
      selectionBox.style.top = top + 'px';
      selectionBox.style.width = width + 'px';
      selectionBox.style.height = height + 'px';
    });
    
    overlay.addEventListener('mouseup', () => {
      if (isDrawing && selectionBox) {
        const rect = selectionBox.getBoundingClientRect();
        captureScreenshotArea(rect);
        cleanupScreenshotOverlay();
      }
    });
  } else if (screenshotMode === 'freeform') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 10008;
      pointer-events: none;
    `;
    document.body.appendChild(canvas);
    
    let points = [];
    
    overlay.addEventListener('mousedown', (e) => {
      isDrawing = true;
      points = [{ x: e.clientX, y: e.clientY }];
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
    });
    
    overlay.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      points.push({ x: e.clientX, y: e.clientY });
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
    });
    
    overlay.addEventListener('mouseup', () => {
      if (isDrawing && points.length > 2) {
        captureFreeformScreenshot(points);
        cleanupScreenshotOverlay();
      }
    });
  }
  
  // Add escape key handler
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      cleanupScreenshotOverlay();
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  activeScreenshotOverlay = overlay;
  document.body.appendChild(overlay);
}

function captureScreenshotArea(rect) {
  chrome.runtime.sendMessage({
    action: 'takeScreenshot',
    type: 'area',
    area: {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    }
  }, (response) => {
    if (response && response.success) {
      showNotification('Area screenshot captured');
    } else {
      showNotification('Failed to capture area screenshot', 'error');
    }
  });
}

function captureFreeformScreenshot(points) {
  // For freeform, we'll capture the bounding box and let the user crop
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));
  
  const rect = {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY
  };
  
  captureScreenshotArea(rect);
}

function cleanupScreenshotOverlay() {
  if (activeScreenshotOverlay) {
    activeScreenshotOverlay.remove();
    activeScreenshotOverlay = null;
  }
  
  const selectionBox = document.querySelector('#screenshot-selection-box');
  if (selectionBox) {
    selectionBox.remove();
  }
  
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.remove();
  }
  
  screenshotMode = null;
}

// Show context analysis
function showContextAnalysis(element) {
  const context = gatherElementContext(element);
  const modal = createModal('Context Analysis', `
    <div style="max-height: 400px; overflow-y: auto;">
      <h3 style="color: #10b981; margin-bottom: 12px;">Element Context</h3>
      <div style="margin-bottom: 16px;">
        <strong>Parent Path:</strong><br>
        <div style="font-family: monospace; font-size: 12px; color: #94a3b8;">
          ${context.parentPath || 'None'}
        </div>
      </div>
      
      <h4 style="color: #3b82f6; margin-bottom: 8px;">Event Listeners</h4>
      <div style="font-family: monospace; font-size: 12px;">
        ${context.eventListeners?.length > 0 ? 
          context.eventListeners.map(listener => 
            `<div>${listener.type}: ${listener.handler}</div>`
          ).join('') : 
          'No event listeners found'
        }
      </div>
    </div>
  `);
}

// Create pinned details panel
function createPinnedDetailsPanel(element, position) {
  const pinnedId = `pinned-${Date.now()}`;
  pinnedDetailsCount++;
  
  const panel = document.createElement('div');
  panel.id = pinnedId;
  panel.className = 'pinned-details-panel';
  panel.style.cssText = `
    position: fixed;
    left: ${position.x + 20}px;
    top: ${position.y - 20}px;
    width: 300px;
    max-height: 400px;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(6, 182, 212, 0.5);
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 14px;
    z-index: 10006;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  
  panel.innerHTML = `
    <div class="pinned-header" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid rgba(6, 182, 212, 0.2); cursor: move;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">PINNED #${pinnedDetailsCount}</div>
        <div style="border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; padding: 4px 8px; border-radius: 4px; font-size: 12px; display: ${['button','a','input','select','textarea'].includes(element.tagName.toLowerCase()) || element.onclick ? 'flex' : 'none'};">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 4px;">
            <polyline points="9,11 12,14 22,4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          Interactive
        </div>
      </div>
      <div style="display: flex; gap: 4px;">
        <button class="debug-pinned-btn" style="background: none; border: none; color: #a855f7; cursor: pointer; font-size: 16px; display: flex; align-items: center; padding: 4px; border-radius: 4px; transition: all 0.2s;" title="Debug with AI">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16,18 22,12 16,6"></polyline>
            <polyline points="8,6 2,12 8,18"></polyline>
          </svg>
        </button>
        <button class="close-pinned-btn" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 16px; display: flex; align-items: center; padding: 4px; border-radius: 4px; transition: all 0.2s;" title="Close panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <div style="padding: 12px;">
      <div style="background: rgba(30, 41, 59, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(6, 182, 212, 0.2); margin-bottom: 12px;">
        <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span style="color: #94a3b8;">Tag:</span>
          <span style="color: #06b6d4; font-family: monospace;">&lt;${element.tagName.toLowerCase()}&gt;</span>
        </div>
        ${element.id ? `<div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span style="color: #94a3b8;">ID:</span>
          <span style="color: #22c55e; font-family: monospace;">#${element.id}</span>
        </div>` : ''}
        ${element.className ? `<div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span style="color: #94a3b8;">Classes:</span>
          <span style="color: #22c55e; font-family: monospace; text-align: right; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">
            .${element.className.split(' ').join(' .')}
          </span>
        </div>` : ''}
        ${element.textContent ? `<div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span style="color: #94a3b8;">Text:</span>
          <span style="color: #3b82f6; font-family: monospace; text-align: right; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">
            "${element.textContent.trim().replace(/\s+/g, ' ').substring(0, 50)}${element.textContent.length > 50 ? '...' : ''}"
          </span>
        </div>` : ''}
        <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span style="color: #94a3b8;">Position:</span>
          <span style="color: #f97316; font-family: monospace;">
            (${Math.round(position.x)}, ${Math.round(position.y)})
          </span>
        </div>
        <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span style="color: #94a3b8;">Size:</span>
          <span style="color: #f97316; font-family: monospace;">
            ${Math.round(rect.width)}×${Math.round(rect.height)}
          </span>
        </div>
      </div>
      
      <div style="background: rgba(30, 41, 59, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(249, 115, 22, 0.2);">
        <div style="font-weight: 500; color: #f97316; margin-bottom: 8px;">Key Styles</div>
        <div style="font-size: 12px; font-family: monospace;">
          <div>display: ${styles.display}</div>
          <div>position: ${styles.position}</div>
          <div>z-index: ${styles.zIndex}</div>
          <div>visibility: ${styles.visibility}</div>
          <div>opacity: ${styles.opacity}</div>
          <div>pointer-events: ${styles.pointerEvents}</div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // Store pinned panel reference
  pinnedDetails.push({
    id: pinnedId,
    element: element,
    position: position,
    panel: panel
  });
  
  // Make panel draggable
  let isDragging = false;
  let offsetX, offsetY;
  
  const header = panel.querySelector('.pinned-header');
  
  header.addEventListener('mousedown', (e) => {
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
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    panel.style.cursor = 'default';
  });
  
  // Add event listeners
  panel.querySelector('.debug-pinned-btn').addEventListener('click', () => {
    openDebugModal(element);
  });
  
  panel.querySelector('.close-pinned-btn').addEventListener('click', () => {
    removePinnedDetailsPanel(pinnedId);
  });
  
  // Add panel mouse event handlers
  panel.addEventListener('mouseenter', () => {
    if (!isInspectorHovered) {
      isInspectorHovered = true;
      pauseHoverOverlay();
    }
  });
  
  panel.addEventListener('mouseleave', () => {
    isInspectorHovered = false;
    resumeHoverOverlay();
  });
  
  return panel;
}

// Remove pinned details panel
function removePinnedDetailsPanel(pinnedId) {
  const panel = document.getElementById(pinnedId);
  if (panel) {
    panel.remove();
    pinnedDetails = pinnedDetails.filter(p => p.id !== pinnedId);
    pinnedDetailsCount = Math.max(0, pinnedDetailsCount - 1);
  }
}

// Create a modal dialog
function createModal(title, content) {
  // Remove any existing modal
  const existingModal = document.querySelector('.debug-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'debug-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483648;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: #1e293b;
    border: 1px solid #475569;
    border-radius: 12px;
    padding: 24px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    color: #e2e8f0;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #475569;
  `;

  const titleElement = document.createElement('h2');
  titleElement.textContent = title;
  titleElement.style.cssText = `
    margin: 0;
    color: #10b981;
    font-size: 18px;
    font-weight: 600;
  `;

  const closeButton = document.createElement('button');
  closeButton.textContent = '✕';
  closeButton.style.cssText = `
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 20px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  closeButton.addEventListener('click', () => {
    modal.remove();
  });

  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.background = '#334155';
    closeButton.style.color = '#e2e8f0';
  });

  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.background = 'transparent';
    closeButton.style.color = '#94a3b8';
  });

  header.appendChild(titleElement);
  header.appendChild(closeButton);

  const contentElement = document.createElement('div');
  contentElement.innerHTML = content;

  modalContent.appendChild(header);
  modalContent.appendChild(contentElement);
  modal.appendChild(modalContent);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Close on Escape key
  const closeOnEscape = (e) => {
    if (e.key === 'Escape' && !isInInputField(document.activeElement)) {
      modal.remove();
      document.removeEventListener('keydown', closeOnEscape);
    }
  };
  document.addEventListener('keydown', closeOnEscape);

  document.body.appendChild(modal);
  return modal;
}
