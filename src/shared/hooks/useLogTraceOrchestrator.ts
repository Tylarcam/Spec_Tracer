
/**
 * Main LogTrace orchestrator hook - coordinates all LogTrace functionality
 * This is the primary hook that other components should use
 */

import { useState, useRef, useEffect } from 'react';
import { DebugContext } from '../types';
import { storage, STORAGE_KEYS } from '../storage';
import { useEventCapture } from './useEventCapture';
import { useElementDetection } from './useElementDetection';
import { useAIDebugInterface } from './useAIDebugInterface';
import { useLogTraceSettings } from './useLogTraceSettings';

export const useLogTraceOrchestrator = () => {
  const [isTraceActive, setIsTraceActive] = useState(false);
  const [showTerminalPanel, setShowTerminalPanel] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const { 
    traceSettings, 
    updateTraceSettings, 
    isSettingsLoading, 
    settingsError,
    clearSettingsError,
    retrySettingsLoad
  } = useLogTraceSettings();
  
  const {
    capturedEvents,
    setCapturedEvents,
    recordEvent,
    clearCapturedEvents,
    exportCapturedEvents,
    storageError,
    clearStorageError,
  } = useEventCapture(traceSettings.maxEvents, traceSettings.autoSave);

  const {
    cursorPosition,
    setCursorPosition,
    detectedElement,
    setDetectedElement,
    extractElementDetails,
  } = useElementDetection();

  const {
    showAIDebugModal,
    setShowAIDebugModal,
    isAIAnalyzing,
    analyzeElementWithAI,
    generateElementPrompt,
  } = useAIDebugInterface(detectedElement, cursorPosition, recordEvent);

  // Load events from storage with error handling
  useEffect(() => {
    const loadCapturedEvents = async () => {
      try {
        setLoadingError(null);
        const savedEvents = await storage.get(STORAGE_KEYS.EVENTS);
        if (savedEvents) {
          const parsed = JSON.parse(savedEvents);
          if (Array.isArray(parsed)) {
            setCapturedEvents(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading saved events:', error);
        setLoadingError('Failed to load saved events. Starting with empty history.');
        setCapturedEvents([]);
      }
    };

    if (!isSettingsLoading) {
      loadCapturedEvents();
    }
  }, [setCapturedEvents, isSettingsLoading]);

  // Save events to storage with error handling
  useEffect(() => {
    if (traceSettings.autoSave && capturedEvents.length > 0) {
      const saveCapturedEvents = async () => {
        try {
          await storage.set(STORAGE_KEYS.EVENTS, JSON.stringify(capturedEvents));
        } catch (error) {
          console.error('Error saving events:', error);
          // Error is handled by useEventCapture storageError state
        }
      };
      saveCapturedEvents();
    }
  }, [capturedEvents, traceSettings.autoSave]);

  const debugContext: DebugContext = {
    element: detectedElement,
    position: cursorPosition,
    events: capturedEvents,
    settings: traceSettings,
  };

  // Combined error state for easy checking
  const hasAnyErrors = !!(settingsError || storageError || loadingError);
  const allErrors = {
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
    // Primary State
    isTraceActive,
    setIsTraceActive,
    cursorPosition,
    setCursorPosition,
    detectedElement,
    setDetectedElement,
    showAIDebugModal,
    setShowAIDebugModal,
    showTerminalPanel,
    setShowTerminalPanel,
    capturedEvents,
    traceSettings,
    updateTraceSettings,
    isAIAnalyzing,
    
    // Loading & Error Management
    isLoading: isSettingsLoading,
    hasAnyErrors,
    allErrors,
    clearAllErrors,
    retrySettingsLoad,
    
    // Refs
    overlayRef,
    modalRef,
    
    // Core Actions
    recordEvent,
    extractElementDetails,
    analyzeElementWithAI,
    clearCapturedEvents,
    exportCapturedEvents,
    generateElementPrompt,
    
    // Context
    debugContext,
  };
};
