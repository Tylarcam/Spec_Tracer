
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
    
    // Build parent path (up to 2 levels)
    let parentPath = '';
    let parent = element.parentElement;
    let levels = 0;
    while (parent && levels < 2) {
      const tag = parent.tagName.toLowerCase();
      const id = parent.id ? `#${parent.id}` : '';
      const classes = parent.className ? `.${parent.className.split(' ').join('.')}` : '';
      parentPath = `${tag}${id}${classes}` + (parentPath ? ' > ' + parentPath : '');
      parent = parent.parentElement;
      levels++;
    }

    // Extract attributes
    const attributes = Array.from(element.attributes).map(attr => ({ name: attr.name, value: attr.value }));
    // Extract size
    const size = { width: Math.round(rect.width), height: Math.round(rect.height) };

    return {
      tag: element.tagName.toLowerCase(),
      id: sanitizeText(element.id || ''),
      classes: Array.from(element.classList).map(c => sanitizeText(c)),
      text: sanitizeText(text.slice(0, 100)), // Limit text length
      element: element,
      parentPath, // Add this line
      attributes,
      size,
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
