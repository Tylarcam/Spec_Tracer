
/**
 * Unified storage utility for LogTrace
 * Works in both browser and extension contexts
 */

interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter {
  async get(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('LocalStorage set error:', error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('LocalStorage remove error:', error);
    }
  }
}

class ChromeStorageAdapter implements StorageAdapter {
  async get(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && (window as any).chrome?.storage) {
        const result = await (window as any).chrome.storage.local.get([key]);
        return result[key] || null;
      }
      return null;
    } catch (error) {
      console.error('Chrome storage get error:', error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && (window as any).chrome?.storage) {
        await (window as any).chrome.storage.local.set({ [key]: value });
      }
    } catch (error) {
      console.error('Chrome storage set error:', error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && (window as any).chrome?.storage) {
        await (window as any).chrome.storage.local.remove([key]);
      }
    } catch (error) {
      console.error('Chrome storage remove error:', error);
    }
  }
}

// Auto-detect storage adapter
const createStorageAdapter = (): StorageAdapter => {
  if (typeof window !== 'undefined' && (window as any).chrome?.storage) {
    return new ChromeStorageAdapter();
  }
  return new LocalStorageAdapter();
};

export const storage = createStorageAdapter();

// Storage keys
export const STORAGE_KEYS = {
  EVENTS: 'logtrace-events',
  API_KEY: 'logtrace-api-key',
  SETTINGS: 'logtrace-settings',
} as const;
