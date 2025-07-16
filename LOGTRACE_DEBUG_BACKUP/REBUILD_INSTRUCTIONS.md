
# LogTrace Debug Page - Detailed Rebuild Instructions

## 🎯 Overview

This guide will help you recreate the complete `/debug` page functionality step-by-step, preserving all features including the critical "Enter key flow" and iframe inspection capabilities.

## 📋 Prerequisites

- Node.js 18+ installed
- Basic knowledge of React, TypeScript, and Tailwind CSS
- Supabase account (for authentication and backend)

## 🚀 Step 1: Project Setup

### 1.1 Create Vite Project
```bash
npm create vite@latest my-logtrace-debug -- --template react-ts
cd my-logtrace-debug
```

### 1.2 Install Dependencies
```bash
npm install @supabase/supabase-js react-router-dom lucide-react
npm install @tanstack/react-query html2canvas
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

### 1.3 Configure TypeScript
Update `tsconfig.json` to include path mapping:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 🎨 Step 2: Styling System Setup

### 2.1 Configure Tailwind
Replace `tailwind.config.ts` with the backup version that includes:
- Dark mode support
- Custom color tokens (HSL-based)
- Responsive breakpoints
- Custom animations

### 2.2 Setup CSS Variables
Replace `src/index.css` with the backup version that defines:
- CSS custom properties for colors
- Dark theme variables
- Base styling for body and elements
- Tailwind directives

## 🗂️ Step 3: Core File Structure

Create the following directory structure:
```
src/
├── pages/
│   └── Index.tsx
├── components/
│   ├── IframeDemoBar.tsx
│   └── LogTrace.tsx
├── shared/
│   ├── hooks/
│   │   ├── useIframeBridge.ts
│   │   ├── useLogTrace.ts
│   │   └── useElementInspection.ts
│   ├── iframeContentScript.ts
│   └── types.ts
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useCreditsSystem.ts
└── integrations/
    └── supabase/
        └── client.ts
```

## 🚪 Step 4: App Entry Point & Routing

### 4.1 Update App.tsx
Implement the routing structure that supports:
- Home page at `/`
- Debug page at `/debug` with iframe functionality
- Auth page at `/auth`
- Query parameter handling for `?site=URL`

### 4.2 Update main.tsx
Setup providers for:
- React Query client
- Authentication context
- Router configuration

## 🏠 Step 5: Home Page Implementation

### 5.1 Create IframeDemoBar Component
This is the landing page that users see first. Key features:
- **URL Input Field**: Large, centered input for website URLs
- **Enter Key Handler**: Triggers navigation to debug page
- **Analyze Button**: Primary CTA that validates URL and navigates
- **Iframe-Friendly Examples**: Clickable buttons for test sites
- **Authentication UI**: Sign in/out buttons and user status
- **Credits Display**: Shows remaining AI analysis credits

**Critical Enter Key Flow Implementation:**
```typescript
const handleAnalyze = () => {
  if (!url.trim()) return;
  let fullUrl = url.trim();
  if (!/^https?:\/\//.test(fullUrl)) {
    fullUrl = 'https://' + fullUrl;
  }
  window.location.href = `/debug?site=${encodeURIComponent(fullUrl)}`;
};

const onKeyDown = (e) => {
  if (e.key === 'Enter') {
    handleAnalyze();
  }
};
```

## 🔍 Step 6: Debug Page Implementation

### 6.1 Create Index.tsx (Debug Page)
This page handles the iframe loading and LogTrace overlay:
- **URL Parameter Parsing**: Extract `site` from query string
- **Iframe Rendering**: Load external website with proper sandbox
- **Error Handling**: Display fallback for blocked sites
- **LogTrace Integration**: Overlay debugging interface

**Key Implementation Points:**
```typescript
const location = useLocation();
const params = new URLSearchParams(location.search);
const siteUrl = params.get('site');

// If no site URL, redirect to home
if (!siteUrl) {
  return <IframeDemoBar />;
}

// Render iframe with LogTrace overlay
return (
  <div className="min-h-screen relative">
    <iframe src={siteUrl} className="w-full h-screen" />
    <LogTrace iframeRef={iframeRef} />
  </div>
);
```

## 🕵️ Step 7: LogTrace Core System

### 7.1 Create LogTrace.tsx
This is the main debugging interface with:
- **Element Inspection**: Real-time highlighting on hover
- **Click Detection**: Capture clicks for detailed analysis
- **AI Debugging**: Send element context to OpenAI
- **Keyboard Shortcuts**: S/E for start/exit, D for debug, T for terminal
- **Mobile Support**: Touch-friendly interactions

### 7.2 Create useLogTrace Hook
Compose multiple smaller hooks for:
- Event tracking and storage
- Element inspection logic
- Debug modal management
- Settings and preferences

### 7.3 Create useElementInspection Hook
Handle element interaction:
- **Mouse Position Tracking**: Real-time cursor position
- **Element Info Extraction**: Tag, classes, text, parent path
- **Sanitization**: Clean data for safe processing

## 🌉 Step 8: Iframe Communication Bridge

### 8.1 Create useIframeBridge Hook
Handle cross-origin communication:
- **Message Passing**: Send/receive data between parent and iframe
- **Content Script Injection**: For same-origin iframes
- **Event Forwarding**: Mouse/click events from iframe to parent

### 8.2 Create iframeContentScript.ts
Inject into iframe for:
- **Event Capture**: Mouse movements and clicks inside iframe
- **Element Highlighting**: Visual feedback within iframe
- **Data Extraction**: Element information and hierarchy

**Message Communication Pattern:**
```typescript
// Parent to iframe
iframe.contentWindow?.postMessage({ type: 'IFRAME_ACTIVATE' }, '*');

