// Security audit logging utility
interface AuditEvent {
  event: string;
  userId?: string;
  userEmail?: string;
  timestamp: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'api' | 'security' | 'data' | 'system';
}

class AuditLogger {
  private events: AuditEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  /**
   * Log a security event
   */
  log(event: Omit<AuditEvent, 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.events.push(auditEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 AUDIT [${auditEvent.severity.toUpperCase()}]:`, auditEvent);
    }

    // In production, send critical events to monitoring service
    if (process.env.NODE_ENV === 'production' && auditEvent.severity === 'critical') {
      this.sendToMonitoring(auditEvent);
    }
  }

  /**
   * Log authentication events
   */
  logAuth(event: string, userId?: string, userEmail?: string, severity: AuditEvent['severity'] = 'medium', details?: any): void {
    this.log({
      event,
      userId,
      userEmail,
      severity,
      category: 'auth',
      details
    });
  }

  /**
   * Log API usage events
   */
  logAPI(event: string, userId?: string, severity: AuditEvent['severity'] = 'low', details?: any): void {
    this.log({
      event,
      userId,
      severity,
      category: 'api',
      details
    });
  }

  /**
   * Log security events
   */
  logSecurity(event: string, severity: AuditEvent['severity'] = 'high', details?: any): void {
    this.log({
      event,
      severity,
      category: 'security',
      details
    });
  }

  /**
   * Log data access events
   */
  logData(event: string, userId?: string, severity: AuditEvent['severity'] = 'medium', details?: any): void {
    this.log({
      event,
      userId,
      severity,
      category: 'data',
      details
    });
  }

  /**
   * Get recent events for review
   */
  getRecentEvents(limit = 100): AuditEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get events by severity
   */
  getEventsBySeverity(severity: AuditEvent['severity']): AuditEvent[] {
    return this.events.filter(event => event.severity === severity);
  }

  /**
   * Get events by category
   */
  getEventsByCategory(category: AuditEvent['category']): AuditEvent[] {
    return this.events.filter(event => event.category === category);
  }

  /**
   * Send critical events to monitoring service
   */
  private sendToMonitoring(event: AuditEvent): void {
    // In a real application, this would send to a monitoring service
    // Example: Sentry, LogRocket, DataDog, etc.
    try {
      // Example implementation:
      // analytics.track('security_event', event);
      console.error('🚨 CRITICAL SECURITY EVENT:', event);
    } catch (error) {
      console.error('Failed to send audit event to monitoring:', error);
    }
  }

  /**
   * Clear old events (for privacy compliance)
   */
  clearOldEvents(olderThanDays = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    this.events = this.events.filter(event => 
      new Date(event.timestamp) > cutoffDate
    );
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();

// Common audit event helpers
export const securityEvents = {
  INVALID_INPUT: 'invalid_input_detected',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity_detected',
  UNAUTHORIZED_ACCESS: 'unauthorized_access_attempt',
  XSS_ATTEMPT: 'xss_attempt_detected',
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
  MALICIOUS_PAYLOAD: 'malicious_payload_detected',
  AUTHENTICATION_FAILURE: 'authentication_failure',
  TOKEN_MANIPULATION: 'token_manipulation_detected',
  UNUSUAL_API_USAGE: 'unusual_api_usage_pattern'
};

export const authEvents = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_SIGNUP: 'user_signup',
  PASSWORD_RESET: 'password_reset_requested',
  EMAIL_VERIFICATION: 'email_verification_sent',
  SESSION_EXPIRED: 'session_expired',
  INVALID_CREDENTIALS: 'invalid_credentials',
  ACCOUNT_LOCKED: 'account_locked'
};

export const apiEvents = {
  AI_DEBUG_REQUEST: 'ai_debug_request',
  CONTEXT_TRANSFORM: 'context_transform_request',
  CREDIT_USED: 'credit_used',
  RATE_LIMIT_HIT: 'rate_limit_hit',
  API_ERROR: 'api_error_occurred',
  INVALID_REQUEST: 'invalid_api_request'
};
