
# Landing Page Architecture Documentation

## Overview

The landing page ("/") serves as the main entry point for LogTrace, providing users with a clean interface to input website URLs for debugging and analysis. This document outlines the architecture, components, and connections that make this page functional.

## File Structure & Components

### Core Landing Page
- **`src/pages/Landing.tsx`** - Main landing page component
- **`src/App.tsx`** - Routing configuration that maps "/" to Landing component

### UI Components Used
- **`@/components/ui/button`** - Primary CTA button for analysis
- **`@/hooks/use-toast`** - Toast notifications for user feedback

### Icons & Assets
- **`lucide-react`** icons:
  - `Globe` - URL input field icon
  - `Zap` - Logo icon and loading states
  - `Search` - Analyze button icon

## Component Architecture

```
Landing.tsx
├── State Management
│   ├── url (string) - User input URL
│   ├── isAnalyzing (boolean) - Loading state
│   └── inputRef (React.RefObject) - Input field reference
│
├── External Dependencies
│   ├── useNavigate() - React Router navigation
│   ├── useToast() - Toast notification system
│   └── useEffect() - Auto-focus on page load
│
├── UI Sections
│   ├── Header Section
│   │   ├── Logo + Title (LogTrace with Zap icon)
│   │   ├── Main description
│   │   └── Subtitle instruction
│   │
│   ├── Input Section
│   │   ├── URL input field with Globe icon
│   │   ├── Analyze button with Search icon
│   │   └── Popular examples (clickable pills)
│   │
│   └── Loading Overlay (conditional)
│       ├── Animated pulsing circle
│       └── Loading text with animation
│
└── Background Elements
    ├── Gradient background
    └── Animated blur circles
```

## Data Flow

### 1. User Input Flow
```
User types URL → handleAnalyze() → URL validation → Navigate to /debug
```

### 2. Navigation Flow
```
Landing Page (/) → Debug Page (/debug?site=encodedURL)
```

### 3. Example Selection Flow
```
User clicks example → setUrl() → Auto-focus input → Ready for analysis
```

## Key Functions & Logic

### URL Processing
```typescript
// Add protocol if missing
let fullUrl = url.trim();
if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
  fullUrl = 'https://' + fullUrl;
}

// Validate URL format
const parsed = new URL(fullUrl);

// Navigate with encoded URL
navigate(`/debug?site=${encodeURIComponent(parsed.href)}`);
```

### Error Handling
- **Empty URL**: Toast notification with destructive variant
- **Invalid URL**: Toast notification with error message
- **URL parsing**: Try-catch block with user-friendly error messages

## Routing Connections

### Current Route: "/"
- **Component**: `Landing`
- **Purpose**: Main entry point and URL input interface

### Navigation Target: "/debug"
- **Component**: `Index` (from `src/pages/Index.tsx`)
- **Purpose**: Debug interface with iframe and LogTrace tools
- **Parameters**: `?site=<encodedURL>`

### Other Routes
- **"/auth"**: Authentication page
- **"/context-transform"**: Context transformation tools
- **"*"**: 404 Not Found page

## Dependencies & Integrations

### React Router
```typescript
import { useNavigate } from 'react-router-dom';
```
- Used for programmatic navigation to debug page
- Maintains URL state through query parameters

### Toast System
```typescript
import { useToast } from '@/hooks/use-toast';
```
- Provides user feedback for validation errors
- Consistent notification styling across app

### Styling System
- **Tailwind CSS**: Utility-first styling
- **Custom gradients**: Background and text effects
- **Responsive design**: Mobile-first approach with breakpoints
- **Dark theme**: Slate color palette with accent colors

## State Management

### Local State
- **`url`**: Controlled input for URL entry
- **`isAnalyzing`**: Loading state during navigation transition
- **`inputRef`**: Reference for auto-focus functionality

### No Global State
- Landing page operates independently
- State is passed via URL parameters to debug page

## User Experience Features

### Auto-focus
```typescript
useEffect(() => {
  if (inputRef.current) {
    inputRef.current.focus();
  }
}, []);
```

### Popular Examples
- Pre-defined example URLs for quick testing
- One-click selection with auto-focus return

### Loading States
- Immediate visual feedback on analyze click
- 500ms delay for smooth transition animation
- Full-screen overlay during navigation

### Keyboard Support
- Enter key submits form
- Tab navigation through interactive elements

## Performance Considerations

### Code Splitting
- Landing page is part of main bundle (not lazy-loaded)
- Critical for fast initial page load

### Asset Loading
- Lucide icons are tree-shaken (only used icons imported)
- Tailwind CSS is purged of unused styles
- No heavy dependencies or external API calls

## Error Boundaries

### URL Validation
- Client-side validation before navigation
- Graceful error handling with user feedback
- No server-side validation required

### Fallback Handling
- Invalid URLs caught and displayed to user
- No application crashes from malformed input

## Future Extensibility

### Potential Enhancements
1. **Recent URLs**: Local storage of previously analyzed sites
2. **URL Suggestions**: Auto-complete for popular domains
3. **Batch Analysis**: Multiple URL input support
4. **Analytics**: Track popular examples and user behavior

### Integration Points
1. **Authentication**: Could add sign-in prompts for premium features
2. **Subscription**: Usage limits and upgrade prompts
3. **History**: Connection to user's analysis history
4. **Settings**: User preferences for analysis options

## Testing Considerations

### Unit Tests
- URL validation logic
- Navigation behavior
- Error handling scenarios
- User input validation

### Integration Tests
- End-to-end flow from landing to debug page
- URL parameter passing
- Toast notification display

### Accessibility Tests
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Color contrast ratios

## Security Notes

### Input Sanitization
- URL validation prevents XSS through malformed URLs
- encodeURIComponent() protects against URL injection
- No direct HTML rendering of user input

### External Navigation
- Only navigates to internal routes
- No direct external URL redirection from user input
- Debug page handles external site loading safely within iframe

