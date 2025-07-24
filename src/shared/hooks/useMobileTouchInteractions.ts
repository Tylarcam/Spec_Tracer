
import { useCallback, useRef, useState, useEffect } from 'react';
import { ElementInfo } from '../types';

interface TouchInteractionState {
  touchStartTime: number;
  lastTapTime: number;
}

interface UseMobileTouchInteractionsProps {
  isTraceActive: boolean;
  extractElementDetails: (target: HTMLElement) => ElementInfo;
  recordEvent: (event: any) => void;
  setDetectedElement: (element: ElementInfo | null) => void;
  setCursorPosition: (pos: { x: number; y: number }) => void;
  onElementClick: () => void;
}

export const useMobileTouchInteractions = ({
  isTraceActive,
  extractElementDetails,
  recordEvent,
  setDetectedElement,
  setCursorPosition,
  onElementClick,
}: UseMobileTouchInteractionsProps) => {
  const [touchState, setTouchState] = useState<TouchInteractionState>({
    touchStartTime: 0,
    lastTapTime: 0,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isTraceActive) return;

    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    
    // Skip LogTrace UI elements
    if (target.closest('#logtrace-overlay') || 
        target.closest('#logtrace-modal') ||
        target.closest('[data-interactive-panel]') ||
        target.closest('[data-quick-actions]') ||
        target.closest('[data-inspector-panel]')) {
      return;
    }

    const now = Date.now();
    const position = { x: touch.clientX, y: touch.clientY };

    setTouchState(prev => ({
      ...prev,
      touchStartTime: now,
    }));

    // Set cursor position and detect element on touch start
    setCursorPosition(position);
    const element = extractElementDetails(target);
    setDetectedElement(element);
  }, [isTraceActive, setCursorPosition, extractElementDetails, setDetectedElement]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isTraceActive) return;

    const touch = e.changedTouches[0];
    const target = e.target as HTMLElement;
    const position = { x: touch.clientX, y: touch.clientY };
    
    // Skip LogTrace UI elements
    if (target.closest('#logtrace-overlay') || 
        target.closest('#logtrace-modal') ||
        target.closest('[data-interactive-panel]') ||
        target.closest('[data-quick-actions]') ||
        target.closest('[data-inspector-panel]')) {
      return;
    }

    const element = extractElementDetails(target);
    
    // Record the touch event
    recordEvent({
      id: crypto.randomUUID(),
      type: 'tap',
      timestamp: new Date().toISOString(),
      position,
      element: {
        tag: element.tag,
        id: element.id,
        classes: element.classes,
        text: element.text,
        parentPath: element.parentPath,
        attributes: element.attributes,
        size: element.size,
      },
    });

    // Trigger element click handler
    onElementClick();
  }, [isTraceActive, extractElementDetails, recordEvent, onElementClick]);

  return {
    handleTouchStart,
    handleTouchEnd,
  };
};
