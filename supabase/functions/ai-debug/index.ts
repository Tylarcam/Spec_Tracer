
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { prompt, element, position } = await req.json();

    // Input validation and sanitization
    if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
      throw new Error('Invalid prompt provided');
    }

    // Sanitize the element data to prevent XSS
    const sanitizedElement = element ? {
      tag: String(element.tag || '').slice(0, 50),
      id: String(element.id || '').slice(0, 100),
      classes: Array.isArray(element.classes) ? element.classes.slice(0, 10).map(c => String(c).slice(0, 50)) : [],
      text: String(element.text || '').slice(0, 200)
    } : null;

    const systemPrompt = `You are an expert web developer and debugger. Provide clear, actionable debugging advice. 
Focus on common web development issues like CSS problems, JavaScript errors, accessibility issues, layout problems, and functionality bugs.
Keep responses concise and practical.`;

    const userPrompt = `${prompt}${sanitizedElement ? `\n\nElement Context:
- Tag: ${sanitizedElement.tag}
- ID: ${sanitizedElement.id}
- Classes: ${sanitizedElement.classes.join(', ')}
- Text: "${sanitizedElement.text}"
- Position: x:${position?.x || 0}, y:${position?.y || 0}` : ''}`;

    console.log('Making OpenAI API request for debugging assistance');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('Successfully generated AI debugging response');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-debug function:', error);
    
    // Don't expose internal error details to client
    const errorMessage = error.message.includes('OpenAI API') 
      ? 'AI service temporarily unavailable' 
      : 'An error occurred processing your request';

    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
