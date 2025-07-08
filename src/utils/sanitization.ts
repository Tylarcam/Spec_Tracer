
/**
 * Security utilities for sanitizing user input and preventing XSS attacks
 */

export const sanitizeText = (input: string, maxLength: number = 500): string => {
  if (typeof input !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = input.slice(0, maxLength);
  return div.innerHTML;
};

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

// Rate limiting utility
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(private maxRequests: number = 5, private windowMs: number = 60000) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Filter out old requests
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

export const debugRateLimiter = new RateLimiter();
