
// Secure storage utilities to prevent sensitive data exposure
export const secureStorage = {
  // Remove any API keys from local storage
  clearSensitiveData: () => {
    const keysToRemove = [
      'openai_api_key',
      'api_key',
      'secret_key',
      'private_key',
      'openai-api-key' // Additional format
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.warn('🔒 Security: Cleared sensitive data from local storage');
  },

  // Secure way to store non-sensitive user preferences
  setUserPreference: (key: string, value: string) => {
    // Only allow specific preference keys
    const allowedKeys = [
      'theme',
      'language',
      'timezone',
      'notifications_enabled',
      'tutorial_completed'
    ];
    
    if (allowedKeys.includes(key)) {
      localStorage.setItem(`logtrace_pref_${key}`, value);
    }
  },

  getUserPreference: (key: string): string | null => {
    return localStorage.getItem(`logtrace_pref_${key}`);
  },

  // Clear all preferences
  clearPreferences: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('logtrace_pref_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Initialize secure storage on app load
secureStorage.clearSensitiveData();
