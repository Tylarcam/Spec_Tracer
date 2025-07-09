import { useState, useCallback } from 'react';

interface DebugResponse {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export const useDebugResponses = () => {
  const [debugResponses, setDebugResponses] = useState<DebugResponse[]>([]);

  const addDebugResponse = useCallback((prompt: string, response: string) => {
    const debugResponse: DebugResponse = {
      id: Math.random().toString(36).substr(2, 9),
      prompt,
      response: response || 'No response received',
      timestamp: new Date().toISOString(),
    };
    setDebugResponses(prev => [debugResponse, ...prev]);
  }, []);

  const clearDebugResponses = useCallback(() => {
    setDebugResponses([]);
  }, []);

  return {
    debugResponses,
    addDebugResponse,
    clearDebugResponses,
  };
};