// Iframe to parent
window.parent.postMessage({
  type: 'IFRAME_MOUSE_MOVE',
  data: { position, element }
}, '*');
```

## 🔐 Step 9: Authentication System

### 9.1 Create AuthContext
Implement Supabase authentication:
- **Session Management**: Store user and session state
- **Auth State Listener**: Handle login/logout events
- **Token Refresh**: Automatic session renewal

### 9.2 Create useCreditsSystem Hook
Manage usage tracking:
- **Credit Tracking**: Count AI analysis usage
- **Premium Detection**: Check subscription status
- **Reset Logic**: Daily credit renewal

## 🎨 Step 10: Visual Design Implementation

### 10.1 Color System
Use HSL-based colors from CSS variables:
- **Primary**: Green-to-cyan gradients
- **Background**: Slate-900/800 with transparency
- **Highlights**: Cyan borders (#06b6d4)
- **Text**: White/gray on dark backgrounds

### 10.2 Element Highlighting
Implement visual feedback:
```typescript
const highlight = document.createElement('div');
highlight.style.cssText = `
  position: fixed;
  left: ${rect.left}px;
  top: ${rect.top}px;
  width: ${rect.width}px;
  height: ${rect.height}px;
  border: 2px solid #06b6d4;
  background: rgba(6, 182, 212, 0.1);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
  pointer-events: none;
  z-index: 999998;
`;
```

### 10.3 Responsive Design
Ensure mobile compatibility:
- **Touch Events**: Mobile-friendly interactions
- **Viewport Scaling**: Proper sizing on small screens
- **Navigation**: Touch-optimized buttons and controls

## 🗄️ Step 11: Supabase Backend Setup

### 11.1 Database Schema
Create tables for:
- **user_credits**: Track AI usage per user
- **user_subscriptions**: Premium subscription status
- **waitlist**: Beta user management

### 11.2 Edge Functions
Deploy AI debugging function:
- **OpenAI Integration**: Send prompts and receive analysis
- **Credit Deduction**: Track usage automatically
- **Error Handling**: Graceful failure responses

## 🧪 Step 12: Testing & Verification

### 12.1 Critical Path Testing
1. **Home Page Flow**:
   - Enter "example.com" in input
   - Press Enter key
   - Verify navigation to `/debug?site=https://example.com`

2. **Debug Page Flow**:
   - Confirm iframe loads external site
   - Verify LogTrace overlay appears
   - Test element highlighting on hover
   - Confirm click detection works

3. **Authentication Flow**:
   - Test sign up/sign in
   - Verify credit tracking
   - Check premium user benefits

### 12.2 Cross-Browser Testing
- **Chrome**: Primary target browser
- **Firefox**: Secondary support
- **Safari**: Mobile Safari compatibility
- **Edge**: Windows compatibility

### 12.3 Mobile Testing
- **Responsive Layout**: Proper scaling on mobile
- **Touch Events**: Tap interactions work
- **Virtual Keyboard**: Input fields work properly

## 🔧 Step 13: Common Issues & Solutions

### 13.1 Iframe Loading Issues
- **CORS Errors**: Some sites block iframe embedding
- **Content Security Policy**: Headers prevent loading
- **Solution**: Provide iframe-friendly test sites

### 13.2 Cross-Origin Communication
- **Message Blocking**: Security restrictions
- **Script Injection**: Limited to same-origin
- **Solution**: Graceful fallback for cross-origin sites

### 13.3 Authentication Problems
- **Redirect URLs**: Must match Supabase config
- **Session Persistence**: Ensure proper storage
- **Solution**: Check Supabase dashboard settings

## 🎯 Step 14: Final Verification

### 14.1 Core Feature Checklist
- [ ] Enter key triggers navigation from home page
- [ ] URLs are properly validated and prefixed
- [ ] Debug page loads iframe correctly
- [ ] LogTrace overlay appears and functions
- [ ] Element highlighting works on hover
- [ ] Click detection captures element info
- [ ] AI debugging integrates with OpenAI
- [ ] Authentication flow is complete
- [ ] Credits system tracks usage
- [ ] Mobile responsive design works

### 14.2 Visual Design Checklist
- [ ] Dark theme with proper contrast
- [ ] Green-to-cyan gradient backgrounds
- [ ] Cyan element highlighting borders
- [ ] Smooth animations and transitions
- [ ] Consistent typography and spacing

### 14.3 Performance Checklist
- [ ] Fast initial page load
- [ ] Smooth iframe loading
- [ ] Responsive element highlighting
- [ ] Efficient cross-origin communication

## 🚀 Deployment

Once testing is complete:
1. **Build Production**: `npm run build`
2. **Deploy Static Files**: Upload to hosting service
3. **Configure Supabase**: Update redirect URLs
4. **Test Live Site**: Verify all functionality works

## 📚 Additional Resources

- **Supabase Docs**: Authentication and database setup
- **React Router**: Navigation and query parameters
- **Tailwind CSS**: Styling and responsive design
- **TypeScript**: Type safety and development experience

This guide preserves every aspect of the original `/debug` page functionality while providing clear implementation steps for recreation.
