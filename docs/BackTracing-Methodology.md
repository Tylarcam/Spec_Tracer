# BackTracing: A Systematic Approach to Code Understanding

## Overview

BackTracing is a systematic methodology for understanding codebases by following data flows, event lifecycles, and component relationships backwards from observable behavior to their source implementations. This approach creates a comprehensive data dictionary that enhances communication with LLMs and improves codebase comprehension.

## The BackTracing Workflow

### Phase 1: Data Point Identification
**Goal**: Identify the specific data point or behavior you want to understand

1. **Collect Observable Data**
   - Event logs, user actions, API responses
   - UI behaviors, error messages, system outputs
   - Performance metrics, debugging traces

2. **Extract Key Identifiers**
   - Event types, timestamps, positions
   - Element selectors, component names
   - Data structures, API endpoints

3. **Prioritize Investigation Points**
   - Most frequent events
   - Critical user interactions
   - Error-prone areas

### Phase 2: Semantic Code Discovery
**Goal**: Use AI-powered semantic search to understand high-level concepts

1. **Broad Conceptual Queries**
   ```
   "How does [event type] get triggered and handled?"
   "What components are responsible for [behavior]?"
   "How does [data flow] work end-to-end?"
   ```

2. **Progressive Refinement**
   - Start with general concepts
   - Narrow down to specific implementations
   - Follow dependency chains

3. **Multi-angle Investigation**
   - Search from different perspectives
   - Use varied terminology
   - Cross-reference findings

### Phase 3: Code Pattern Recognition
**Goal**: Identify exact code locations and patterns

1. **Targeted Text Searches**
   ```bash
   # Function names, event types, key variables
   grep -r "handleKeyDown" --include="*.tsx"
   grep -r "debug.*event" --include="*.ts"
   ```

2. **Symbol Tracing**
   - Function definitions
   - Import/export chains
   - Type definitions

3. **File Structure Mapping**
   - Component hierarchies
   - Hook dependencies
   - Utility functions

### Phase 4: Data Flow Analysis
**Goal**: Map complete data lifecycle from trigger to storage

1. **Event Lifecycle Mapping**
   - Trigger points (user actions, timers, API calls)
   - Processing steps (validation, transformation)
   - Storage mechanisms (state, database, cache)

2. **Component Interaction Tracking**
   - Parent-child relationships
   - Prop passing chains
   - Context providers and consumers

3. **State Management Flows**
   - Hook dependencies
   - State updates
   - Side effects

### Phase 5: Documentation & Dictionary Creation
**Goal**: Create comprehensive documentation for future reference

1. **Event Dictionary**
   - Event types and their purposes
   - Trigger conditions
   - Data schemas

2. **Component Maps**
   - Responsibility matrices
   - Interaction diagrams
   - Dependency graphs

3. **Code Navigation Guides**
   - File location indexes
   - Function relationship maps
   - Configuration settings

---

## Case Study: LogTrace Debug and Inspect Events

### Event Data Analysis

From the LogTrace session data, we're analyzing these two events:

**Event 1: DEBUG Event**
```json
{
  "type": "debug",
  "position": { "x": 452, "y": 467 },
  "element": {
    "tag": "div",
    "classes": ["grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-3", "text-green-300", "text-sm"],
    "text": "Interactive ModesStart tracing → Hover elements → ..."
  },
  "id": "bj6b9ln4v",
  "timestamp": "2025-07-10T08:09:36.615Z"
}
```

**Event 2: INSPECT Event**
```json
{
  "type": "inspect",
  "position": { "x": 452, "y": 467 },
  "element": {
    "tag": "div",
    "classes": ["grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-3", "text-green-300", "text-sm"],
    "text": "Interactive ModesStart tracing → Hover elements → ..."
  },
  "id": "8a3t2v0tq",
  "timestamp": "2025-07-10T08:09:35.390Z"
}
```

### BackTracing Analysis

#### Phase 1: Data Point Identification

**Key Observations:**
- Both events target the same DOM element (instructions grid)
- Same position coordinates (452, 467)
- Debug event occurs ~1.2 seconds after inspect event
- Element is part of the InstructionsCard component based on classes and text

**Element Identification:**
- **Target**: Instructions grid container
- **Classes**: Responsive grid layout with green text styling
- **Content**: Interactive mode instructions
- **Location**: Main LogTrace component UI

#### Phase 2: Semantic Code Discovery

**Primary Queries Used:**
1. "How does the debug event get triggered and handled in the main app?"
2. "How does the inspect event get triggered when clicking on elements?"
3. "Where are keyboard shortcuts handled for debug functionality?"

