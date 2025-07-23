
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { DebugContext } from '../types';
import { storage, STORAGE_KEYS } from '../storage';
import { useEventCapture } from './useEventCapture';
import { useElementDetection } from './useElementDetection';
import { useAIDebugInterface } from './useAIDebugInterface';
import { useLogTraceSettings } from './useLogTraceSettings';

export const useLogTraceOrchestrator = () => {
  const [isTraceActive, setIsTraceActive] = useState(false);
  const [showTerminalPanel, setShowTerminalPanel] = useState(false);
  const [showAIDebugModal, setShowAIDebugModal] = useState(false);
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
    isAIAnalyzing,
    analyzeElementWithAI,
    generateElementPrompt,
  } = useAIDebugInterface(detectedElement, cursorPosition, recordEvent);

  // Stable event loading function with proper dependencies
  const loadCapturedEvents = useCallback(async () => {
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
  }, [setCapturedEvents]);

  // Load events from storage with error handling
  useEffect(() => {
    if (!isSettingsLoading) {
      loadCapturedEvents();
    }
  }, [loadCapturedEvents, isSettingsLoading]);

  // Stable save function with proper dependencies
  const saveCapturedEvents = useCallback(async () => {
    if (traceSettings.autoSave && capturedEvents.length > 0) {
      try {
        await storage.set(STORAGE_KEYS.EVENTS, JSON.stringify(capturedEvents));
      } catch (error) {
        console.error('Error saving events:', error);
        // Error is handled by useEventCapture storageError state
      }
    }
  }, [capturedEvents, traceSettings.autoSave]);

  // Save events to storage with error handling
  useEffect(() => {
    saveCapturedEvents();
  }, [saveCapturedEvents]);

  // Memoized debug context to prevent unnecessary re-renders
  const debugContext: DebugContext = useMemo(() => ({
    element: detectedElement,
    position: cursorPosition,
    events: capturedEvents,
    settings: traceSettings,
  }), [detectedElement, cursorPosition, capturedEvents, traceSettings]);

  // Combined error state for easy checking
  const hasAnyErrors = useMemo(() => 
    !!(settingsError || storageError || loadingError), 
    [settingsError, storageError, loadingError]
  );

  const allErrors = useMemo(() => ({
    settings: settingsError,
    storage: storageError,
    loading: loadingError,
  }), [settingsError, storageError, loadingError]);

  const clearAllErrors = useCallback(() => {
    clearSettingsError();
    clearStorageError();
    setLoadingError(null);
  }, [clearSettingsError, clearStorageError]);

  // Memoized return object to prevent unnecessary re-renders with all dependencies
  return useMemo(() => ({
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
  }), [
    isTraceActive,
    cursorPosition,
    setCursorPosition,
    detectedElement,
    setDetectedElement,
    showAIDebugModal,
    showTerminalPanel,
    capturedEvents,
    traceSettings,
    updateTraceSettings,
    isAIAnalyzing,
    isSettingsLoading,
    hasAnyErrors,
    allErrors,
    clearAllErrors,
    retrySettingsLoad,
    recordEvent,
    extractElementDetails,
    analyzeElementWithAI,
    clearCapturedEvents,
    exportCapturedEvents,
    generateElementPrompt,
    debugContext,
  ]);
};
