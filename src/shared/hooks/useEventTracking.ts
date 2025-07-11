
/**
 * Hook for managing event tracking functionality
 */

import { useState, useCallback } from 'react';
import { LogEvent } from '../types';
import { storage, STORAGE_KEYS } from '../storage';

export const useEventTracking = (maxEvents: number, autoSave: boolean) => {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);

  const addEvent = useCallback((eventData: Omit<LogEvent, 'id' | 'timestamp'>) => {
    const event: LogEvent = {
      ...eventData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    setEvents(prev => {
      const newEvents = [event, ...prev].slice(0, maxEvents);
      return newEvents;
    });
  }, [maxEvents]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    if (autoSave) {
      storage.set(STORAGE_KEYS.EVENTS, JSON.stringify([])).catch(error => {
        console.error('Error clearing events from storage:', error);
        setStorageError('Failed to clear events from storage');
      });
    }
  }, [autoSave]);

  const exportEvents = useCallback(() => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `logtrace-events-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [events]);

  const clearStorageError = useCallback(() => {
    setStorageError(null);
  }, []);

  return {
    events,
    setEvents,
    addEvent,
    clearEvents,
    exportEvents,
    storageError,
    clearStorageError,
  };
};
