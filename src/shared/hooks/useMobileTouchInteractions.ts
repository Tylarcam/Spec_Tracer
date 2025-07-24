
import { useCallback, useRef, useState, useEffect } from 'react';
import { ElementInfo } from '../types';

interface TouchInteractionState {
  touchStartTime: number;
  lastTapTime: number;
}

interface UseMobileTouchInteractionsProps {
  isActive: boolean;
  onSingleTap: (element: ElementInfo | null, position: { x: number; y: number }) => void;
  extractElementDetails: (target: HTMLElement) => ElementInfo;
}

export const useMobileTouchInteractions = ({
  isActive,
  onSingleTap,
  extractElementDetails,
}: UseMobileTouchInteractionsProps) => {
  const [touchState, setTouchState] = useState<TouchInteractionState>({
    touchStartTime: 0,
    lastTapTime: 0,
  });

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
    }));
  }, [isActive]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isActive) return;

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
    onSingleTap(element, position);
  }, [isActive, extractElementDetails, onSingleTap]);

  return {
    handleTouchStart,
    handleTouchEnd,
  };
};
