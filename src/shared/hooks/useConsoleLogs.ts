
import { useState, useEffect, useCallback } from 'react';
import { ConsoleLog, FilteredConsoleLog } from '../types';

export const useConsoleLogs = () => {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [associateWithElement, setAssociateWithElement] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const addLog = useCallback((log: Omit<ConsoleLog, 'id'>) => {
    const newLog: ConsoleLog = {
      ...log,
      id: crypto.randomUUID(),
      level: log.type, // Ensure level is set for compatibility
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  // Filter logs to only errors and warnings for compatibility
  const getFilteredLogs = useCallback((): FilteredConsoleLog[] => {
    return logs
      .filter(log => log.type === 'error' || log.type === 'warn')
      .map(log => ({
        type: log.type as 'error' | 'warn',
        message: log.message,
        timestamp: log.timestamp,
        stack: log.stack,
        associatedElement: log.associatedElement,
      }));
  }, [logs]);

  const startCapturing = useCallback(() => {
    if (isCapturing) return;

    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    };

    const captureConsole = (level: 'log' | 'warn' | 'error' | 'info') => {
      return (...args: any[]) => {
        // Call original console method
        originalConsole[level](...args);

        // Capture for terminal display
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');

        addLog({
          type: level,
          message,
          timestamp: new Date().toISOString(),
          associatedElement: associateWithElement ? undefined : undefined,
          stack: level === 'error' ? new Error().stack : undefined,
        });
      };
    };

    // Override console methods
    console.log = captureConsole('log');
    console.warn = captureConsole('warn');
    console.error = captureConsole('error');
    console.info = captureConsole('info');

    setIsCapturing(true);

    // Return cleanup function
    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
      setIsCapturing(false);
    };
  }, [isCapturing, associateWithElement, addLog]);

  const stopCapturing = useCallback(() => {
    setIsCapturing(false);
  }, []);

  return {
    logs,
    clearLogs,
    addLog,
    getFilteredLogs,
    associateWithElement,
    setAssociateWithElement,
    isCapturing,
    startCapturing,
    stopCapturing,
  };
};
