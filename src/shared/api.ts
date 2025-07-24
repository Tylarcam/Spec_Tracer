
import { enhancedValidation } from '@/utils/enhancedSanitization';
import { debugRateLimiter } from '@/utils/sanitization';
import { ElementInfo } from './types';
import { supabase } from '@/integrations/supabase/client';

export const callAIDebugFunction = async (
  prompt: string,
  currentElement: ElementInfo | null,
  mousePosition: { x: number; y: number }
) => {
  console.log('callAIDebugFunction called with:', { prompt, currentElement, mousePosition });
  
  // Enhanced validation
  const promptValidation = enhancedValidation.validatePrompt(prompt);
  if (!promptValidation.isValid) {
    throw new Error(promptValidation.error || 'Invalid prompt format');
  }

  if (!debugRateLimiter.isAllowed('debug-session')) {
    throw new Error('Too many requests. Please wait before trying again.');
  }

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('Auth error:', authError);
    throw new Error('Authentication error. Please sign in again.');
  }
  
  if (!user) {
    throw new Error('Authentication required for AI debugging features. Please sign in to continue.');
  }

  console.log('User authenticated:', user.id);

  try {
    const requestBody = {
      prompt: enhancedValidation.sanitizeUserInput(prompt, 2000),
      element: currentElement ? {
        tag: enhancedValidation.sanitizeUserInput(currentElement.tag, 50),
        id: enhancedValidation.sanitizeUserInput(currentElement.id, 100),
        classes: currentElement.classes.map(c => enhancedValidation.sanitizeUserInput(c, 50)),
        text: enhancedValidation.sanitizeUserInput(currentElement.text, 500),
      } : null,
      position: mousePosition,
    };

    console.log('Sending request to ai-debug function:', requestBody);

    const { data, error } = await supabase.functions.invoke('ai-debug', {
      body: requestBody,
    });

    console.log('ai-debug response:', { data, error });

    if (error) {
      console.error('Edge function error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('No credits available')) {
        throw new Error('No credits available. Please upgrade to continue using AI debugging.');
      } else if (error.message?.includes('Invalid authentication')) {
        throw new Error('Authentication failed. Please sign in again.');
      } else {
        throw new Error(`AI service error: ${error.message}`);
      }
    }

    if (!data?.success) {
      const errorMessage = data?.error || 'AI service error';
      
      // Handle specific error cases from the response
      if (errorMessage.includes('No credits available')) {
        throw new Error('No credits available. Please upgrade to continue using AI debugging.');
      } else if (errorMessage.includes('Invalid authentication')) {
        throw new Error('Authentication failed. Please sign in again.');
      } else {
        throw new Error(errorMessage);
      }
    }

    console.log('AI debug response received:', data.response);
    return data.response;
  } catch (error) {
    console.error('AI Debug API Error:', error);
    
    // Re-throw the error with better context
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred while debugging.');
    }
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
