
/**
 * Security utilities for input sanitization and validation
 */

// HTML entity encoding map
const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.replace(/[&<>"'/]/g, (match) => htmlEntities[match] || match);
};

/**
 * Sanitize text content for safe display
 */
export const sanitizeText = (input: string, maxLength: number = 500): string => {
  if (typeof input !== 'string') return '';
  return sanitizeHtml(input.slice(0, maxLength));
};

/**
 * Validate and sanitize element data
 */
export const sanitizeElementData = (element: any) => {
  if (!element) return null;
  
  return {
    tag: sanitizeText(String(element.tag || ''), 50),
    id: sanitizeText(String(element.id || ''), 100),
    classes: Array.isArray(element.classes) 
      ? element.classes.slice(0, 10).map((c: any) => sanitizeText(String(c), 50))
      : [],
    text: sanitizeText(String(element.text || ''), 200)
  };
};

/**
 * Validate user input for prompts
 */
export const validatePrompt = (prompt: string): boolean => {
  if (typeof prompt !== 'string') return false;
  if (prompt.length === 0 || prompt.length > 2000) return false;
  
  // Check for potentially malicious patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(prompt));
};

/**
 * Rate limiting utility
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

export const debugRateLimiter = new RateLimiter(5, 60000); // 5 requests per minute
