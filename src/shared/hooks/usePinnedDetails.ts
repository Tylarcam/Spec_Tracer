import { useState, useCallback } from 'react';

interface PinnedDetail {
  id: string;
  element: any;
  position: { x: number; y: number };
  pinnedAt: { x: number; y: number };
}

export const usePinnedDetails = () => {
  const [pinnedDetails, setPinnedDetails] = useState<PinnedDetail[]>([]);

  const addPin = useCallback((element: any, position: { x: number; y: number }) => {
    if (pinnedDetails.length >= 3) return false;

    const newPin: PinnedDetail = {
      id: Math.random().toString(36).substr(2, 9),
      element,
      position,
      pinnedAt: {
        x: Math.min(position.x + 20, window.innerWidth - 320),
        y: Math.min(position.y + 20, window.innerHeight - 200),
      },
    };
    setPinnedDetails(prev => [...prev, newPin]);
    return true;
  }, [pinnedDetails.length]);

  const removePin = useCallback((pinId: string) => {
    setPinnedDetails(prev => prev.filter(pin => pin.id !== pinId));
  }, []);

  const updatePinPosition = useCallback((pinId: string, position: { x: number; y: number }) => {
    setPinnedDetails(prev => prev.map(pin => 
      pin.id === pinId ? { ...pin, pinnedAt: position } : pin
    ));
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