
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

  // For now, return a mock response since Supabase integration needs proper setup
  if (!supabaseClient) {
    throw new Error('AI debugging requires API configuration. Please set up your OpenAI API key in the settings.');
  }

  try {
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
  } catch (error) {
    console.error('AI Debug API Error:', error);
    throw new Error('AI debugging service is currently unavailable. Please try again later.');
  }
};
