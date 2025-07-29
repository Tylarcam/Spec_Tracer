// Security headers utility for enhanced protection
export const securityHeaders = {
  // Content Security Policy
  getCSPHeader: (): string => {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://kepmuysqytngtqterosr.supabase.co https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  },

  // All security headers for responses
  getAllHeaders: (): Record<string, string> => {
    return {
      'Content-Security-Policy': securityHeaders.getCSPHeader(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    };
  },

  // Apply headers to fetch requests
  applyToRequest: (headers: HeadersInit = {}): HeadersInit => {
    return {
      ...headers,
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block'
    };
  }
};

// Security monitoring utilities
export const securityMonitor = {
  // Log security events
  logSecurityEvent: (event: string, details?: any) => {
    console.warn(`🔒 Security Event: ${event}`, details);
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: analytics.track('security_event', { event, details });
    }
  },

  // Check for suspicious activity
  checkSuspiciousActivity: () => {
    // Check for XSS attempts in URL
    if (window.location.href.includes('<script>') || 
        window.location.href.includes('javascript:')) {
      securityMonitor.logSecurityEvent('XSS_ATTEMPT_IN_URL', {
        url: window.location.href
      });
      return true;
    }

    // Check for suspicious localStorage content
    try {
      Object.keys(localStorage).forEach(key => {
        const value = localStorage.getItem(key);
        if (value && (value.includes('<script>') || value.includes('javascript:'))) {
          securityMonitor.logSecurityEvent('SUSPICIOUS_LOCALSTORAGE', {
            key,
            value: value.substring(0, 100) + '...'
          });
        }
      });
    } catch (e) {
      // Ignore localStorage access errors
    }

    return false;
  },

  // Initialize security monitoring
  init: () => {
    // Clear any existing sensitive data
    import('./secureStorage').then(({ secureStorage }) => {
      secureStorage.clearSensitiveData();
    });

    // Check for suspicious activity on load
    securityMonitor.checkSuspiciousActivity();

    // Monitor for suspicious DOM changes
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (element.tagName === 'SCRIPT' && !element.hasAttribute('data-allowed')) {
                  securityMonitor.logSecurityEvent('SUSPICIOUS_SCRIPT_INJECTION', {
                    script: element.outerHTML
                  });
                }
              }
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
};