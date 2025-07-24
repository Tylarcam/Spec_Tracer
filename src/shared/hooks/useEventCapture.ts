
import { useState, useCallback, useRef } from 'react';
import { LogEvent } from '../types';
import { storage, STORAGE_KEYS } from '../storage';

export const useEventCapture = (maxEventCount: number, autoSaveEnabled: boolean) => {
  const [capturedEvents, setCapturedEvents] = useState<LogEvent[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const recordEvent = useCallback((eventData: Omit<LogEvent, 'id' | 'timestamp'>) => {
    const event: LogEvent = {
      ...eventData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    setCapturedEvents(prev => {
      const newEvents = [event, ...prev].slice(0, maxEventCount);
      
      // Debounced save to storage
      if (autoSaveEnabled) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          storage.set(STORAGE_KEYS.EVENTS, JSON.stringify(newEvents)).catch(error => {
            console.error('Error saving events to storage:', error);
            setStorageError('Failed to save events to storage');
          });
        }, 1000); // Debounce by 1 second
      }
      
      return newEvents;
    });
  }, [maxEventCount, autoSaveEnabled]);

  const clearCapturedEvents = useCallback(() => {
    setCapturedEvents([]);
    if (autoSaveEnabled) {
      storage.set(STORAGE_KEYS.EVENTS, JSON.stringify([])).catch(error => {
        console.error('Error clearing events from storage:', error);
        setStorageError('Failed to clear events from storage');
      });
    }
  }, [autoSaveEnabled]);

  const exportCapturedEvents = useCallback(() => {
    const dataStr = JSON.stringify(capturedEvents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `logtrace-events-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [capturedEvents]);

  const clearStorageError = useCallback(() => {
    setStorageError(null);
  }, []);

  return {
    capturedEvents,
    setCapturedEvents,
    recordEvent,
    clearCapturedEvents,
    exportCapturedEvents,
    storageError,
    clearStorageError,
  };
};
