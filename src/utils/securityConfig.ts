// Security Configuration Constants
// This file contains security-related configuration and validation rules

export const SECURITY_CONFIG = {
  // Rate limiting configuration
  RATE_LIMITS: {
    DEBUG_REQUESTS_PER_HOUR: 100,
    AUTH_ATTEMPTS_PER_HOUR: 10,
    API_REQUESTS_PER_MINUTE: 60,
    GUEST_DEBUG_LIMIT: 3
  },

  // Input validation limits
  VALIDATION_LIMITS: {
    MAX_PROMPT_LENGTH: 2000,
    MAX_CONTEXT_LENGTH: 5000,
    MAX_USER_INPUT_LENGTH: 1000,
    MAX_EMAIL_LENGTH: 254,
    MIN_PASSWORD_LENGTH: 8
  },

  // Security patterns for input validation
  SECURITY_PATTERNS: {
    XSS_PATTERNS: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
    ],
    
    SQL_INJECTION_PATTERNS: [
      /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)[\s\S]*(\bFROM\b|\bINTO\b|\bWHERE\b)/gi,
      /(\bUNION\b|\bJOIN\b)[\s\S]*(\bSELECT\b|\bFROM\b)/gi,
      /(--|\/\*|\*\/)/g,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi
    ],

    DANGEROUS_PATTERNS: [
      /eval\s*\(/gi,
      /document\.write/gi,
      /window\.location/gi
    ]
  },

  // Allowed content types and file extensions
  ALLOWED_CONTENT: {
    IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    FILE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
  },

  // Security headers for responses
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }
};

// Security validation functions
export const SecurityValidators = {
  /**
   * Validate email format and length
   */
  validateEmail: (email: string): boolean => {
    if (!email || email.length > SECURITY_CONFIG.VALIDATION_LIMITS.MAX_EMAIL_LENGTH) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   */
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    if (password.length < SECURITY_CONFIG.VALIDATION_LIMITS.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.VALIDATION_LIMITS.MIN_PASSWORD_LENGTH} characters long`);
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?\/`~]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return { isValid: errors.length === 0, errors };
  },

  /**
   * Check for malicious patterns in user input
   */
  containsMaliciousContent: (input: string): boolean => {
    const allPatterns = [
      ...SECURITY_CONFIG.SECURITY_PATTERNS.XSS_PATTERNS,
      ...SECURITY_CONFIG.SECURITY_PATTERNS.SQL_INJECTION_PATTERNS,
      ...SECURITY_CONFIG.SECURITY_PATTERNS.DANGEROUS_PATTERNS
    ];
    
    return allPatterns.some(pattern => pattern.test(input));
  },

  /**
   * Sanitize user input by removing dangerous content
   */
  sanitizeInput: (input: string): string => {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim();
  }
};

// Rate limiting utilities
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * Check if an action is allowed based on rate limits
   */
  isAllowed(key: string, limit: number, windowMs: number = 3600000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (attempt.count >= limit) {
      return false;
    }

    attempt.count++;
    return true;
  }

  /**
   * Get remaining attempts for a key
   */
  getRemainingAttempts(key: string, limit: number): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return limit;
    return Math.max(0, limit - attempt.count);
  }

  /**
   * Reset attempts for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Create global rate limiter instances
export const authRateLimiter = new RateLimiter();
export const apiRateLimiter = new RateLimiter();