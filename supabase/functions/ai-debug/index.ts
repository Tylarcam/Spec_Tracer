
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders, ...securityHeaders } });
  }

  try {
    // Verify request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 
            'Content-Type': 'application/json', 
            ...corsHeaders, 
            ...securityHeaders 
          } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json', 
            ...corsHeaders, 
            ...securityHeaders 
          } 
        }
      );
    }

    const { prompt, element, position, userId, healthCheck } = await req.json();

    // Handle health check requests
    if (healthCheck) {
      return new Response(
        JSON.stringify({ success: true, status: 'healthy' }),
        { 
          headers: { 
            'Content-Type': 'application/json', 
            ...corsHeaders, 
            ...securityHeaders 
          } 
        }
      );
    }

    // Validate user ID matches authenticated user
    if (userId !== user.id) {
      console.log('User ID mismatch:', { provided: userId, authenticated: user.id });
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid user context' }),
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'application/json', 
            ...corsHeaders, 
            ...securityHeaders 
          } 
        }
      );
    }

    // Enhanced input validation
    if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid prompt' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json', 
            ...corsHeaders, 
            ...securityHeaders 
          } 
        }
      );
    }

    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment');
      return new Response(
        JSON.stringify({ success: false, error: 'Service configuration error' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json', 
            ...corsHeaders, 
            ...securityHeaders 
          } 
        }
      );
    }

    // Build context for AI
    let context = `You are LogTrace AI, a debugging assistant. User prompt: ${prompt}`;
    
    if (element) {
      context += `\n\nElement context:
- Tag: ${element.tag}
- ID: ${element.id || 'none'}
- Classes: ${element.classes?.join(', ') || 'none'}
- Text: ${element.text || 'none'}`;
    }

    if (position) {
      context += `\n\nMouse position: x=${position.x}, y=${position.y}`;
    }

    // Call OpenAI API with enhanced error handling
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are LogTrace AI, a helpful debugging assistant. Provide concise, actionable debugging advice. Keep responses under 500 characters.'
          },
          {
            role: 'user',
            content: context
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
        user: user.id, // Include user ID for OpenAI's safety systems
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI service temporarily unavailable' }),
        { 
          status: 503, 
          headers: { 
            'Content-Type': 'application/json', 
            ...corsHeaders, 
            ...securityHeaders 
          } 
        }
      );
    }

    const aiData = await openaiResponse.json();
    const aiResponse = aiData.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ success: false, error: 'No response from AI service' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json', 
            ...corsHeaders, 
            ...securityHeaders 
          } 
        }
      );
    }

    // Log successful request (without sensitive data)
    console.log('AI debug request processed successfully', { 
      userId: user.id, 
      promptLength: prompt.length,
      responseLength: aiResponse.length 
    });

    return new Response(
      JSON.stringify({ success: true, response: aiResponse }),
      { 
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders, 
          ...securityHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error in ai-debug function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders, 
          ...securityHeaders 
        } 
      }
    );
  }
});
