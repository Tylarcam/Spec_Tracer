
/**
 * Shared types for LogTrace
 */

export interface LogEvent {
  id: string;
  type: 'move' | 'click' | 'debug' | 'llm_response';
  timestamp: string;
  position?: { x: number; y: number };
  element?: {
    tag: string;
    id: string;
    classes: string[];
    text: string;
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
}

export interface LogTraceSettings {
  apiKey?: string;
  autoSave: boolean;
  maxEvents: number;
  debugMode: boolean;
}

export interface DebugContext {
  element: ElementInfo | null;
  position: { x: number; y: number };
  events: LogEvent[];
  settings: LogTraceSettings;
}
