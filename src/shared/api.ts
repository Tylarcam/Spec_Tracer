
/**
 * Shared API utilities for LogTrace
 */

import { sanitizeText, validatePrompt, debugRateLimiter } from '@/utils/sanitization';
import { ElementInfo } from './types';

// Supabase client - only available in main app context
let supabaseClient: any = null;

export const initializeSupabase = (client: any) => {
  supabaseClient = client;
};

export const callAIDebugFunction = async (
  prompt: string,
  currentElement: ElementInfo | null,
  mousePosition: { x: number; y: number }
) => {
  if (!validatePrompt(prompt)) {
    throw new Error('Invalid prompt format');
  }

  if (!debugRateLimiter.isAllowed('debug-session')) {
    throw new Error('Too many requests. Please wait before trying again.');
  }

  // If we have Supabase client, use it
  if (supabaseClient) {
    const { data, error } = await supabaseClient.functions.invoke('ai-debug', {
      body: {
        prompt: sanitizeText(prompt, 2000),
        element: currentElement ? {
          tag: sanitizeText(currentElement.tag),
          id: sanitizeText(currentElement.id),
          classes: currentElement.classes.map(c => sanitizeText(c)),
          text: sanitizeText(currentElement.text),
        } : null,
        position: mousePosition,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error('Failed to get AI response');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'AI service error');
    }

    return data.response;
  } else {
    // Fallback for extension context - direct API call
    throw new Error('AI debugging requires Supabase connection');
  }
};
