
import { sanitizeText, validatePrompt, debugRateLimiter } from '@/utils/sanitization';
import { ElementInfo } from './types';
import { supabase } from '@/integrations/supabase/client';

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

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required for AI debugging features. Please sign in to continue.');
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai-debug', {
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
  } catch (error) {
    console.error('AI Debug API Error:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      throw error;
    }
    throw new Error('AI debugging service is currently unavailable. Please try again later.');
  }
};
