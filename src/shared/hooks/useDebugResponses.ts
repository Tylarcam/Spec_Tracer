
/**
 * Hook for managing debug responses from AI
 */

import { useState, useCallback } from 'react';

export interface DebugResponse {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export const useDebugResponses = () => {
  const [debugResponses, setDebugResponses] = useState<DebugResponse[]>([]);

  const addDebugResponse = useCallback((prompt: string, response: string) => {
    const debugResponse: DebugResponse = {
      id: crypto.randomUUID(),
      prompt,
      response,
      timestamp: new Date().toISOString(),
    };

    setDebugResponses(prev => [debugResponse, ...prev].slice(0, 50)); // Keep last 50 responses
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
