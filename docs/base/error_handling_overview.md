# Error Handling & Edge Cases Overview

## Table of Contents
1. [Global Error Handling](#global-error-handling)
2. [Network & API Error Handling](#network--api-error-handling)
3. [Data Validation & Sanitization](#data-validation--sanitization)
4. [Storage Error Handling](#storage-error-handling)
5. [Authentication Error Handling](#authentication-error-handling)
6. [UI/UX Error Handling](#uiux-error-handling)
7. [Extension-Specific Error Handling](#extension-specific-error-handling)
8. [Error Prevention Strategies](#error-prevention-strategies)
9. [Error Recovery Mechanisms](#error-recovery-mechanisms)
10. [Monitoring & Logging](#monitoring--logging)

---

## Global Error Handling

### ErrorBoundary Component
- **Location**: `src/components/ErrorBoundary.tsx`
- **Purpose**: Catches React component errors and prevents app crashes
- **Features**:
  - Catches JavaScript errors in child components
  - Logs errors to console for debugging
  - Displays user-friendly error UI with reload option
  - Supports custom fallback components
- **Error States**: `hasError`, `error`

### App-Level Error Wrapping
- **Location**: `src/App.tsx`
- **Implementation**: Wraps entire app in `ErrorBoundary`
- **Additional Protection**: React Query error handling with retry logic

---

## Network & API Error Handling

### AI Debug API (`useDebugModal`)
- **Location**: `src/shared/hooks/useDebugModal.ts`
- **Retry Strategy**: 
  - Maximum 2 retries with exponential backoff
  - 1s, 2s delays between attempts
- **Error Types Handled**:
  - Network failures
  - API timeouts
  - Invalid responses
  - Authentication errors
- **Fallback**: Graceful degradation with user notification

### Supabase Edge Functions
- **Location**: `src/shared/api.ts`
- **Error Handling**:
  - Authentication validation
  - Input sanitization
  - Rate limiting checks
  - Response validation
- **Error Propagation**: Structured error messages to UI

### Context Transform API
- **Location**: `src/shared/api.ts`
- **Validation**:
  - Empty request checks
  - Length limits (1000 chars)
  - Authentication requirements
- **Fallback**: Mock mode when API unavailable

---

## Data Validation & Sanitization

### Input Sanitization (`sanitization.ts`)
- **Location**: `src/utils/sanitization.ts`
- **Functions**:
  - `sanitizeText()`: Removes HTML tags, event handlers, limits length
  - `validatePrompt()`: Checks for suspicious patterns, length limits
- **Security Measures**:
  - XSS prevention
  - JavaScript injection blocking
  - Length restrictions
  - Pattern validation

### Rate Limiting
- **Implementation**: `RateLimiter` class
- **Limits**: 10 requests per minute per session
- **Purpose**: Prevents API abuse and ensures fair usage

### Element Data Validation
- **Location**: `src/shared/hooks/useElementInspection.ts`
- **Validation**:
  - Text length limits (100 chars)
  - Class name sanitization
  - ID sanitization
  - Parent path construction safety

---

## Storage Error Handling

### LocalStorage Operations (`storage.ts`)
- **Location**: `src/shared/storage.ts`
- **Error Handling**:
  - Try-catch for all operations
  - Graceful fallbacks for storage failures
  - Error logging for debugging
- **Operations**: get, set, remove, clear

### Settings Management (`useSettings.ts`)
- **Retry Mechanism**: Up to 2 retries with exponential backoff
- **Fallback**: Default settings when storage fails
- **Error States**: Loading errors, save errors
- **Recovery**: Automatic retry after 2 seconds

### Event Tracking (`useEventTracking.ts`)
- **Storage Errors**: Separate error state for event storage
- **Fallback**: Continue operation even if storage fails
- **Error Clearing**: User-initiated error clearing

---

## Authentication Error Handling

### AuthContext (`AuthContext.tsx`)
- **Error Types**:
  - Sign up failures
  - Sign in failures
  - GitHub OAuth errors
  - Session management errors
- **User Feedback**: Toast notifications for all auth errors
- **Recovery**: Automatic session restoration

### Extension Authentication (`useExtensionAuth.ts`)
- **Guest Mode**: Fallback for unauthenticated users
- **Error Propagation**: PostMessage to parent window
- **State Management**: Loading states, error states
- **Recovery**: Automatic retry mechanisms

### Auth Page Error Handling
- **Location**: `src/pages/Auth.tsx`
- **Extension Flow**: Special error handling for extension auth
- **Error Communication**: PostMessage to extension
- **User Feedback**: Form-level error display

---

## UI/UX Error Handling

### Toast Notifications
- **System**: `useToast` hook throughout app
- **Error Types**: destructive, default, success variants
- **User Feedback**: Clear, actionable error messages

### Loading States
- **Implementation**: Loading spinners, disabled buttons
- **User Experience**: Prevents double-submissions
- **Error Recovery**: Automatic state reset

### Form Validation
- **Client-side**: Real-time validation
- **Server-side**: API response validation
- **User Feedback**: Inline error messages

---

## Extension-Specific Error Handling

### Extension Auth Modal
- **Error Communication**: PostMessage to parent
- **Fallback Modes**: Guest mode with limited functionality
- **Error Recovery**: Automatic retry and fallback

### Extension API Calls
- **Error Handling**: Similar to main app but with extension context
- **User Feedback**: Extension-specific toast system
- **Recovery**: Graceful degradation to demo mode

### Cross-Origin Communication
- **PostMessage Safety**: Origin validation
- **Error Propagation**: Structured error messages
- **Fallback**: Local error handling when communication fails

---

## Error Prevention Strategies

### Input Validation
- **Client-side**: Real-time validation
- **Server-side**: API validation
- **Sanitization**: XSS prevention
- **Length Limits**: Prevent oversized requests

### State Management
- **Immutable Updates**: Prevent state corruption
- **Error Boundaries**: Isolate component failures
- **Loading States**: Prevent race conditions

### Network Resilience
- **Retry Logic**: Exponential backoff
- **Timeout Handling**: Prevent hanging requests
- **Offline Support**: Graceful degradation

---

## Error Recovery Mechanisms

### Automatic Recovery
- **Settings**: Retry with exponential backoff
- **Storage**: Fallback to defaults
- **Network**: Retry with backoff
- **Auth**: Session restoration

### Manual Recovery
- **Error Boundaries**: Reload page option
- **Settings**: Retry buttons
- **Storage**: Clear and retry options
- **Auth**: Re-authentication flows

### Graceful Degradation
- **Demo Mode**: When API unavailable
- **Guest Mode**: Limited functionality
- **Offline Mode**: Local-only features
- **Fallback UI**: Error states with recovery options

---

## Monitoring & Logging

### Console Logging
- **Error Tracking**: `useConsoleLogs` hook
- **Error Association**: Link errors to specific elements
- **Error History**: Maintain error logs for debugging

### Error Reporting
- **Console Errors**: Automatic capture and display
- **User Actions**: Track error-triggering actions
- **Performance**: Monitor error frequency

### Debug Information
- **Error Context**: Element information, user actions
- **Stack Traces**: Full error details for debugging
- **State Snapshots**: Application state at error time

---

## Best Practices Implemented

### 1. **Defensive Programming**
- Always validate inputs
- Handle null/undefined values
- Use try-catch blocks for async operations

### 2. **User Experience**
- Clear error messages
- Recovery options
- Loading states
- Graceful degradation

### 3. **Security**
- Input sanitization
- XSS prevention
- Rate limiting
- Authentication validation

### 4. **Reliability**
- Retry mechanisms
- Fallback strategies
- Error isolation
- State recovery

### 5. **Monitoring**
- Error logging
- Performance tracking
- User feedback
- Debug information

---

## Common Error Scenarios & Solutions

| Error Type | Location | Solution |
|------------|----------|----------|
| Network Timeout | API calls | Retry with backoff |
| Storage Full | LocalStorage | Graceful degradation |
| Invalid Input | Forms | Real-time validation |
| Auth Expired | AuthContext | Session refresh |
| API Rate Limit | RateLimiter | User notification |
| XSS Attempt | Sanitization | Input filtering |
| Component Crash | ErrorBoundary | Fallback UI |
| Extension Auth | ExtensionAuth | Guest mode |

---

## Key Error Handling Patterns

### 1. **Try-Catch with Fallback**
```typescript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  return fallbackValue;
}
```

### 2. **Retry with Exponential Backoff**
```typescript
const MAX_RETRIES = 2;
let attempt = 0;
while (attempt <= MAX_RETRIES) {
  try {
    return await operation();
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
    }
    attempt++;
  }
}
```

### 3. **Graceful Degradation**
```typescript
if (featureAvailable) {
  return await advancedFeature();
} else {
  return basicFeature();
}
```

### 4. **User Feedback**
```typescript
try {
  await operation();
  toast({ title: 'Success', description: 'Operation completed' });
} catch (error) {
  toast({ 
    title: 'Error', 
    description: error.message, 
    variant: 'destructive' 
  });
}
```

---

*This document provides a comprehensive overview of error handling across the Trace Sight Debug View application. Regular updates should be made as new error handling patterns are implemented.* 