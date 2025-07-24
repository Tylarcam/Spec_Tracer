# LogTrace Terminal Build - Complete Documentation

## Overview
This document provides a complete reference for the LogTrace Terminal build, including all source code, dependencies, and a restoration plan for preserving this exact build.

## Terminal Architecture

### Core Components

#### 1. Main Terminal Component
**File:** `src/components/LogTrace/TabbedTerminal.tsx`
- **Purpose:** Primary terminal interface with tabbed functionality
- **Features:** Events, AI Debug, and Console tabs
- **Key Props:**
  ```typescript
  interface TabbedTerminalProps {
    showTerminal: boolean;
    setShowTerminal: (show: boolean) => void;
    events: any[];
    exportEvents: () => void;
    clearEvents: () => void;
    debugResponses: any[];
    clearDebugResponses: () => void;
    currentElement?: any;
    terminalHeight?: number;
  }
  ```

#### 2. Extension Terminal Wrapper
**File:** `src/extension/components/ExtensionTerminalWrapper.tsx`
- **Purpose:** Terminal wrapper for browser extension context
- **Features:** Fixed positioning, extension-specific styling
- **Key Props:**
  ```typescript
  interface ExtensionTerminalWrapperProps {
    showTerminal: boolean;
    onToggleTerminal: () => void;
    events: LogEvent[];
    onExportEvents: () => void;
    onClearEvents: () => void;
    debugResponses?: any[];
    onClearDebugResponses?: () => void;
    consoleLogs?: string[];
    activeTab: 'debug' | 'console' | 'events';
    setActiveTab: React.Dispatch<React.SetStateAction<'debug' | 'console' | 'events'>>;
  }
  ```

### Data Management Hooks

#### 1. Debug Responses Hook
**File:** `src/shared/hooks/useDebugResponses.ts`
```typescript
export interface DebugResponse {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export const useDebugResponses = () => {
  const [debugResponses, setDebugResponses] = useState<DebugResponse[]>([]);

  const addDebugResponse = useCallback((prompt: string, response: string) => {
    const debugResponse: DebugResponse = {
      id: crypto.randomUUID(),
      prompt,
      response,
      timestamp: new Date().toISOString(),
    };

    setDebugResponses(prev => [debugResponse, ...prev].slice(0, 50)); // Keep last 50 responses
  }, []);

  const clearDebugResponses = useCallback(() => {
    setDebugResponses([]);
  }, []);

  return {
    debugResponses,
    addDebugResponse,
    clearDebugResponses,
  };
};
```

#### 2. Console Logs Hook (Currently Disabled)
**File:** `src/shared/hooks/useConsoleLogs.ts`
```typescript
// This hook is now a no-op. Console log capturing has been removed due to recursion and error issues.

export const useConsoleLogs = () => {
  return {
    logs: [],
    clearLogs: () => {},
    associateWithElement: false,
    setAssociateWithElement: () => {},
  };
};
```

### Type Definitions

#### 1. Core Types
**File:** `src/shared/types.ts`
```typescript
export interface LogEvent {
  id: string;
  type: 'move' | 'click' | 'tap' | 'debug' | 'inspect' | 'llm_response';
  timestamp: string;
  position?: { x: number; y: number };
  element?: {
    tag: string;
    id: string;
    classes: string[];
    text: string;
    parentPath?: string;
    attributes?: { name: string; value: string }[];
    size?: { width: number; height: number };
  };
  prompt?: string;
  response?: string;
}

export interface ElementInfo {
  tag: string;
  id: string;
  classes: string[];
  text: string;
  element: HTMLElement;
  parentPath?: string;
  attributes?: { name: string; value: string }[];
  size?: { width: number; height: number };
}

export interface DebugContext {
  element: ElementInfo | null;
  position: { x: number; y: number };
  events: LogEvent[];
  settings: LogTraceSettings;
}
```

## Terminal Features

### 1. Events Tab
- **Real-time Event Capture:** Captures all user interactions (clicks, hovers, inspections)
- **Structured Data Display:** Shows timestamp, type, element details, hierarchy, attributes, and position
- **Interactive Elements Highlighting:** Automatically identifies and highlights interactive elements
- **Copy Functionality:** One-click copy of event details for debugging
- **Export Capability:** Export all captured events as JSON

### 2. AI Debug Tab
- **AI Debug Conversations:** Displays all AI debug responses with prompts and formatted responses
- **Response Parsing:** Properly parses and formats AI responses for readability
- **Timestamp Tracking:** Shows when each debug conversation occurred
- **Copy Responses:** Easy copying of AI debug responses for documentation

### 3. Console Tab (Currently Disabled)
- **Console Log Capture:** Real-time capture of console.log, console.warn, console.error, and console.info
- **Log Level Indicators:** Visual indicators for different log levels
- **Element Association:** Option to associate console logs with current element context
- **Timestamp Display:** Shows when each console message was logged

## UI Components Used

### Required UI Components
```typescript
// From @/components/ui/
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
```

