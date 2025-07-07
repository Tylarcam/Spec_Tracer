
/**
 * Hook for managing element inspection functionality
 */

import { useState, useCallback } from 'react';
import { ElementInfo } from '../types';

export const useElementInspection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentElement, setCurrentElement] = useState<ElementInfo | null>(null);

  const extractElementInfo = useCallback((element: HTMLElement): ElementInfo => {
    const text = element.textContent?.slice(0, 50) || '';
    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || '',
      classes: Array.from(element.classList),
      text: text.length > 47 ? text + '...' : text,
      element,
    };
  }, []);

  return {
    mousePosition,
    setMousePosition,
    currentElement,
    setCurrentElement,
    extractElementInfo,
  };
};
