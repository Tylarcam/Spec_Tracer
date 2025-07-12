
import DOMPurify from 'dompurify';

// Enhanced sanitization with XSS protection
export const sanitizeText = (input: string, maxLength?: number): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags and encode special characters
  let sanitized = input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();

  // Apply length limit if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

// Sanitize HTML content using DOMPurify
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
};

// Enhanced prompt validation with stricter checks
export const validatePrompt = (prompt: string): boolean => {
  if (!prompt || typeof prompt !== 'string') return false;
  
  const trimmed = prompt.trim();
  if (trimmed.length === 0 || trimmed.length > 2000) return false;
  
  // Check for potentially malicious patterns
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /Function\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i,
  ];
  
  return !maliciousPatterns.some(pattern => pattern.test(trimmed));
};

// Rate limiter with per-user tracking
class EnhancedRateLimiter {
  private requests: Map<string, { count: number; resetTime: number; userId?: string }> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly maxRequestsPerUser: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100, maxRequestsPerUser: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.maxRequestsPerUser = maxRequestsPerUser;
  }

  isAllowed(key: string, userId?: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(key);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.requests.delete(key);
    }

    const currentEntry = this.requests.get(key);
    
    if (!currentEntry) {
      this.requests.set(key, { count: 1, resetTime: now + this.windowMs, userId });
      return true;
    }

    // Check global rate limit
    if (currentEntry.count >= this.maxRequests) {
      return false;
    }

    // Check per-user rate limit if userId is provided
    if (userId && currentEntry.count >= this.maxRequestsPerUser) {
      return false;
    }

    currentEntry.count++;
    return true;
  }

  getRemainingRequests(key: string): number {
    const entry = this.requests.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }
}

export const debugRateLimiter = new EnhancedRateLimiter(60000, 50, 5); // 5 requests per user per minute
export const inspectionRateLimiter = new EnhancedRateLimiter(10000, 100, 20); // 20 requests per user per 10 seconds

// Input validation for different types
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Secure logging function that doesn't expose sensitive data
export const secureLog = (message: string, data?: any, level: 'info' | 'warn' | 'error' = 'info') => {
  const sanitizedData = data ? JSON.parse(JSON.stringify(data, (key, value) => {
    // Remove sensitive fields
    if (['password', 'token', 'apiKey', 'secret', 'key'].some(sensitive => 
      key.toLowerCase().includes(sensitive))) {
      return '[REDACTED]';
    }
    return value;
  })) : undefined;

  console[level](`[LogTrace Security] ${message}`, sanitizedData);
};