**Key Findings:**
- Debug events triggered by `Ctrl+D` keyboard shortcut
- Inspect events triggered by click interactions during active tracing
- Both events managed through the LogTrace component's event system

#### Phase 3: Code Pattern Recognition

**Critical Code Locations:**

**Debug Event Trigger Points:**

1. **Keyboard Shortcut Handler** (`src/components/LogTrace.tsx:159-180`)
```typescript
// Ctrl+D: Quick debug
if (isActive && e.ctrlKey && e.key === 'd') {
  e.preventDefault();
  setShowInteractivePanel(false);
  setShowDebugModal(true);
  addEvent({
    type: 'debug',
    position: mousePosition,
    element: currentElement ? {
      tag: currentElement.tag,
      id: currentElement.id,
      classes: currentElement.classes,
      text: currentElement.text,
    } : undefined,
  });
}
```

2. **Debug Button Click** (`src/components/LogTrace/InteractivePanel.tsx:45-65`)
```typescript
const handleDebugClick = () => {
  setShowInteractivePanel(false);
  setShowDebugModal(true);
  addEvent({
    type: 'debug',
    position: mousePosition,
    element: currentElement ? {
      tag: currentElement.tag,
      id: currentElement.id,
      classes: currentElement.classes,
      text: currentElement.text,
    } : undefined,
  });
};
```

**Inspect Event Trigger Points:**

1. **Click Handler** (`src/components/LogTrace/MouseOverlay.tsx:35-50`)
```typescript
const handleClick = (e: React.MouseEvent) => {
  if (!isActive) return;
  
  const target = e.target as HTMLElement;
  const elementInfo = getElementInfo(target);
  
  addEvent({
    type: 'inspect',
    position: { x: e.clientX, y: e.clientY },
    element: elementInfo,
  });
  
  if (onElementClick) {
    onElementClick(elementInfo);
  }
};
```

#### Phase 4: Data Flow Analysis

**Debug Event Flow:**
```
User Action (Ctrl+D) 
  → KeyDown Handler (LogTrace.tsx:159)
  → State Updates (setShowDebugModal, setShowInteractivePanel)
  → Event Creation (addEvent with type: 'debug')
  → Event Storage (useEventTracking hook)
  → UI Updates (DebugModal appears, InteractivePanel hides)
```

**Inspect Event Flow:**
```
User Action (Click)
  → MouseOverlay Click Handler
  → Element Info Extraction (getElementInfo)
  → Event Creation (addEvent with type: 'inspect') 
  → Event Storage (useEventTracking hook)
  → Optional Callback Execution (onElementClick)
```

**Shared Infrastructure:**

1. **Event Creation** (`src/shared/hooks/useEventTracking.ts`)
```typescript
const addEvent = (eventData: Omit<LogEvent, 'id' | 'timestamp'>) => {
  const newEvent: LogEvent = {
    ...eventData,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  
  setEvents(prev => [newEvent, ...prev]);
  saveToStorage([newEvent, ...events]);
};
```

2. **Element Information Extraction** (`src/shared/hooks/useElementInspection.ts`)
```typescript
const getElementInfo = (element: HTMLElement): ElementInfo => {
  return {
    tag: element.tagName.toLowerCase(),
    id: element.id || '',
    classes: Array.from(element.classList),
    text: getElementText(element),
  };
};
```

#### Phase 5: Component Relationship Map

**Core Components:**
- `LogTrace.tsx` - Main orchestrator, keyboard handling
- `MouseOverlay.tsx` - Click detection and positioning
- `InteractivePanel.tsx` - Debug button interface
- `DebugModal.tsx` - Debug interface display
- `useEventTracking.ts` - Event storage and management
- `useElementInspection.ts` - Element analysis utilities

**Data Dependencies:**
- Events stored in localStorage via `storage.ts`
- Mouse position tracked via `useLogTrace` hook
- Element information extracted via `useElementInspection`
- Debug responses managed via `useDebugResponses`

### Insights for LLM Communication

**Event Type Dictionary:**
- `debug`: User-initiated debugging session on a specific element
- `inspect`: Element examination during active tracing
- `click`: Basic interaction tracking
- `llm_response`: AI-generated analysis results

**Behavioral Patterns:**
- Debug events often preceded by inspect events (investigation workflow)
- Same coordinates indicate focused analysis on specific UI areas
- Event clustering suggests iterative debugging processes

**Code Navigation Shortcuts:**
- Search for `addEvent` to find all event creation points
- Search for `type: 'debug'` to find debug-specific logic
- Check `useEventTracking` for event management
- Look in `MouseOverlay` for interaction handling

This BackTracing analysis provides a complete understanding of how these two events are generated, processed, and stored, enabling more effective communication with LLMs about the codebase structure and behavior. 