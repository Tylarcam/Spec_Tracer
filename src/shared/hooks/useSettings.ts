
/**
 * Hook for managing LogTrace settings
 */

import { useState, useEffect, useCallback } from 'react';
import { LogTraceSettings } from '../types';
import { storage, STORAGE_KEYS } from '../storage';

const DEFAULT_SETTINGS: LogTraceSettings = {
  autoSave: true,
  maxEvents: 1000,
  debugMode: false,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<LogTraceSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from storage with retry mechanism
  const loadSettings = useCallback(async (retryCount = 0) => {
    try {
      setError(null);
      const savedSettings = await storage.get(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      
      if (retryCount < 2) {
        // Retry up to 2 times with exponential backoff
        setTimeout(() => loadSettings(retryCount + 1), Math.pow(2, retryCount) * 1000);
      } else {
        setError('Failed to load settings. Using default values.');
        setSettings(DEFAULT_SETTINGS);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save settings to storage with error handling
  const saveSettings = useCallback(async (newSettings: LogTraceSettings) => {
    try {
      setError(null);
      await storage.set(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Changes may not persist.');
      
      // Still update local state so UI reflects changes
      setSettings(newSettings);
      
      // Retry save after delay
      setTimeout(async () => {
        try {
          await storage.set(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
          setError(null);
        } catch (retryError) {
          console.error('Retry save failed:', retryError);
        }
      }, 2000);
    }
  }, []);

  return {
    settings,
    setSettings: saveSettings,
    isLoading,
    error,
    clearError: () => setError(null),
    retryLoad: () => loadSettings(),
  };
};
