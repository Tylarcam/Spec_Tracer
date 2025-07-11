
/**
 * Simple storage utilities for LogTrace
 */

export const STORAGE_KEYS = {
  EVENTS: 'logtrace-events',
  SETTINGS: 'logtrace-settings',
  DEBUG_RESPONSES: 'logtrace-debug-responses',
} as const;

export const storage = {
  async get(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage set error:', error);
      throw new Error('Failed to save to storage');
    }
  },

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
      throw new Error('Failed to remove from storage');
    }
  },

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw new Error('Failed to clear storage');
    }
  },
};
