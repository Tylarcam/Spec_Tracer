
/**
 * Refactored main LogTrace hook that composes smaller hooks
 */

import { useState, useRef, useEffect } from 'react';
import { DebugContext } from '../types';
import { storage, STORAGE_KEYS } from '../storage';
import { useEventTracking } from './useEventTracking';
import { useElementInspection } from './useElementInspection';
import { useDebugModal } from './useDebugModal';
import { useSettings } from './useSettings';

export const useLogTrace = () => {
  const [isActive, setIsActive] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const { settings, setSettings } = useSettings();
  
  const {
    events,
    setEvents,
    addEvent,
    clearEvents,
    exportEvents,
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
  } = useDebugModal(currentElement, mousePosition, addEvent);

  // Load events from storage
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const savedEvents = await storage.get(STORAGE_KEYS.EVENTS);
        if (savedEvents) {
          const parsed = JSON.parse(savedEvents);
          if (Array.isArray(parsed)) {
            setEvents(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading saved events:', error);
      }
    };

    loadEvents();
  }, [setEvents]);

  // Save events to storage
  useEffect(() => {
    if (settings.autoSave && events.length > 0) {
      const saveEvents = async () => {
        try {
          await storage.set(STORAGE_KEYS.EVENTS, JSON.stringify(events));
        } catch (error) {
          console.error('Error saving events:', error);
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
