
import { useCallback, useRef, useState, useEffect } from 'react';
import { ElementInfo } from '../types';

interface TouchInteractionState {
  isDoubleTapDetected: boolean;
  isLongPressActive: boolean;
  longPressStartPosition: { x: number; y: number } | null;
  touchStartTime: number;
  lastTapTime: number;
  tapCount: number;
}

interface UseMobileTouchInteractionsProps {
  isActive: boolean;
  onDoubleTap: (element: ElementInfo | null, position: { x: number; y: number }) => void;
  onLongPressStart: (element: ElementInfo | null, position: { x: number; y: number }) => void;
  onLongPressEnd: (selectedAction: string | null) => void;
  onTouchMove: (position: { x: number; y: number }) => void;
  extractElementDetails: (target: HTMLElement) => ElementInfo;
}

export const useMobileTouchInteractions = ({
  isActive,
  onDoubleTap,
  onLongPressStart,
  onLongPressEnd,
  onTouchMove,
  extractElementDetails,
}: UseMobileTouchInteractionsProps) => {
  const [touchState, setTouchState] = useState<TouchInteractionState>({
    isDoubleTapDetected: false,
    isLongPressActive: false,
    longPressStartPosition: null,
    touchStartTime: 0,
    lastTapTime: 0,
    tapCount: 0,
  });

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const DOUBLE_TAP_DELAY = 300; // ms
  const LONG_PRESS_DELAY = 500; // ms
  const TOUCH_MOVE_THRESHOLD = 10; // px

  const clearTimers = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (doubleTapTimerRef.current) {
      clearTimeout(doubleTapTimerRef.current);
      doubleTapTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isActive) return;

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
      longPressStartPosition: position,
    }));

    // Long press detection
    longPressTimerRef.current = setTimeout(() => {
      const element = extractElementDetails(target);
      setTouchState(prev => ({ ...prev, isLongPressActive: true }));
      onLongPressStart(element, position);
    }, LONG_PRESS_DELAY);

    // Double tap detection
    if (now - touchState.lastTapTime < DOUBLE_TAP_DELAY) {
      clearTimers();
      const element = extractElementDetails(target);
      setTouchState(prev => ({ 
        ...prev, 
        isDoubleTapDetected: true,
        tapCount: 0,
        lastTapTime: 0 
      }));
      onDoubleTap(element, position);
    } else {
      setTouchState(prev => ({ 
        ...prev, 
        lastTapTime: now,
        tapCount: 1 
      }));
      
      doubleTapTimerRef.current = setTimeout(() => {
        setTouchState(prev => ({ ...prev, tapCount: 0 }));
      }, DOUBLE_TAP_DELAY);
    }
  }, [isActive, touchState.lastTapTime, extractElementDetails, onDoubleTap, onLongPressStart, clearTimers]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isActive || !touchState.isLongPressActive) return;

    const touch = e.touches[0];
    const position = { x: touch.clientX, y: touch.clientY };

    // Check if user moved too far from start position
    if (touchState.longPressStartPosition) {
      const deltaX = Math.abs(position.x - touchState.longPressStartPosition.x);
      const deltaY = Math.abs(position.y - touchState.longPressStartPosition.y);
      
      if (deltaX > TOUCH_MOVE_THRESHOLD || deltaY > TOUCH_MOVE_THRESHOLD) {
        onTouchMove(position);
      }
    }
  }, [isActive, touchState.isLongPressActive, touchState.longPressStartPosition, onTouchMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isActive) return;

    clearTimers();

    if (touchState.isLongPressActive) {
      // Determine which action was selected based on final touch position
      const touch = e.changedTouches[0];
      const elementAtPosition = document.elementFromPoint(touch.clientX, touch.clientY);
      
      let selectedAction: string | null = null;
      if (elementAtPosition?.closest('[data-quick-action]')) {
        selectedAction = elementAtPosition.closest('[data-quick-action]')?.getAttribute('data-action') || null;
      }
      
      onLongPressEnd(selectedAction);
    }

    setTouchState(prev => ({
      ...prev,
      isLongPressActive: false,
      longPressStartPosition: null,
      isDoubleTapDetected: false,
    }));
  }, [isActive, touchState.isLongPressActive, onLongPressEnd, clearTimers]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isLongPressActive: touchState.isLongPressActive,
    isDoubleTapDetected: touchState.isDoubleTapDetected,
  };
};
