
/**
 * Utilities for sanitizing user input and preventing XSS
 */

// Rate limiting for debug operations
class RateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests = 10;
  private windowMs = 60000; // 1 minute

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const keyRequests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    while (keyRequests.length > 0 && keyRequests[0] < windowStart) {
      keyRequests.shift();
    }
    
    if (keyRequests.length >= this.maxRequests) {
      return false;
    }
    
    keyRequests.push(now);
    return true;
  }
}

export const debugRateLimiter = new RateLimiter();

export const sanitizeText = (text: string, maxLength = 500): string => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, maxLength);
};

export const validatePrompt = (prompt: string): boolean => {
  if (!prompt || typeof prompt !== 'string') return false;
  if (prompt.length < 5 || prompt.length > 2000) return false;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /<script/i,
    /eval\(/i,
    /function\s*\(/i,
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(prompt));
};
