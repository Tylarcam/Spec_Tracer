
/**
 * Hook for AI-powered element debugging functionality
 * Handles AI analysis requests and debug modal management
 */

import { useState, useCallback } from 'react';
import { ElementInfo } from '../types';
import { callAIDebugFunction } from '../api';
import { sanitizeText } from '@/utils/sanitization';
import { useNotification } from '@/hooks/useNotification';

export const useAIDebugInterface = (
  detectedElement: ElementInfo | null,
  cursorPosition: { x: number; y: number },
  recordEvent: (event: any) => void
) => {
  const [showAIDebugModal, setShowAIDebugModal] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const { error: notifyError } = useNotification();

  const analyzeElementWithAI = async (prompt: string) => {
    setIsAIAnalyzing(true);
    try {
      const MAX_RETRIES = 2;
      let attempt = 0;
      let response: any = null;
      let lastError: any = null;
      
      while (attempt <= MAX_RETRIES) {
        try {
          console.log(`AI Debug attempt ${attempt + 1}:`, { prompt, element: detectedElement });
          response = await callAIDebugFunction(prompt, detectedElement, cursorPosition);
          console.log('AI Debug response received:', response);
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
          console.error(`AI debug attempt ${attempt + 1} failed:`, error);
          
          // Don't retry on authentication or validation errors
          if (error instanceof Error && (
            error.message.includes('Authentication required') ||
            error.message.includes('Invalid prompt format') ||
            error.message.includes('AI service configuration error')
          )) {
            break;
          }
          
          if (attempt < MAX_RETRIES) {
            // Exponential backoff
            await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
          }
          attempt++;
        }
      }
      
      if (lastError) {
        // Show user-friendly error notification
        notifyError({
          title: 'AI Debug Error',
          description: lastError.message || 'An unexpected error occurred'
        });
        throw lastError;
      }

      // Record the successful AI response
      recordEvent({
        type: 'llm_response',
        position: cursorPosition,
        prompt: sanitizeText(prompt),
        response: sanitizeText(response),
        element: detectedElement ? {
          tag: sanitizeText(detectedElement.tag),
          id: sanitizeText(detectedElement.id),
          classes: detectedElement.classes.map(c => sanitizeText(c)),
          text: sanitizeText(detectedElement.text),
        } : undefined,
      });
      
      setShowAIDebugModal(false);
      return response;
    } catch (error) {
      console.error('AI Debug Error:', error);
      throw error;
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  const generateElementPrompt = useCallback((): string => {
    if (!detectedElement) return '';
    
    const element = detectedElement.element;
    const styles = window.getComputedStyle(element);
    const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(detectedElement.tag) || 
                         element.onclick !== null || 
                         styles.cursor === 'pointer';

    return `Debug this element in detail:

Element: <${detectedElement.tag}${detectedElement.id ? ` id="${sanitizeText(detectedElement.id)}"` : ''}${detectedElement.classes.length ? ` class="${detectedElement.classes.map(c => sanitizeText(c)).join(' ')}"` : ''}>
Text: "${sanitizeText(detectedElement.text)}"
Position: x:${cursorPosition.x}, y:${cursorPosition.y}
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
  }, [detectedElement, cursorPosition]);

  return {
    showAIDebugModal,
    setShowAIDebugModal,
    isAIAnalyzing,
    analyzeElementWithAI,
    generateElementPrompt,
  };
};
