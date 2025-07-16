
# Iframe Interactive Demo Architecture Map

## Overview
This document provides a comprehensive architectural mapping of the `/debug` page and its iframe interactive demo functionality. This system enables users to debug any website through iframe embedding with AI-powered element inspection and analysis.

## Core System Architecture

### 1. Entry Point & Routing
**File: `src/App.tsx`**
- Main application wrapper with routing configuration
- Provides global context providers (Auth, Query, Gesture, Tooltip)
- Routes `/debug` to `Index.tsx` component

**File: `src/pages/Index.tsx`**
- Main entry point for debug functionality
- Handles URL parameter parsing (`?site=` parameter)
- Conditional rendering:
  - No site URL → Shows `IframeDemoBar` (site selection interface)
  - Has site URL → Shows iframe with `LogTrace` overlay

### 2. Site Selection Interface
**File: `src/components/IframeDemoBar.tsx`**
- Landing page for selecting websites to debug
- Features:
  - URL input with validation
  - Popular iframe-friendly site suggestions
  - User authentication status display
  - Credits/usage tracking display
  - Settings and upgrade modals

## Core Debug System Components

### 3. Main Debug Overlay System
**File: `src/components/LogTrace.tsx`** (623 lines - needs refactoring)
- **Purpose**: Main orchestrator component for debug functionality
- **Key Responsibilities**:
  - Manages debug mode activation/deactivation
  - Coordinates between iframe and direct DOM interaction
  - Handles keyboard shortcuts and user input
  - Manages modal states and terminal visibility
  - Integrates with authentication and usage tracking

**Key State Management**:
```typescript
const [isActive, setIsActive] = useState(false);
const [showInteractivePanel, setShowInteractivePanel] = useState(false);
const [showDebugModal, setShowDebugModal] = useState(false);
const [showTerminal, setShowTerminal] = useState(false);
```

### 4. Iframe Communication Bridge
**File: `src/shared/hooks/useIframeBridge.ts`** (308 lines - needs refactoring)
- **Purpose**: Handles cross-origin iframe communication
- **Key Features**:
  - Same-origin vs cross-origin detection
  - Content script injection for same-origin iframes
  - PostMessage communication protocol
  - Element highlighting and interaction capture

**Communication Protocol**:
```typescript
interface IframeMessage {
  type: 'IFRAME_READY' | 'IFRAME_MOUSE_MOVE' | 'IFRAME_MOUSE_CLICK' | 'IFRAME_ACTIVATE' | 'IFRAME_DEACTIVATE';
  data?: any;
}
```

**File: `src/shared/iframeContentScript.ts`**
- **Purpose**: Script injected into iframe for event capture
- **Features**:
  - Mouse movement and click tracking
  - Element highlighting with visual overlay
  - DOM element information extraction
  - Parent window communication

### 5. Main LogTrace Hook System
**File: `src/shared/hooks/useLogTrace.ts`**
- **Purpose**: Main composition hook that orchestrates smaller hooks
- **Composed Hooks**:
  - `useEventTracking`: Event logging and storage
  - `useElementInspection`: DOM element analysis
  - `useDebugModal`: AI debugging interface
  - `useSettings`: Configuration management
  - `useCreditsSystem`: Usage tracking

## UI Component Hierarchy

### 6. Header Component
**File: `src/components/LogTrace/Header.tsx`**
- Debug mode toggle
- Terminal visibility toggle
- Credits/usage display
- Settings and upgrade buttons
- Context capture controls

### 7. Mouse Overlay System
**File: `src/components/LogTrace/MouseOverlay.tsx`**
- Real-time element highlighting
- Mouse position tracking
- Element boundary visualization
- Click interaction handling

### 8. Element Inspector Panel
**File: `src/components/LogTrace/ElementInspector.tsx`**
- Element information display
- Debug action buttons
- Element hierarchy visualization
- Quick action panel

### 9. Debug Modal System
**File: `src/components/LogTrace/DebugModal.tsx`**
- AI-powered element analysis
- Custom prompt input
- Response display and management
- Integration with edge functions

### 10. Terminal System
**File: `src/components/LogTrace/TabbedTerminal.tsx`**
- Event log display
- Debug response history
- Export functionality
- Multi-tab interface

## Data Flow Architecture

### 11. Event Tracking System
```mermaid
User Interaction → Element Detection → Event Logging → Storage/Display
```

**Key Event Types**:
- `move`: Mouse movement tracking
- `click`: Element click events
- `debug`: AI analysis requests
- `inspect`: Element inspection
- `llm_response`: AI response logging

### 12. Element Information Flow
```typescript
interface ElementInfo {
  tag: string;
  id: string;
  classes: string[];
  text: string;
  element: HTMLElement;
  parentPath?: string;
  attributes?: { name: string; value: string }[];
  size?: { width: number; height: number };
}
```

