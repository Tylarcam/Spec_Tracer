import { sanitizeText, validatePrompt, debugRateLimiter } from '@/utils/sanitization';
import { ElementInfo } from './types';
import { supabase } from '@/integrations/supabase/client';

export const callAIDebugFunction = async (
  prompt: string,
  currentElement: ElementInfo | null,
  mousePosition: { x: number; y: number },
  useCredit?: () => Promise<boolean>
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

  // Check if user has premium subscription
  const { data: subscription } = await supabase
    .from('subscribers')
    .select('subscribed')
    .eq('user_id', user.id)
    .single();

  const isPremium = subscription?.subscribed || false;

  // If not premium, check and use credits
  if (!isPremium && useCredit) {
    const creditUsed = await useCredit();
    if (!creditUsed) {
      throw new Error('Insufficient credits. Please upgrade to continue or wait for daily reset.');
    }
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
    throw error;
  }
};

export const transformContextRequest = async (rawRequest: string) => {
  if (!rawRequest || rawRequest.trim().length === 0) {
    throw new Error('Request cannot be empty');
  }

  if (rawRequest.length > 1000) {
    throw new Error('Request too long (max 1000 characters)');
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required for context transformation features. Please sign in to continue.');
  }

  try {
    const { data, error } = await supabase.functions.invoke('context-transform', {
      body: {
        rawRequest: sanitizeText(rawRequest, 1000),
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