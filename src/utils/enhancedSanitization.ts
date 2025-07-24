
import { sanitizeText } from './sanitization';

// Enhanced input validation for security
export const enhancedValidation = {
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  validatePrompt: (prompt: string): { isValid: boolean; error?: string } => {
    if (!prompt || prompt.trim().length === 0) {
      return { isValid: false, error: 'Prompt cannot be empty' };
    }

    if (prompt.length > 2000) {
      return { isValid: false, error: 'Prompt too long (max 2000 characters)' };
    }

    // Check for potential XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(prompt)) {
        return { isValid: false, error: 'Invalid characters detected' };
      }
    }

    return { isValid: true };
  },

  sanitizeUserInput: (input: string, maxLength: number = 1000): string => {
    if (!input) return '';
    
    // Remove HTML tags and limit length
    const sanitized = sanitizeText(input, maxLength);
    
    // Additional sanitization for common attack vectors
    return sanitized
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  },

  validateContextRequest: (request: string): { isValid: boolean; error?: string } => {
    if (!request || request.trim().length === 0) {
      return { isValid: false, error: 'Request cannot be empty' };
    }

    if (request.length > 1000) {
      return { isValid: false, error: 'Request too long (max 1000 characters)' };
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi,
      /(\bUNION\b|\bJOIN\b)/gi,
      /(--|\*\/|\*\*)/g,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(request)) {
        return { isValid: false, error: 'Invalid request format' };
      }
    }

    return { isValid: true };
  }
};
