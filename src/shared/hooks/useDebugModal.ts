
/**
 * Hook for managing debug modal functionality
 */

import { useState, useCallback } from 'react';
import { ElementInfo } from '../types';
import { callAIDebugFunction } from '../api';
import { sanitizeText } from '@/utils/sanitization';

export const useDebugModal = (
  currentElement: ElementInfo | null,
  mousePosition: { x: number; y: number },
  addEvent: (event: any) => void
) => {
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeWithAI = async (prompt: string) => {
    setIsAnalyzing(true);
    try {
      const MAX_RETRIES = 2;
      let attempt = 0;
      let response: any = null;
      let lastError: any = null;
      while (attempt <= MAX_RETRIES) {
        try {
          response = await callAIDebugFunction(prompt, currentElement, mousePosition);
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
          console.error(`AI debug attempt ${attempt + 1} failed:`, error);
          if (attempt < MAX_RETRIES) {
            // Exponential backoff
            await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
          }
          attempt++;
        }
      }
      if (lastError) {
        throw lastError;
      }

      addEvent({
        type: 'llm_response',
        position: mousePosition,
        prompt: sanitizeText(prompt),
        response: sanitizeText(response),
        element: currentElement ? {
          tag: sanitizeText(currentElement.tag),
          id: sanitizeText(currentElement.id),
          classes: currentElement.classes.map(c => sanitizeText(c)),
          text: sanitizeText(currentElement.text),
        } : undefined,
      });
      setShowDebugModal(false);
      return response;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAdvancedPrompt = useCallback((): string => {
    if (!currentElement) return '';
    
    const element = currentElement.element;
    const styles = window.getComputedStyle(element);
    const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(currentElement.tag) || 
                         element.onclick !== null || 
                         styles.cursor === 'pointer';

    return `Debug this element in detail:

Element: <${currentElement.tag}${currentElement.id ? ` id="${sanitizeText(currentElement.id)}"` : ''}${currentElement.classes.length ? ` class="${currentElement.classes.map(c => sanitizeText(c)).join(' ')}"` : ''}>
Text: "${sanitizeText(currentElement.text)}"
Position: x:${mousePosition.x}, y:${mousePosition.y}
Interactive: ${isInteractive ? 'Yes' : 'No'}
Cursor: ${styles.cursor}
Display: ${styles.display}
Visibility: ${styles.visibility}
Pointer Events: ${styles.pointerEvents}

Consider:
1. Why might this element not be behaving as expected?
2. Are there any CSS properties preventing interaction?
3. Are there any event listeners that might be interfering?
4. What accessibility concerns might exist?
5. How could the user experience be improved?

Provide specific, actionable debugging steps and potential solutions.`;
  }, [currentElement, mousePosition]);

  return {
    showDebugModal,
    setShowDebugModal,
    isAnalyzing,
    analyzeWithAI,
    generateAdvancedPrompt,
  };
};
