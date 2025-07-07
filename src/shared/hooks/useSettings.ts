
/**
 * Hook for managing LogTrace settings
 */

import { useState, useEffect } from 'react';
import { LogTraceSettings } from '../types';
import { storage, STORAGE_KEYS } from '../storage';

const DEFAULT_SETTINGS: LogTraceSettings = {
  autoSave: true,
  maxEvents: 1000,
  debugMode: false,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<LogTraceSettings>(DEFAULT_SETTINGS);

  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await storage.get(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to storage when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await storage.set(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };
    saveSettings();
  }, [settings]);

  return {
    settings,
    setSettings,
  };
};
