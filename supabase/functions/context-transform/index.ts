
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
}

interface TransformRequest {
  rawRequest: string;
}

// Enhanced input validation for generated context
const validateInput = (body: any): { isValid: boolean; error?: string } => {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Invalid request body' };
  }

  if (!body.rawRequest || typeof body.rawRequest !== 'string') {
    return { isValid: false, error: 'Raw request is required and must be a string' };
  }

  if (body.rawRequest.length > 5000) { // Increased limit for generated context
    return { isValid: false, error: 'Request too long (max 5000 characters)' };
  }

  if (body.rawRequest.length < 3) {
    return { isValid: false, error: 'Request too short (min 3 characters)' };
  }

  // Only check for obvious security threats, not HTML element content
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /eval\s*\(/gi,
    /document\.write/gi,
    /window\.location/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(body.rawRequest)) {
      return { isValid: false, error: 'Invalid content detected' };
    }
  }

  return { isValid: true };
};

serve(async (req) => {
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
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const body: TransformRequest = await req.json();
    
    // Enhanced input validation
    const validation = validateInput(body);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Sanitize the input (preserve HTML element information)
    const sanitizedRequest = body.rawRequest
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();

    // Simple transformation logic - you can enhance this
    const transformedPrompt = `
      Context Engineering Request:
      
      Original Request: ${sanitizedRequest}
      
      Transformed for debugging context:
      - Focus on web development debugging
      - Provide actionable insights
      - Consider element hierarchy and interaction patterns
      - Suggest best practices for resolution
    `;

    return new Response(
      JSON.stringify({ 
        success: true, 
        originalRequest: sanitizedRequest,
        transformedPrompt: transformedPrompt
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Context transform error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