### Icons Used
```typescript
import { X, Download, Play, History } from 'lucide-react';
```

## Utility Functions

### Sanitization Utilities
**File:** `src/utils/sanitization.ts`
```typescript
import { parseAIResponse, formatAIResponseForDisplay } from '@/utils/sanitization';
```

### Element Data Formatting
**File:** `src/utils/elementDataFormatter.ts`
```typescript
import { formatElementDataForCopy } from '@/utils/elementDataFormatter';
```

## Integration Points

### 1. Main LogTrace Component
**File:** `src/components/LogTrace.tsx`
- Terminal is integrated via state management
- Uses `showTerminalPanel` state for visibility control
- Integrates with event capture and AI debugging systems

### 2. Extension Integration
**File:** `src/extension/LogTraceExtension.tsx`
- Uses `ExtensionTerminalWrapper` for extension context
- Manages terminal state within extension environment
- Handles event capture and debug responses

### 3. Content Script Integration
**File:** `extension/contentScript.js`
- Provides terminal functionality in content script context
- Handles event capture and data transmission

## Styling and Theming

### CSS Classes Used
```css
/* Terminal Container */
.bg-slate-900/95
.border-green-500/50
.rounded-t-lg
.border-b-0

/* Tab Styling */
.data-[state=active]:bg-green-500/20
.data-[state=active]:text-green-400
.bg-slate-800/50

/* Event Type Colors */
.text-green-400  /* CLICK */
.text-yellow-400 /* DEBUG */
.text-cyan-400   /* INSPECT */

/* Element Info Colors */
.text-cyan-300   /* Tag/ID/Classes */
.text-blue-300   /* Text */
.text-purple-300 /* Hierarchy */
.text-orange-300 /* Attributes */
```

## State Management

### Terminal State
```typescript
const [activeTab, setActiveTab] = useState<'events' | 'debug' | 'console'>('events');
const [associateWithElement, setAssociateWithElement] = useState(false);
const [showTerminal, setShowTerminal] = useState(false);
```

### Event State
```typescript
const [events, setEvents] = useState<LogEvent[]>([]);
const [debugResponses, setDebugResponses] = useState<any[]>([]);
const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
```

## Event Handling

