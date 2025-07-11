
/**
 * Hook for managing pinned details functionality
 */

import { useState, useCallback } from 'react';
import { PinnedDetail, ElementInfo } from '../types';

export const usePinnedDetails = () => {
  const [pinnedDetails, setPinnedDetails] = useState<PinnedDetail[]>([]);

  const addPin = useCallback((element: ElementInfo, position: { x: number; y: number }) => {
    const pin: PinnedDetail = {
      id: crypto.randomUUID(),
      element,
      position,
      pinnedAt: {
        x: Math.max(0, Math.min(window.innerWidth - 320, position.x)),
        y: Math.max(0, Math.min(window.innerHeight - 200, position.y)),
      },
    };

    setPinnedDetails(prev => [...prev, pin]);
  }, []);

  const removePin = useCallback((id: string) => {
    setPinnedDetails(prev => prev.filter(pin => pin.id !== id));
  }, []);

  const updatePinPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setPinnedDetails(prev => 
      prev.map(pin => 
        pin.id === id 
          ? { ...pin, pinnedAt: position }
          : pin
      )
    );
  }, []);

  const clearAllPins = useCallback(() => {
    setPinnedDetails([]);
  }, []);

  return {
    pinnedDetails,
    addPin,
    removePin,
    updatePinPosition,
    clearAllPins,
  };
};
