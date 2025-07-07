
/**
 * Hook for managing event tracking functionality
 */

import { useState, useCallback } from 'react';
import { LogEvent, ElementInfo } from '../types';
import { storage, STORAGE_KEYS } from '../storage';
import { sanitizeElementData } from '@/utils/sanitization';

export const useEventTracking = (maxEvents: number, autoSave: boolean) => {
  const [events, setEvents] = useState<LogEvent[]>([]);

  const addEvent = useCallback((event: Omit<LogEvent, 'id' | 'timestamp'>) => {
    const newEvent: LogEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
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
