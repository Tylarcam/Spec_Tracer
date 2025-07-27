
import { useEffect, RefObject } from 'react';

export function useRepositionWithinViewport(elementRef: RefObject<HTMLElement>) {
  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newTop = rect.top;
    let newLeft = rect.left;

    // Check if it's outside the bottom boundary
    if (rect.bottom > viewportHeight) {
      newTop = viewportHeight - rect.height;
    }

    // Check if it's outside the right boundary
    if (rect.right > viewportWidth) {
      newLeft = viewportWidth - rect.width;
    }
    
    // Check if it's outside the top boundary
    if (rect.top < 0) {
        newTop = 0;
    }

    // Check if it's outside the left boundary
    if (rect.left < 0) {
        newLeft = 0;
    }

    element.style.top = `${newTop}px`;
    element.style.left = `${newLeft}px`;

  }, [elementRef]);
}
