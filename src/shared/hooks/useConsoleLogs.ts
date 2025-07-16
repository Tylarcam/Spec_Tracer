import { useEffect, useRef, useState } from 'react';

export interface ConsoleLog {
  id: string;
  type: 'error' | 'warn';
  message: string;
  stack?: string;
  timestamp: string;
  associatedElement?: string; // optional: selector or tag for association
}

export const useConsoleLogs = (currentElementSelector?: string) => {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [associateWithElement, setAssociateWithElement] = useState(false);
  const originalError = useRef<(...args: any[]) => void>();
  const originalWarn = useRef<(...args: any[]) => void>();

  useEffect(() => {
    originalError.current = window.console.error;
    originalWarn.current = window.console.warn;

    function handleLog(type: 'error' | 'warn', ...args: any[]) {
      const message = args.map(String).join(' ');
      const stack = args.find(arg => arg instanceof Error)?.stack;
      setLogs(prev => [
        {
          id: crypto.randomUUID(),
          type,
          message,
          stack,
          timestamp: new Date().toLocaleTimeString(),
          associatedElement: associateWithElement && currentElementSelector ? currentElementSelector : undefined,
        },
        ...prev
      ].slice(0, 100));
    }

    window.console.error = (...args: any[]) => {
      handleLog('error', ...args);
      if (originalError.current) originalError.current(...args);
    };
    window.console.warn = (...args: any[]) => {
      handleLog('warn', ...args);
      if (originalWarn.current) originalWarn.current(...args);
    };
    return () => {
      if (originalError.current) window.console.error = originalError.current;
      if (originalWarn.current) window.console.warn = originalWarn.current;
    };
  }, [associateWithElement, currentElementSelector]);

  const clearLogs = () => setLogs([]);

  return {
    logs,
    clearLogs,
    associateWithElement,
    setAssociateWithElement,
  };
}; 