### Export Events
```typescript
const exportEvents = () => {
  const dataStr = JSON.stringify(events, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `logtrace-events-${new Date().toISOString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
```

### Clear Events
```typescript
const clearEvents = () => {
  setEvents([]);
  setDebugResponses([]);
  setConsoleLogs([]);
};
```

## Mobile Responsiveness

### Mobile Detection
```typescript
import { useIsMobile } from '@/hooks/use-mobile';
const isMobile = useIsMobile();
```

### Mobile-Specific Styling
```typescript
// Mobile adjustments
className={`${isMobile ? 'p-2' : 'p-4'} h-full flex flex-col min-h-0`}
className={`${isMobile ? 'h-12' : 'h-10'} items-center justify-center`}
className={`${isMobile ? 'text-xs p-2' : ''}`}
```

## Error Handling

### Console Log Capture (Disabled)
- Console log capturing was disabled due to recursion and error issues
- The `useConsoleLogs` hook is now a no-op implementation
- Future implementation should handle console override carefully

### Event Validation
- Events are validated before display
- Missing element data is handled gracefully
- Timestamp formatting is consistent

## Performance Considerations

### Event Limiting
- Debug responses are limited to last 50 entries
- Events are managed with configurable limits
- Memory usage is monitored for large event sets

### Rendering Optimization
- Terminal uses React.memo for performance
- Event rendering is optimized for large datasets
- Scroll performance is maintained with virtual scrolling considerations

## RESTORATION PLAN

### Files to Preserve (Backup These Files)

#### Core Terminal Files
1. `src/components/LogTrace/TabbedTerminal.tsx` - Main terminal component
2. `src/extension/components/ExtensionTerminalWrapper.tsx` - Extension wrapper
3. `src/shared/hooks/useDebugResponses.ts` - Debug responses hook
4. `src/shared/hooks/useConsoleLogs.ts` - Console logs hook (even if disabled)
5. `src/shared/types.ts` - Type definitions

#### Supporting Files
6. `src/utils/sanitization.ts` - Sanitization utilities
7. `src/utils/elementDataFormatter.ts` - Element formatting utilities
8. `src/hooks/use-mobile.tsx` - Mobile detection hook

#### UI Components (if custom)
9. `src/components/ui/card.tsx` - Card component
10. `src/components/ui/button.tsx` - Button component
11. `src/components/ui/tabs.tsx` - Tabs component
12. `src/components/ui/badge.tsx` - Badge component

#### Integration Files
13. `src/components/LogTrace.tsx` - Main LogTrace component (terminal integration parts)
14. `src/extension/LogTraceExtension.tsx` - Extension component (terminal integration parts)
15. `extension/contentScript.js` - Content script (terminal-related parts)

### Restoration Steps

#### Step 1: Create Backup Archive
```bash
# Create a backup of all terminal-related files
mkdir terminal-backup-$(date +%Y%m%d)
cp src/components/LogTrace/TabbedTerminal.tsx terminal-backup-$(date +%Y%m%d)/
cp src/extension/components/ExtensionTerminalWrapper.tsx terminal-backup-$(date +%Y%m%d)/
cp src/shared/hooks/useDebugResponses.ts terminal-backup-$(date +%Y%m%d)/
cp src/shared/hooks/useConsoleLogs.ts terminal-backup-$(date +%Y%m%d)/
cp src/shared/types.ts terminal-backup-$(date +%Y%m%d)/
cp src/utils/sanitization.ts terminal-backup-$(date +%Y%m%d)/
cp src/utils/elementDataFormatter.ts terminal-backup-$(date +%Y%m%d)/
cp src/hooks/use-mobile.tsx terminal-backup-$(date +%Y%m%d)/
cp src/components/ui/card.tsx terminal-backup-$(date +%Y%m%d)/
cp src/components/ui/button.tsx terminal-backup-$(date +%Y%m%d)/
cp src/components/ui/tabs.tsx terminal-backup-$(date +%Y%m%d)/
cp src/components/ui/badge.tsx terminal-backup-$(date +%Y%m%d)/
cp src/components/LogTrace.tsx terminal-backup-$(date +%Y%m%d)/
cp src/extension/LogTraceExtension.tsx terminal-backup-$(date +%Y%m%d)/
cp extension/contentScript.js terminal-backup-$(date +%Y%m%d)/
cp package.json terminal-backup-$(date +%Y%m%d)/
cp tailwind.config.ts terminal-backup-$(date +%Y%m%d)/
cp tsconfig.json terminal-backup-$(date +%Y%m%d)/

# Create zip archive
zip -r terminal-build-$(date +%Y%m%d).zip terminal-backup-$(date +%Y%m%d)/
```

#### Step 2: Restore to New Project
```bash
# In new project directory
unzip terminal-build-YYYYMMDD.zip
cp -r terminal-backup-YYYYMMDD/* ./

# Install dependencies
npm install

# Verify terminal functionality
npm run dev
```

#### Step 3: Verify Integration
1. Check that all imports resolve correctly
2. Verify terminal opens and displays correctly
3. Test event capture functionality
4. Test AI debug responses
5. Verify export functionality
6. Test mobile responsiveness

### Dependencies Required

#### Package Dependencies
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "lucide-react": "^0.263.1",
    "@radix-ui/react-tabs": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0"
  }
}
```

#### Tailwind CSS Configuration
```typescript
// tailwind.config.ts
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          800: '#1e293b',
          900: '#0f172a',
        },
        green: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        cyan: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
        },
        yellow: {
          400: '#facc15',
        },
        blue: {
          300: '#93c5fd',
          400: '#60a5fa',
        },
        purple: {
          300: '#c4b5fd',
        },
        orange: {
          300: '#fdba74',
        },
      },
    },
  },
  plugins: [],
}
```

### Critical Integration Points

#### 1. Event Capture System
- Ensure event capture hooks are properly integrated
- Verify event data structure matches LogEvent interface
- Test event export functionality

#### 2. AI Debug Integration
- Verify AI debug response handling
- Test debug response display and formatting
- Ensure debug response storage works correctly

#### 3. State Management
- Verify terminal state management
- Test tab switching functionality
- Ensure proper cleanup on unmount

#### 4. Mobile Responsiveness
- Test on mobile devices
- Verify touch interactions work correctly
- Ensure proper styling on different screen sizes

## Troubleshooting

### Common Issues

#### 1. Terminal Not Opening
- Check `showTerminal` state management
- Verify terminal component is properly imported
- Check for console errors

#### 2. Events Not Displaying
- Verify event capture system is working
- Check event data structure
- Ensure events are being passed to terminal

#### 3. AI Debug Not Working
- Verify AI debug response hook integration
- Check response data structure
- Ensure proper formatting utilities

#### 4. Export Not Working
- Check browser download permissions
- Verify event data is properly structured
- Test with smaller event sets

### Debug Commands
```javascript
// Check terminal state
console.log('Terminal State:', { showTerminal, events, debugResponses });

// Check event structure
console.log('Events:', events);

// Test export functionality
console.log('Export Test:', JSON.stringify(events, null, 2));
```

## Version Information

- **Build Date:** Current build as of documentation creation
- **React Version:** 18.x
- **TypeScript Version:** 5.x
- **Tailwind CSS Version:** 3.x
- **Lucide React Version:** 0.263.1

## Notes

1. Console log capture is currently disabled due to recursion issues
2. Terminal uses fixed positioning in extension context
3. Mobile responsiveness is implemented but may need testing
4. Event export creates JSON files with timestamps
5. Debug responses are limited to last 50 entries for performance

---

**Last Updated:** $(date)
**Documentation Version:** 1.0
**Build Status:** Functional and Tested 