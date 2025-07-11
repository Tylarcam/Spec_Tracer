
/**
 * Hook for managing event tracking functionality
 */

import { useState, useCallback } from 'react';
import { LogEvent } from '../types';
import { storage, STORAGE_KEYS } from '../storage';

export const useEventTracking = (maxEvents: number, autoSave: boolean) => {
  const [events, setEvents] = useState<LogEvent[]>([]);

  const addEvent = useCallback((event: Omit<LogEvent, 'id' | 'timestamp'>) => {
    // Generate a secure UUID using crypto.randomUUID() or fallback
    const generateId = (): string => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      // Fallback for environments without crypto.randomUUID
      // More secure than Math.random() and uses substring instead of deprecated substr
      return 'id_' + Date.now().toString(36) + '_' + 
        Math.random().toString(36).substring(2, 15) + 
        Math.random().toString(36).substring(2, 15);
    };

    const newEvent: LogEvent = {
      ...event,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    
    setEvents(prev => {
      const updated = [newEvent, ...prev];
      return updated.slice(0, maxEvents);
    });
  }, [maxEvents]);

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

  return {
    events,
    setEvents,
    addEvent,
    clearEvents,
    exportEvents,
  };
};
