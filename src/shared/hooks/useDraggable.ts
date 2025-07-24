
import { useState, useEffect, RefObject } from 'react';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (
  ref: RefObject<HTMLElement>,
  initialPosition: Position,
  isDraggable: boolean = false
) => {
  const [adjustedPosition, setAdjustedPosition] = useState<Position>(initialPosition);

  useEffect(() => {
    if (!isDraggable || !ref.current) {
      setAdjustedPosition(initialPosition);
      return;
    }

    const element = ref.current;
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = initialPosition.x;
    let adjustedY = initialPosition.y;

    // Adjust X position if element would go off-screen
    if (adjustedX + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 10;
    }
    if (adjustedX < 0) {
      adjustedX = 10;
    }

    // Adjust Y position if element would go off-screen
    if (adjustedY + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 10;
    }
    if (adjustedY < 0) {
      adjustedY = 10;
    }

    setAdjustedPosition({ x: adjustedX, y: adjustedY });
  }, [initialPosition, isDraggable, ref]);

  return { adjustedPosition };
};
