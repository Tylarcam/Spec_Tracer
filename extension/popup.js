// LogTrace Extension Popup
class LogTracePopup {
  constructor() {
    this.isActive = false;
    this.currentTab = null;
    this.apiKey = null;
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.render();
    this.bindEvents();
    await this.checkTabStatus();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['apiKey', 'isActive']);
      this.apiKey = result.apiKey || null;
      this.isActive = result.isActive || false;
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({
        apiKey: this.apiKey,
        isActive: this.isActive
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  render() {
    const root = document.getElementById('popup-root');
    root.innerHTML = `
      <div class="header">
        <h1>🔍 Trace Sight</h1>
        <p>Debug View Extension</p>
      </div>
      
      <div class="controls">
        <div class="switch-container">
          <span class="switch-label">Enable LogTrace</span>
          <label class="switch">
            <input type="checkbox" id="activeToggle" ${this.isActive ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="status-indicator">
          <div class="status-dot ${this.isActive ? 'active' : ''}"></div>
          <span>LogTrace is ${this.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
      
      <div class="api-config">
        <h3>🔑 API Configuration</h3>
        <input 
          type="password" 
          id="apiKeyInput" 
          placeholder="Enter your OpenAI API Key"
          value="${this.apiKey || ''}"
        >
        <button id="saveApiKey">Save API Key</button>
      </div>
      
      <div class="instructions">
        <h3>📖 How to Use</h3>
        <ol>
          <li>Enter your OpenAI API key above</li>
          <li>Toggle "Enable LogTrace" to activate</li>
          <li>Navigate to any webpage</li>
          <li>Use keyboard shortcuts:
            <ul>
              <li><strong>D</strong> - Pause/Resume hover details</li>
              <li><strong>Ctrl+D</strong> - Quick debug selected element</li>
              <li><strong>Esc</strong> - Exit debug mode</li>
            </ul>
          </li>
          <li>Click elements to inspect and debug</li>
        </ol>
      </div>
    `;
  }

  bindEvents() {
    // Toggle active state
    document.getElementById('activeToggle').addEventListener('change', async (e) => {
      this.isActive = e.target.checked;
      await this.saveSettings();
      await this.updateTabStatus();
      this.updateStatusIndicator();
    });

    // Save API key
    document.getElementById('saveApiKey').addEventListener('click', async () => {
      const apiKeyInput = document.getElementById('apiKeyInput');
      this.apiKey = apiKeyInput.value.trim();
      
      if (this.apiKey) {
        await this.saveSettings();
        this.showNotification('API key saved successfully!', 'success');
      } else {
        this.showNotification('Please enter a valid API key', 'error');
      }
    });

    // API key input validation
    document.getElementById('apiKeyInput').addEventListener('input', (e) => {
      const value = e.target.value.trim();
      const saveBtn = document.getElementById('saveApiKey');
      
      if (value.length > 0) {
        saveBtn.style.opacity = '1';
        saveBtn.disabled = false;
      } else {
        saveBtn.style.opacity = '0.5';
        saveBtn.disabled = true;
      }
    });
  }

  updateStatusIndicator() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-indicator span');
    
    if (this.isActive) {
      statusDot.classList.add('active');
      statusText.textContent = 'LogTrace is Active';
    } else {
      statusDot.classList.remove('active');
      statusText.textContent = 'LogTrace is Inactive';
    }
  }

  async checkTabStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
    } catch (error) {
      console.error('Failed to check tab status:', error);
    }
  }

  async updateTabStatus() {
    if (!this.currentTab) return;

    try {
      if (this.isActive) {
        // Send message to background script to handle everything
        await this.sendToBackground('toggleLogTrace', {
          tabId: this.currentTab.id,
          activate: true,
          apiKey: this.apiKey
        });
      } else {
        // Deactivate LogTrace
        await this.sendToBackground('toggleLogTrace', {
          tabId: this.currentTab.id,
          activate: false
        });
      }
    } catch (error) {
      console.error('Failed to update tab status:', error);
      this.showNotification('Failed to update LogTrace status', 'error');
    }
  }

  sendToBackground(action, data = {}) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({ 
          action: action,
          ...data
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Background script communication error:', chrome.runtime.lastError);
            const errorMsg = chrome.runtime.lastError.message || 'Failed to communicate with extension';
            this.showNotification(errorMsg, 'error');
            reject(new Error(errorMsg));
            return;
          }
          
          if (response && response.success) {
            resolve(response);
          } else {
            const errorMsg = response?.error || 'Unknown error occurred';
            this.showNotification(errorMsg, 'error');
            reject(new Error(errorMsg));
          }
        });
      } catch (error) {
        console.error('Error sending message to background:', error);
        this.showNotification('Extension communication failed', 'error');
        reject(error);
      }
    });
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Set styles based on type
    let backgroundColor = '#06b6d4';
    let textColor = 'white';
    
    if (type === 'success') {
      backgroundColor = '#22c55e';
      textColor = '#0f172a';
    } else if (type === 'error') {
      backgroundColor = '#ef4444';
      textColor = 'white';
    }
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      background: ${backgroundColor};
      color: ${textColor};
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LogTracePopup();
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateStatus') {
    // Update popup status if needed
    sendResponse({ status: 'updated' });
  }
}); 