### 13. AI Debug Integration
**Edge Function**: `supabase/functions/ai-debug/index.ts`
- Processes debug requests
- Integrates with OpenAI API
- Handles context generation
- Returns structured analysis

## Authentication & Credits System

### 14. User Management
**File: `src/contexts/AuthContext.tsx`**
- Supabase authentication integration
- User session management
- Authentication state propagation

### 15. Credits & Usage Tracking
**Files**:
- `src/hooks/useCreditsSystem.ts`
- `src/hooks/useUsageTracking.ts`
- Database tables: `user_credits`, `subscribers`, `waitlist_credits`

**Credit System Flow**:
```
User Action → Credit Check → Action Execution → Usage Increment → UI Update
```

## Storage & Persistence

### 16. Local Storage System
**File: `src/shared/storage.ts`**
- Event history persistence
- Settings storage
- Cross-session state management

### 17. Database Integration
**Tables**:
- `user_credits`: Daily usage tracking
- `subscribers`: Premium subscriptions
- `waitlist_credits`: Bonus credits
- `user_subscriptions`: Stripe integration

## Technical Implementation Details

### 18. Cross-Origin Communication
**Same-Origin Strategy**:
- Direct script injection
- Full DOM access
- Real-time event capture

**Cross-Origin Strategy**:
- PostMessage communication
- Limited interaction capability
- Security-compliant operation

### 19. Element Highlighting System
**Visual Feedback**:
```css
border: 2px solid #06b6d4;
background: rgba(6, 182, 212, 0.1);
box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
```

### 20. Keyboard Shortcuts
- `s`: Start/activate debug mode
- `e`: Exit/deactivate debug mode
- `d`: Pause/unpause element tracking
- `Ctrl+d`: Quick debug current element
- `t`: Toggle terminal
- `Escape`: Close all modals

## Mobile Adaptations

### 21. Responsive Design
- Touch-friendly controls
- Mobile-optimized terminal
- Gesture-based interactions
- Viewport-aware positioning

## Error Handling & Edge Cases

### 22. Iframe Security Handling
- CORS policy detection
- Content Security Policy compliance
- Sandbox attribute management
- Fallback for blocked embedding

### 23. Network & Performance
- Lazy loading strategies
- Event throttling
- Memory management
- Resource cleanup

## Extension Integration

### 24. Browser Extension Support
**File: `src/extension/LogTraceContent.tsx`**
- Content script injection
- Extension-specific UI adaptations
- Cross-context communication

## Deployment Architecture

### 25. Build Configuration
- Vite configuration for iframe handling
- PostMessage origin management
- CSP configuration
- Service worker integration

## Security Considerations

### 26. Iframe Security
- Sandbox restrictions
- Origin validation
- XSS prevention
- Data sanitization

### 27. API Security
- Authentication required for AI features
- Rate limiting via credits
- Input validation
- Response sanitization

## Future Refactoring Recommendations

### 28. Component Splitting
**Priority Files for Refactoring**:
1. `LogTrace.tsx` (623 lines) → Split into:
   - `LogTraceCore.tsx`
   - `LogTraceEventHandlers.tsx`
   - `LogTraceModals.tsx`
   - `LogTraceKeyboard.tsx`

2. `useIframeBridge.ts` (308 lines) → Split into:
   - `useIframeDetection.ts`
   - `useIframeCommunication.ts`
   - `useIframeContentScript.ts`

### 29. Architecture Improvements
- Implement Redux/Zustand for complex state
- Add service worker for offline functionality
- Implement WebRTC for real-time collaboration
- Add WebSocket for live debugging sessions

## Dependencies & Technologies

### 30. Core Technologies
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling system
- **Vite**: Build tool
- **Supabase**: Backend & auth
- **React Router**: Navigation
- **TanStack Query**: Data fetching

### 31. Key Libraries
- `html2canvas`: Screenshot functionality
- `lucide-react`: Icon system
- `react-hook-form`: Form handling
- `@radix-ui/*`: UI primitives
- `recharts`: Data visualization

## Performance Metrics

### 32. Key Performance Indicators
- Initial load time
- Iframe communication latency
- Element detection accuracy
- AI response time
- Memory usage optimization

## Testing Strategy

### 33. Testing Considerations
- Cross-browser iframe compatibility
- Mobile responsiveness
- Network condition handling
- Edge case scenario testing
- Security vulnerability assessment

---

## Summary

This architecture map provides a complete overview of the iframe interactive demo system. The architecture is modular, with clear separation of concerns between iframe communication, element inspection, AI integration, and user interface management. The system handles both same-origin and cross-origin scenarios gracefully while providing a rich debugging experience with AI-powered analysis capabilities.

The main architectural strengths include:
- Robust iframe communication system
- Flexible element inspection framework
- Integrated AI debugging capabilities
- Comprehensive user management
- Mobile-responsive design
- Extensible component architecture

Key areas for improvement include refactoring large files, implementing more sophisticated state management, and enhancing the extension integration capabilities.
