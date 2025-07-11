
/**
 * Hook for managing element inspection functionality
 */

import { useState, useCallback } from 'react';
import { ElementInfo } from '../types';
import { sanitizeText } from '@/utils/sanitization';

export const useElementInspection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentElement, setCurrentElement] = useState<ElementInfo | null>(null);

  const extractElementInfo = useCallback((element: HTMLElement): ElementInfo => {
    const rect = element.getBoundingClientRect();
    const text = element.textContent || element.innerText || '';
    
    return {
      tag: element.tagName.toLowerCase(),
      id: sanitizeText(element.id || ''),
      classes: Array.from(element.classList).map(c => sanitizeText(c)),
      text: sanitizeText(text.slice(0, 100)), // Limit text length
      element: element,
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
