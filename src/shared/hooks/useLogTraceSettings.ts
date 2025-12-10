
/**
 * Hook for managing LogTrace configuration settings
 * Handles settings persistence and validation
 */

import { useState, useEffect, useCallback } from 'react';
import { LogTraceSettings } from '../types';
import { storage, STORAGE_KEYS } from '../storage';

const DEFAULT_SETTINGS: LogTraceSettings = {
  maxEvents: 100,
  autoSave: true,
  highlightColor: '#22c55e',
  showElementPath: true,
  enableKeyboardShortcuts: true,
  theme: 'dark',
  debugMode: false,
  learningAssistantMode: false,
};

export const useLogTraceSettings = () => {
  const [traceSettings, setTraceSettings] = useState<LogTraceSettings>(DEFAULT_SETTINGS);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setSettingsError(null);
      const savedSettings = await storage.get(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setTraceSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettingsError('Failed to load settings. Using defaults.');
      setTraceSettings(DEFAULT_SETTINGS);
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  const updateTraceSettings = useCallback(async (newSettings: Partial<LogTraceSettings>) => {
    try {
      const updatedSettings = { ...traceSettings, ...newSettings };
      setTraceSettings(updatedSettings);
      await storage.set(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      setSettingsError(null);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSettingsError('Failed to save settings.');
    }
  }, [traceSettings]);

  const clearSettingsError = useCallback(() => {
    setSettingsError(null);
  }, []);

  const retrySettingsLoad = useCallback(() => {
    setIsSettingsLoading(true);
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    traceSettings,
    updateTraceSettings,
    isSettingsLoading,
    settingsError,
    clearSettingsError,
    retrySettingsLoad,
  };
};
