import { useState, useEffect } from 'react';

export const useDraggable = (
  elementRef: React.RefObject<HTMLElement>,
  initialPosition: { x: number; y: number },
  isDraggable: boolean
) => {
  const [adjustedPosition, setAdjustedPosition] = useState(initialPosition);

  useEffect(() => {
    if (!isDraggable) {
      setAdjustedPosition(initialPosition);
      return;
    }

    // Simple position adjustment to keep element within viewport
    const adjustPosition = (pos: { x: number; y: number }) => {
      const padding = 20;
      const maxX = window.innerWidth - 400 - padding; // Assuming 400px width
      const maxY = window.innerHeight - 300 - padding; // Assuming 300px height
      
      return {
        x: Math.max(padding, Math.min(pos.x, maxX)),
        y: Math.max(padding, Math.min(pos.y, maxY))
      };
    };

    setAdjustedPosition(adjustPosition(initialPosition));
  }, [initialPosition, isDraggable]);

  return { adjustedPosition };
};
