import { enhancedValidation } from '@/utils/enhancedSanitization';
import { debugRateLimiter } from '@/utils/sanitization';
import { SECURITY_CONFIG, SecurityValidators, apiRateLimiter } from '@/utils/securityConfig';
import { ElementInfo } from './types';
import { supabase } from '@/integrations/supabase/client';

export const callAIDebugFunction = async (
  prompt: string,
  currentElement: ElementInfo | null,
  mousePosition: { x: number; y: number }
) => {
  console.log('callAIDebugFunction called with:', { prompt, currentElement, mousePosition });
  
  // Enhanced validation for user input
  const promptValidation = enhancedValidation.validateUserInput(prompt);
  if (!promptValidation.isValid) {
    throw new Error(promptValidation.error || 'Invalid prompt format');
  }

  // Enhanced rate limiting
  if (!debugRateLimiter.isAllowed('debug-session')) {
    throw new Error('Too many requests. Please wait before trying again.');
  }

  if (!apiRateLimiter.isAllowed('api-debug', SECURITY_CONFIG.RATE_LIMITS.API_REQUESTS_PER_MINUTE, 60000)) {
    throw new Error('API rate limit exceeded. Please wait before trying again.');
  }

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Authentication error:', authError);
    throw new Error('Authentication required for AI debugging features. Please sign in to continue.');
  }

  console.log('User authenticated:', user.email);

  try {
    console.log('Calling ai-debug edge function...');
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

    console.log('Edge function response:', { data, error });

    if (error) {
      console.error('Edge function error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('AI API key invalid')) {
        throw new Error('AI service configuration error. Please contact support.');
      } else if (error.message?.includes('AI service rate limited')) {
        throw new Error('AI service is temporarily busy. Please try again in a moment.');
      } else if (error.message?.includes('Network error')) {
        throw new Error('Connection error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.message || 'Failed to get AI response');
      }
    }

    if (!data?.success) {
      console.error('AI service returned error:', data?.error);
      throw new Error(data?.error || 'AI service error');
    }

    if (!data.response) {
      console.error('AI service returned no response');
      throw new Error('AI service returned empty response');
    }

    console.log('AI response received successfully:', data.response);
    return data.response;
  } catch (error) {
    console.error('AI Debug API Error:', error);
    
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

export const transformContextRequest = async (rawRequest: string) => {
  // Enhanced validation for generated context (more lenient)
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
    console.log('Calling context-transform edge function...');
    const { data, error } = await supabase.functions.invoke('context-transform', {
      body: {
        rawRequest: rawRequest, // Don't over-sanitize generated context
      },
    });

    console.log('Context transform response:', { data, error });

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
