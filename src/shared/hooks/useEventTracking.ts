
/**
 * Hook for managing event tracking functionality
 */

import { useState, useCallback } from 'react';
import { LogEvent } from '../types';
import { storage, STORAGE_KEYS } from '../storage';

export const useEventTracking = (maxEvents: number, autoSave: boolean) => {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);

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
    try {
      setEvents([]);
      await storage.remove(STORAGE_KEYS.EVENTS);
      setStorageError(null);
    } catch (error) {
      console.error('Failed to clear events from storage:', error);
      setStorageError('Failed to clear saved events. Changes may not persist.');
      
      // Still clear local state even if storage fails
      setEvents([]);
    }
  };

  const exportEvents = () => {
    try {
      const dataStr = JSON.stringify(events, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `logtrace-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Failed to export events:', error);
      alert('Failed to export events. Please try again or check your browser permissions.');
    }
  };

  return {
    events,
    setEvents,
    addEvent,
    clearEvents,
    exportEvents,
    storageError,
    clearStorageError: () => setStorageError(null),
  };
};
