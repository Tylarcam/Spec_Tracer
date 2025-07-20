
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
  warnOnExit: boolean;
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
