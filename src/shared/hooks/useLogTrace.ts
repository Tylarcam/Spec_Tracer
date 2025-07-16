
/**
 * Main LogTrace hook that composes smaller hooks
 */

import { useState, useRef, useEffect } from 'react';
import { DebugContext } from '../types';
import { storage, STORAGE_KEYS } from '../storage';
import { useEventTracking } from './useEventTracking';
import { useElementInspection } from './useElementInspection';
import { useDebugModal } from './useDebugModal';
import { useSettings } from './useSettings';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';

export const useLogTrace = () => {
  const [isActive, setIsActive] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Get credit system
  const { useCredit } = useCreditsSystem();

  const { 
    settings, 
    setSettings, 
    isLoading: settingsLoading, 
    error: settingsError,
    clearError: clearSettingsError,
    retryLoad: retrySettingsLoad
  } = useSettings();
  
  const {
    events,
    setEvents,
    addEvent,
    clearEvents,
    exportEvents,
    storageError,
    clearStorageError,
  } = useEventTracking(settings.maxEvents, settings.autoSave);

  const {
    mousePosition,
    setMousePosition,
    currentElement,
    setCurrentElement,
    extractElementInfo,
  } = useElementInspection();

  const {
    showDebugModal,
    setShowDebugModal,
    isAnalyzing,
    analyzeWithAI,
    generateAdvancedPrompt,
  } = useDebugModal(currentElement, mousePosition, addEvent, useCredit);

  // Load events from storage with error handling
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoadingError(null);
        const savedEvents = await storage.get(STORAGE_KEYS.EVENTS);
        if (savedEvents) {
          const parsed = JSON.parse(savedEvents);
          if (Array.isArray(parsed)) {
            setEvents(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading saved events:', error);
        setLoadingError('Failed to load saved events. Starting with empty history.');
        setEvents([]);
      }
    };

    if (!settingsLoading) {
      loadEvents();
    }
  }, [setEvents, settingsLoading]);

  // Save events to storage with error handling
  useEffect(() => {
    if (settings.autoSave && events.length > 0) {
      const saveEvents = async () => {
        try {
          await storage.set(STORAGE_KEYS.EVENTS, JSON.stringify(events));
        } catch (error) {
          console.error('Error saving events:', error);
          // Error is handled by useEventTracking storageError state
        }
      };
      saveEvents();
    }
  }, [events, settings.autoSave]);

  const debugContext: DebugContext = {
    element: currentElement,
    position: mousePosition,
    events,
    settings,
  };

  // Combined error state for easy checking
  const hasErrors = !!(settingsError || storageError || loadingError);
  const errors = {
    settings: settingsError,
    storage: storageError,
    loading: loadingError,
  };

  const clearAllErrors = () => {
    clearSettingsError();
    clearStorageError();
    setLoadingError(null);
  };

  return {
    // State
    isActive,
    setIsActive,
    mousePosition,
    setMousePosition,
    currentElement,
    setCurrentElement,
    showDebugModal,
    setShowDebugModal,
    showTerminal,
    setShowTerminal,
    events,
    settings,
    setSettings,
    isAnalyzing,
    
    // Loading & Error states
    isLoading: settingsLoading,
    hasErrors,
    errors,
    clearAllErrors,
    retrySettingsLoad,
    
    // Refs
    overlayRef,
    modalRef,
    
    // Methods
    addEvent,
    extractElementInfo,
    analyzeWithAI,
    clearEvents,
    exportEvents,
    generateAdvancedPrompt,
    
    // Context
    debugContext,
  };
};
