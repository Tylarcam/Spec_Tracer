
/**
 * Shared types for LogTrace
 */

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
  parentPath?: string; // DOM hierarchy path, e.g., 'form.checkout-form > div.flex > button.submit-btn'
  attributes?: { name: string; value: string }[];
  size?: { width: number; height: number };
}

export interface LogTraceSettings {
  maxEvents: number;
  autoSave: boolean;
  highlightColor: string;
  showElementPath: boolean;
  enableKeyboardShortcuts: boolean;
  theme: 'dark' | 'light';
  apiKey?: string;
  debugMode: boolean;
  learningAssistantMode: boolean;
}

export interface DebugContext {
  element: ElementInfo | null;
  position: { x: number; y: number };
  events: LogEvent[];
  settings: LogTraceSettings;
}

export interface PinnedDetail {
  id: string;
  element: ElementInfo;
  position: { x: number; y: number };
  pinnedAt: { x: number; y: number };
}

// Enhanced ConsoleLog interface for better type safety
export interface ConsoleLog {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: string;
  stack?: string;
  associatedElement?: string;
  level?: 'log' | 'warn' | 'error' | 'info';
  element?: ElementInfo;
}

// Type for filtered console logs (only errors and warnings)
export interface FilteredConsoleLog {
  type: 'error' | 'warn';
  message: string;
  timestamp: string;
  stack?: string;
  associatedElement?: string;
}

// Quick action types
export type QuickActionType = "debug" | "screenshot" | "copy" | "context" | "details";

// Context action types for extension compatibility
export type ContextAction = {
  type: "context";
  mode: string;
  input: string;
};

export type ExtendedActionType = QuickActionType | ContextAction;
