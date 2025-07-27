
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DebugRequest {
  prompt: string;
  element?: {
    tag: string;
    id: string;
    classes: string[];
    text: string;
  };
  position: { x: number; y: number };
}

// Enhanced input validation
const validateInput = (body: any): { isValid: boolean; error?: string } => {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Invalid request body' };
  }

  if (!body.prompt || typeof body.prompt !== 'string') {
    return { isValid: false, error: 'Prompt is required and must be a string' };
  }

  if (body.prompt.length > 2000) {
    return { isValid: false, error: 'Prompt too long (max 2000 characters)' };
  }

  if (body.prompt.length < 3) {
    return { isValid: false, error: 'Prompt too short (min 3 characters)' };
  }

  // Check for XSS patterns
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(body.prompt)) {
      return { isValid: false, error: 'Invalid characters detected' };
    }
  }

  return { isValid: true };
};

serve(async (req) => {
  console.log('AI Debug function called:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      );
    }

    console.log('User authenticated:', user.email);

    const body: DebugRequest = await req.json();
    console.log('Request body:', body);
    
    // Enhanced input validation
    const validation = validateInput(body);
    if (!validation.isValid) {
      console.error('Input validation failed:', validation.error);
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if user has credits
    const { data: creditData, error: creditError } = await supabase.rpc('use_credit', {
      user_uuid: user.id
    });

    if (creditError) {
      console.error('Credit check error:', creditError);
      return new Response(
        JSON.stringify({ success: false, error: 'Credit system error' }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!creditData) {
      console.log('No credits available for user:', user.email);
      return new Response(
        JSON.stringify({ success: false, error: 'No credits available' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Call OpenAI API with enhanced security
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Service temporarily unavailable' }),
        { status: 503, headers: corsHeaders }
      );
    }

    const sanitizedPrompt = body.prompt
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim();

    const contextualPrompt = `
      You are a web debugging assistant. Help analyze this web element issue:
      
      User Query: ${sanitizedPrompt}
      
      ${body.element ? `
      Element Context:
      - Tag: ${body.element.tag}
      - ID: ${body.element.id}
      - Classes: ${body.element.classes.join(', ')}
      - Text: ${body.element.text.substring(0, 200)}
      ` : ''}
      
      Mouse Position: (${body.position.x}, ${body.position.y})
      
      Provide a helpful debugging response focusing on web development best practices.
    `;

    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful web debugging assistant. Provide clear, actionable advice for web development issues. Keep responses concise but informative.'
          },
          {
            role: 'user',
            content: contextualPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: 'AI service temporarily unavailable' }),
        { status: 503, headers: corsHeaders }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'No response generated';
    
    console.log('OpenAI response received successfully');

    return new Response(
      JSON.stringify({ success: true, response: aiResponse }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
