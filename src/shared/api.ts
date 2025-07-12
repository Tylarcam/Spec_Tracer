
import { sanitizeText, validatePrompt, debugRateLimiter, secureLog } from '@/utils/sanitization';
import { ElementInfo } from './types';
import { supabase } from '@/integrations/supabase/client';

export const callAIDebugFunction = async (
  prompt: string,
  currentElement: ElementInfo | null,
  mousePosition: { x: number; y: number }
) => {
  // Enhanced input validation
  if (!validatePrompt(prompt)) {
    secureLog('Invalid prompt format detected', { promptLength: prompt?.length }, 'warn');
    throw new Error('Invalid prompt format. Please check your input and try again.');
  }

  // Get current user for rate limiting and authorization
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    secureLog('Unauthorized API access attempt', { error: authError?.message }, 'warn');
    throw new Error('Authentication required for AI debugging features. Please sign in to continue.');
  }

  // Enhanced rate limiting with user tracking
  if (!debugRateLimiter.isAllowed('debug-session', user.id)) {
    secureLog('Rate limit exceeded', { userId: user.id }, 'warn');
    throw new Error('Too many requests. Please wait before trying again.');
  }

  try {
    // Sanitize all inputs before sending to edge function
    const sanitizedPayload = {
      prompt: sanitizeText(prompt, 2000),
      element: currentElement ? {
        tag: sanitizeText(currentElement.tag, 50),
        id: sanitizeText(currentElement.id, 100),
        classes: currentElement.classes.map(c => sanitizeText(c, 50)).slice(0, 10), // Limit classes
        text: sanitizeText(currentElement.text, 500),
      } : null,
      position: {
        x: Math.max(0, Math.min(10000, mousePosition.x)), // Clamp coordinates
        y: Math.max(0, Math.min(10000, mousePosition.y))
      },
      userId: user.id, // Include user ID for server-side validation
    };

    const { data, error } = await supabase.functions.invoke('ai-debug', {
      body: sanitizedPayload,
    });

    if (error) {
      secureLog('Edge function error', { error: error.message, userId: user.id }, 'error');
      throw new Error('AI debugging service encountered an error. Please try again.');
    }

    if (!data?.success) {
      secureLog('AI service error', { error: data?.error, userId: user.id }, 'error');
      throw new Error(data?.error || 'AI service error. Please try again.');
    }

    secureLog('Successful AI debug request', { userId: user.id, responseLength: data.response?.length });
    return data.response;
  } catch (error) {
    secureLog('AI Debug API Error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id 
    }, 'error');
    
    if (error instanceof Error && error.message.includes('Authentication required')) {
      throw error;
    }
    throw new Error('AI debugging service is currently unavailable. Please try again later.');
  }
};

// Add a secure health check function
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.functions.invoke('ai-debug', {
      body: { healthCheck: true, userId: user.id },
    });

    return !error;
  } catch {
    return false;
  }
};
