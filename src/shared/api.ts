
import { enhancedValidation } from '@/utils/enhancedSanitization';
import { debugRateLimiter } from '@/utils/sanitization';
import { ElementInfo } from './types';
import { supabase } from '@/integrations/supabase/client';

export const callAIDebugFunction = async (
  prompt: string,
  currentElement: ElementInfo | null,
  mousePosition: { x: number; y: number }
) => {
  // Enhanced validation
  const promptValidation = enhancedValidation.validatePrompt(prompt);
  if (!promptValidation.isValid) {
    throw new Error(promptValidation.error || 'Invalid prompt format');
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
        prompt: enhancedValidation.sanitizeUserInput(prompt, 2000),
        element: currentElement ? {
          tag: enhancedValidation.sanitizeUserInput(currentElement.tag, 50),
          id: enhancedValidation.sanitizeUserInput(currentElement.id, 100),
          classes: currentElement.classes.map(c => enhancedValidation.sanitizeUserInput(c, 50)),
          text: enhancedValidation.sanitizeUserInput(currentElement.text, 500),
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
    throw error;
  }
};

export const transformContextRequest = async (rawRequest: string) => {
  // Enhanced validation
  const requestValidation = enhancedValidation.validateContextRequest(rawRequest);
  if (!requestValidation.isValid) {
    throw new Error(requestValidation.error || 'Invalid request format');
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required for context transformation features. Please sign in to continue.');
  }

  try {
    const { data, error } = await supabase.functions.invoke('context-transform', {
      body: {
        rawRequest: enhancedValidation.sanitizeUserInput(rawRequest, 1000),
      },
    });

    if (error) {
      console.error('Context transform error:', error);
      throw new Error('Failed to transform context');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Context transformation failed');
    }

    return {
      originalRequest: data.originalRequest,
      transformedPrompt: data.transformedPrompt
    };
  } catch (error) {
    console.error('Context Transform API Error:', error);
    throw error;
  }
};
