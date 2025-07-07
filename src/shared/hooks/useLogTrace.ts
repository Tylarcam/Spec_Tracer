
/**
 * Shared LogTrace hook for both app and extension
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { LogEvent, ElementInfo, LogTraceSettings, DebugContext } from '../types';
import { storage, STORAGE_KEYS } from '../storage';
import { sanitizeText, sanitizeElementData } from '@/utils/sanitization';
import { callAIDebugFunction } from '../api';

const DEFAULT_SETTINGS: LogTraceSettings = {
  autoSave: true,
  maxEvents: 1000,
  debugMode: false,
};

export const useLogTrace = () => {
  const [isActive, setIsActive] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentElement, setCurrentElement] = useState<ElementInfo | null>(null);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [settings, setSettings] = useState<LogTraceSettings>(DEFAULT_SETTINGS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load events and settings from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedEvents, savedSettings] = await Promise.all([
          storage.get(STORAGE_KEYS.EVENTS),
          storage.get(STORAGE_KEYS.SETTINGS),
        ]);

        if (savedEvents) {
          const parsed = JSON.parse(savedEvents);
          if (Array.isArray(parsed)) {
            setEvents(parsed);
          }
        }

        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadData();
  }, []);

  // Save events to storage
  useEffect(() => {
    if (settings.autoSave) {
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

  // Save settings to storage
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

  const addEvent = useCallback((event: Omit<LogEvent, 'id' | 'timestamp'>) => {
    const newEvent: LogEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    
    setEvents(prev => {
      const updated = [newEvent, ...prev];
      // Limit events to maxEvents
      return updated.slice(0, settings.maxEvents);
    });
  }, [settings.maxEvents]);

  const extractElementInfo = useCallback((element: HTMLElement): ElementInfo => {
    const text = element.textContent?.slice(0, 50) || '';
    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || '',
      classes: Array.from(element.classList),
      text: text.length > 47 ? text + '...' : text,
      element,
    };
  }, []);

  const analyzeWithAI = async (prompt: string) => {
    setIsAnalyzing(true);
    
    try {
      const response = await callAIDebugFunction(prompt, currentElement, mousePosition);
      
      addEvent({
        type: 'llm_response',
        position: mousePosition,
        prompt: sanitizeText(prompt),
        response: sanitizeText(response),
        element: currentElement ? sanitizeElementData({
          tag: currentElement.tag,
          id: currentElement.id,
          classes: currentElement.classes,
          text: currentElement.text,
        }) : undefined,
      });
      
      setShowDebugModal(false);
    } catch (error) {
      console.error('Error calling AI debug function:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearEvents = async () => {
    setEvents([]);
    await storage.remove(STORAGE_KEYS.EVENTS);
  };

  const exportEvents = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `logtrace-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

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
    
    // Context
    debugContext,
  };
};
