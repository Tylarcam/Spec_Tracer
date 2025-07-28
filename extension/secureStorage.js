// Secure Storage Utility for Chrome Extension
// Handles encryption and secure storage of sensitive data

class SecureExtensionStorage {
  constructor() {
    this.keyPrefix = 'logtrace_secure_';
    this.credentialKey = 'lt_creds';
  }

  // Generate a simple encryption key based on extension ID
  async getEncryptionKey() {
    const extensionId = chrome.runtime.id;
    const encoder = new TextEncoder();
    const data = encoder.encode(extensionId + '_logtrace_v1');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  }

  // Simple XOR encryption for basic protection
  encrypt(text, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const encrypted = new Uint8Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ key[i % key.length];
    }
    
    return Array.from(encrypted);
  }

  // Simple XOR decryption
  decrypt(encryptedArray, key) {
    const decrypted = new Uint8Array(encryptedArray.length);
    
    for (let i = 0; i < encryptedArray.length; i++) {
      decrypted[i] = encryptedArray[i] ^ key[i % key.length];
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Store credentials securely
  async storeCredentials(supabaseUrl, supabaseKey) {
    try {
      const encryptionKey = await this.getEncryptionKey();
      const credentials = JSON.stringify({ supabaseUrl, supabaseKey });
      const encrypted = this.encrypt(credentials, encryptionKey);
      
      await chrome.storage.local.set({
        [this.keyPrefix + this.credentialKey]: encrypted
      });
      
      console.log('Credentials stored securely');
    } catch (error) {
      console.error('Failed to store credentials:', error);
      throw error;
    }
  }

  // Retrieve credentials securely
  async getCredentials() {
    try {
      const result = await chrome.storage.local.get([this.keyPrefix + this.credentialKey]);
      const encrypted = result[this.keyPrefix + this.credentialKey];
      
      if (!encrypted) {
        // Return default credentials if none stored (backward compatibility)
        return {
          supabaseUrl: 'https://kepmuysqytngtqterosr.supabase.co',
          supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcG11eXNxeXRuZ3RxdGVyb3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTk2NzQsImV4cCI6MjA2NzM5NTY3NH0.zlIhuBHikJjtK0Y1A31Bp7NIvP_j7E4OILRzz-7bJvA'
        };
      }
      
      const encryptionKey = await this.getEncryptionKey();
      const decrypted = this.decrypt(encrypted, encryptionKey);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      // Fallback to default credentials on error
      return {
        supabaseUrl: 'https://kepmuysqytngtqterosr.supabase.co',
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcG11eXNxeXRuZ3RxdGVyb3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTk2NzQsImV4cCI6MjA2NzM5NTY3NH0.zlIhuBHikJjtK0Y1A31Bp7NIvP_j7E4OILRzz-7bJvA'
      };
    }
  }

  // Store API keys securely
  async storeApiKey(apiKey) {
    try {
      const encryptionKey = await this.getEncryptionKey();
      const encrypted = this.encrypt(apiKey, encryptionKey);
      
      await chrome.storage.local.set({
        [this.keyPrefix + 'api_key']: encrypted
      });
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw error;
    }
  }

  // Retrieve API key securely
  async getApiKey() {
    try {
      const result = await chrome.storage.local.get([this.keyPrefix + 'api_key']);
      const encrypted = result[this.keyPrefix + 'api_key'];
      
      if (!encrypted) {
        return null;
      }
      
      const encryptionKey = await this.getEncryptionKey();
      return this.decrypt(encrypted, encryptionKey);
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      return null;
    }
  }

  // Clear all secure data
  async clearSecureData() {
    try {
      const keys = [
        this.keyPrefix + this.credentialKey,
        this.keyPrefix + 'api_key'
      ];
      
      await chrome.storage.local.remove(keys);
      console.log('Secure data cleared');
    } catch (error) {
      console.error('Failed to clear secure data:', error);
    }
  }
}

// Create a global instance
window.secureStorage = new SecureExtensionStorage();