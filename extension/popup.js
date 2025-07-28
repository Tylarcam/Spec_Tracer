// LogTrace Extension Popup with Authentication
class LogTracePopup {
  constructor() {
    this.isActive = false;
    this.terminalEnabled = false;
    this.currentTab = null;
    this.apiKey = null;
    this.currentTabName = 'general';
    this.user = null;
    this.authLoading = true;
    this.email = '';
    this.password = '';
    this.isLoading = false;
    this.supabaseUrl = 'https://kepmuysqytngtqterosr.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcG11eXNxeXRuZ3RxdGVyb3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTk2NzQsImV4cCI6MjA2NzM5NTY3NH0.zlIhuBHikJjtK0Y1A31Bp7NIvP_j7E4OILRzz-7bJvA';
    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.checkAuthState();
    this.render();
    this.bindEvents();
    await this.checkTabStatus();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['apiKey', 'isActive', 'terminalEnabled', 'authToken', 'user']);
      this.apiKey = result.apiKey || null;
      this.isActive = result.isActive || false;
      this.terminalEnabled = result.terminalEnabled || false;
      this.user = result.user || null;
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({
        apiKey: this.apiKey,
        isActive: this.isActive,
        terminalEnabled: this.terminalEnabled,
        authToken: this.user ? this.user.access_token : null,
        user: this.user
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async checkAuthState() {
    try {
      // Check if we have a stored user session
      if (this.user && this.user.access_token) {
        // Verify the token is still valid
        const isValid = await this.verifyToken(this.user.access_token);
        if (!isValid) {
          this.user = null;
          await this.saveSettings();
        }
      }

      // Check for existing authentication from main app
      await this.checkMainAppAuth();
      
      this.authLoading = false;
    } catch (error) {
      console.error('Failed to check auth state:', error);
      this.authLoading = false;
    }
  }

  async verifyToken(token) {
    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': this.supabaseKey
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async handleSignUp() {
    this.isLoading = true;
    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
          options: {
            emailRedirectTo: chrome.runtime.getURL('popup.html')
          }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        this.showNotification(data.error.message, 'error');
      } else {
        this.showNotification('Check your email for confirmation link', 'success');
        this.email = '';
        this.password = '';
      }
    } catch (error) {
      this.showNotification('Sign up failed', 'error');
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  async handleSignIn() {
    this.isLoading = true;
    this.render(); // Re-render to show loading state
    
    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      });

      const data = await response.json();
      
      if (data.error) {
        this.showNotification(data.error_description || data.error, 'error');
      } else {
        this.user = {
          id: data.user.id,
          email: data.user.email,
          access_token: data.access_token,
          refresh_token: data.refresh_token
        };
        await this.saveSettings();
        this.showNotification('Signed in successfully', 'success');
        this.email = '';
        this.password = '';
        this.render(); // Re-render to show user info
      }
    } catch (error) {
      this.showNotification('Sign in failed', 'error');
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  async handleSignInWithGitHub() {
    this.isLoading = true;
    try {
      // For GitHub OAuth, we need to open a popup window
      const authUrl = `${this.supabaseUrl}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(chrome.runtime.getURL('popup.html'))}`;
      
      // Open auth window
      chrome.windows.create({
        url: authUrl,
        type: 'popup',
        width: 500,
        height: 600
      }, (window) => {
        // Listen for the auth window to close
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
          if (tab.windowId === window.id && changeInfo.status === 'complete') {
            // Check if we're back to our popup
            if (tab.url && tab.url.includes('popup.html')) {
              chrome.tabs.onUpdated.removeListener(listener);
              // Parse the URL for auth tokens
              const url = new URL(tab.url);
              const accessToken = url.searchParams.get('access_token');
              const refreshToken = url.searchParams.get('refresh_token');
              
              if (accessToken) {
                // Get user info
                this.getUserInfo(accessToken, refreshToken);
              }
            }
          }
        });
      });
    } catch (error) {
      this.showNotification('GitHub sign in failed', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async getUserInfo(accessToken, refreshToken) {
    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': this.supabaseKey
        }
      });

      const userData = await response.json();
      
      if (userData.id) {
        this.user = {
          id: userData.id,
          email: userData.email,
          access_token: accessToken,
          refresh_token: refreshToken
        };
        await this.saveSettings();
        this.showNotification('Signed in successfully', 'success');
      }
    } catch (error) {
      this.showNotification('Failed to get user info', 'error');
    }
  }

  async handleSignOut() {
    try {
      if (this.user && this.user.access_token) {
        await fetch(`${this.supabaseUrl}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.user.access_token}`,
            'apikey': this.supabaseKey
          }
        });
      }
      
      this.user = null;
      await this.saveSettings();
      this.showNotification('Signed out successfully', 'success');
      this.render(); // Re-render to show sign-in form
    } catch (error) {
      this.showNotification('Sign out failed', 'error');
    }
  }

  async handleOpenMainApp() {
    try {
      // Open the main LogTrace app in a new tab
      await chrome.tabs.create({
        url: 'https://trace-sight-debug-view.vercel.app/auth?return=extension'
      });
      this.showNotification('Opening main app...', 'info');
    } catch (error) {
      this.showNotification('Failed to open main app', 'error');
    }
  }

  switchTab(tabName) {
    this.currentTabName = tabName;
    this.render();
  }

  render() {
    const root = document.getElementById('popup-root');
    
    if (this.authLoading) {
      root.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <p>Loading LogTrace...</p>
        </div>
      `;
      return;
    }

    root.innerHTML = `
      <div class="header">
        <h1>🔍 LogTrace</h1>
        <p>Capture Perfect Context</p>
      </div>
      
      <div class="tabs-container">
        <div class="tabs-header">
          <button class="tab-btn ${this.currentTabName === 'general' ? 'active' : ''}" data-tab="general">
            General
          </button>
          <button class="tab-btn ${this.currentTabName === 'account' ? 'active' : ''}" data-tab="account">
            Account
          </button>
        </div>
        
        <div class="tab-content scrollbar">
          ${this.renderTabContent()}
        </div>
      </div>
    `;
  }

  renderTabContent() {
    switch (this.currentTabName) {
      case 'general':
        return this.renderGeneralTab();
      case 'account':
        return this.renderAccountTab();
      default:
        return this.renderGeneralTab();
    }
  }

  renderGeneralTab() {
    return `
      <div class="section">
        <div class="section-title">Status</div>
        <div class="switch-container">
          <span class="switch-label">Enable Context Capture</span>
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
      
      <div class="section">
        <div class="section-title">Terminal</div>
        <div class="switch-container">
          <span class="switch-label">Enable Terminal Panel</span>
          <label class="switch">
            <input type="checkbox" id="terminalToggle" ${this.terminalEnabled ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-description">
          Access the terminal panel through the LogTrace interface when enabled
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Quick Start Guide</div>
        <div class="instructions">
          <ol>
            <li>Toggle "Enable Context Capture" to activate</li>
            <li>Navigate to any webpage</li>
            <li>Use keyboard shortcuts:
              <ul>
                <li><strong>Ctrl+S</strong> - Start/Stop tracing</li>
                <li><strong>Ctrl+E</strong> - End tracing session</li>
                <li><strong>P</strong> - Pause/Resume hover tracking</li>
                <li><strong>Right-click</strong> - Quick actions menu</li>
                <li><strong>Esc</strong> - Close panels/modals</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    `;
  }

  renderAccountTab() {
    if (this.user) {
      return `
        <div class="section">
          <div class="section-title">Account</div>
          <div class="user-info">
            <div class="user-email">${this.user.email}</div>
            <div class="user-status">
              <span>✓</span>
              <span>Signed in</span>
            </div>
          </div>
          <button class="btn btn-secondary" data-action="signout">
            Sign Out
          </button>
        </div>
      `;
    } else {
      return `
        <div class="section">
          <div class="section-title">Authentication</div>
          
          <div class="auth-section">
            <div class="auth-header">
              <span class="auth-icon">🔐</span>
              <span class="auth-title">Sign In to LogTrace</span>
            </div>
            
            <div class="auth-form">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-input" 
                  id="authEmail" 
                  placeholder="your@email.com"
                  value="${this.email}"
                >
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-input" 
                  id="authPassword" 
                  placeholder="••••••••"
                  value="${this.password}"
                >
              </div>
              <div class="auth-buttons">
                <button class="btn btn-primary" data-action="signin" ${this.isLoading ? 'disabled' : ''}>
                  ${this.isLoading ? 'Signing In...' : 'Sign In'}
                </button>
                <button class="btn btn-secondary" data-action="signup" ${this.isLoading ? 'disabled' : ''}>
                  ${this.isLoading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </div>
              <button class="btn btn-secondary" data-action="github" ${this.isLoading ? 'disabled' : ''}>
                Continue with GitHub
              </button>
            </div>
          </div>
          
          <div class="auth-section" style="margin-top: 16px;">
            <div class="auth-header">
              <span class="auth-icon">🌐</span>
              <span class="auth-title">Use Main App Session</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 12px;">
              Already signed in on the main LogTrace app? Open it to sync your session.
            </p>
            <button class="btn btn-primary" data-action="openMainApp">
              Open Main App
            </button>
          </div>
        </div>
      `;
    }
  }



  bindEvents() {
    // Toggle active state
    const activeToggle = document.getElementById('activeToggle');
    if (activeToggle) {
      activeToggle.addEventListener('change', async (e) => {
        this.isActive = e.target.checked;
        await this.saveSettings();
        await this.updateTabStatus();
        this.updateStatusIndicator();
      });
    }

    // Toggle terminal state
    const terminalToggle = document.getElementById('terminalToggle');
    if (terminalToggle) {
      terminalToggle.addEventListener('change', async (e) => {
        this.terminalEnabled = e.target.checked;
        await this.saveSettings();
        // Send message to content script to update terminal availability
        await this.sendToBackground('updateTerminalSetting', {
          terminalEnabled: this.terminalEnabled
        });
      });
    }

    // Auth form inputs
    const authEmail = document.getElementById('authEmail');
    if (authEmail) {
      authEmail.addEventListener('input', (e) => {
        this.email = e.target.value;
      });
    }

    const authPassword = document.getElementById('authPassword');
    if (authPassword) {
      authPassword.addEventListener('input', (e) => {
        this.password = e.target.value;
      });
    }

    // Bind authentication button clicks
    this.bindAuthButtons();
  }

  bindAuthButtons() {
    // Sign In button
    const signInBtn = document.querySelector('button[data-action="signin"]');
    if (signInBtn) {
      signInBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.handleSignIn();
      });
    }

    // Sign Up button
    const signUpBtn = document.querySelector('button[data-action="signup"]');
    if (signUpBtn) {
      signUpBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.handleSignUp();
      });
    }

    // GitHub Sign In button
    const githubBtn = document.querySelector('button[data-action="github"]');
    if (githubBtn) {
      githubBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.handleSignInWithGitHub();
      });
    }

    // Sign Out button
    const signOutBtn = document.querySelector('button[data-action="signout"]');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.handleSignOut();
      });
    }

    // Open Main App button
    const openMainAppBtn = document.querySelector('button[data-action="openMainApp"]');
    if (openMainAppBtn) {
      openMainAppBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.handleOpenMainApp();
      });
    }

    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      const tabName = btn.getAttribute('data-tab');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab(tabName);
      });
    });
  }

  updateStatusIndicator() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-indicator span');
    
    if (statusDot && statusText) {
      if (this.isActive) {
        statusDot.classList.add('active');
        statusText.textContent = 'LogTrace is Active';
      } else {
        statusDot.classList.remove('active');
        statusText.textContent = 'LogTrace is Inactive';
      }
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
        await this.sendToBackground('toggleLogTrace', {
          tabId: this.currentTab.id,
          activate: true,
          apiKey: this.apiKey
        });
      } else {
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
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

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

  async checkMainAppAuth() {
    try {
      // Check if user is already signed in on the main app
      const mainAppUrl = 'https://kepmuysqytngtqterosr.supabase.co';
      
      // Try to get session from localStorage (if accessible)
      const response = await fetch(`${mainAppUrl}/auth/v1/user`, {
        headers: {
          'apikey': this.supabaseKey
        }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.id && !this.user) {
          // User is signed in on main app but not in extension
          this.showNotification('Found existing session from main app', 'info');
          // Note: We can't access the main app's tokens directly due to security restrictions
        }
      }
    } catch (error) {
      // Silently fail - this is expected if user is not signed in
    }
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
let popup;
document.addEventListener('DOMContentLoaded', () => {
  popup = new LogTracePopup();
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateStatus') {
    sendResponse({ status: 'updated' });
  }
});
