
import { useCallback, useEffect, useRef } from 'react';
import { ElementInfo, LogEvent, QuickActionType } from '../types';
import { useMobileTouchInteractions } from './useMobileTouchInteractions';
import { useIsMobile } from '@/hooks/use-mobile';

interface UseInteractionHandlersProps {
  isTraceActive: boolean;
  isHoverPaused: boolean;
  detectedElement: ElementInfo | null;
  cursorPosition: { x: number; y: number };
  showInteractivePanel: boolean;
  setCursorPosition: (pos: { x: number; y: number }) => void;
  setDetectedElement: (element: ElementInfo | null) => void;
  setShowInteractivePanel: (show: boolean) => void;
  setShowAIDebugModal: (show: boolean) => void;
  extractElementDetails: (target: HTMLElement) => ElementInfo;
  recordEvent: (event: Omit<LogEvent, 'id' | 'timestamp'>) => void;
  handleEscapeKey: () => void;
  onElementClick?: () => void;
  onQuickAction?: (action: QuickActionType) => void;
}

export const useInteractionHandlers = ({
  isTraceActive,
  isHoverPaused,
  detectedElement,
  cursorPosition,
  showInteractivePanel,
  setCursorPosition,
  setDetectedElement,
  setShowInteractivePanel,
  setShowAIDebugModal,
  extractElementDetails,
  recordEvent,
  handleEscapeKey,
  onElementClick,
  onQuickAction,
}: UseInteractionHandlersProps) => {
  const isMobile = useIsMobile();
  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const THROTTLE_DELAY = 16; // ~60fps

  // Mobile touch interaction handlers - simplified to single tap only
  const handleMobileSingleTap = useCallback((element: ElementInfo | null, position: { x: number; y: number }) => {
    if (element) {
      setCursorPosition(position);
      setDetectedElement(element);
      
      recordEvent({
        type: 'tap',
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
    }
  }, [setCursorPosition, setDetectedElement, recordEvent]);

  const {
    handleTouchStart,
    handleTouchEnd,
  } = useMobileTouchInteractions({
    isActive: isTraceActive && isMobile,
    onSingleTap: handleMobileSingleTap,
    extractElementDetails,
  });

  // Throttled cursor movement handler using requestAnimationFrame
  const handleCursorMovement = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTraceActive || isHoverPaused || isMobile) return;

    const now = Date.now();
    if (now - lastUpdateRef.current < THROTTLE_DELAY) {
      // Cancel any pending update
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Schedule new update
      rafRef.current = requestAnimationFrame(() => {
        lastUpdateRef.current = now;
        updateCursorState(e);
      });
      return;
    }

    lastUpdateRef.current = now;
    updateCursorState(e);
  }, [isTraceActive, isHoverPaused, isMobile]);

  const updateCursorState = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target && 
        !target.closest('#logtrace-overlay') && 
        !target.closest('#logtrace-modal') &&
        !target.closest('[data-interactive-panel]')) {
      
      // Check if cursor is over any inspector panel
      const inspectorPanels = document.querySelectorAll('[data-inspector-panel]');
      let isOverInspector = false;
      
      inspectorPanels.forEach(panel => {
        const rect = panel.getBoundingClientRect();
        if (e.clientX >= rect.left && 
            e.clientX <= rect.right && 
            e.clientY >= rect.top && 
            e.clientY <= rect.bottom) {
          isOverInspector = true;
        }
      });
      
      // Only update element highlighting if cursor is not over an inspector panel
      if (!isOverInspector) {
        setCursorPosition({ x: e.clientX, y: e.clientY });
        const elementInfo = extractElementDetails(target);
        setDetectedElement(elementInfo);
        
        if (showInteractivePanel) {
          setShowInteractivePanel(false);
        }
      }
    }
  }, [extractElementDetails, setCursorPosition, setDetectedElement, showInteractivePanel, setShowInteractivePanel]);

  const handleElementClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTraceActive || isMobile) return;
    
    const target = e.target as HTMLElement;
    
    // Skip if clicking on LogTrace UI elements
    if (target && (
        target.closest('#logtrace-overlay') || 
        target.closest('#logtrace-modal') ||
        target.closest('[data-interactive-panel]') ||
        target.closest('[data-quick-actions]') ||
        target.closest('[data-inspector-panel]')
    )) {
      return;
    }

    // Only proceed if we have a detected element and the click is on a highlighted element
    if (detectedElement && detectedElement.element) {
      const elementRect = detectedElement.element.getBoundingClientRect();
      const clickX = e.clientX;
      const clickY = e.clientY;
      
      // Check if click is within the highlighted element's bounds
      if (clickX >= elementRect.left && 
          clickX <= elementRect.right && 
          clickY >= elementRect.top && 
          clickY <= elementRect.bottom) {
        
        // Prevent default behavior for element inspection
        e.preventDefault();
        e.stopPropagation();
        
        // Record the click event
        recordEvent({
          type: 'click',
          position: { x: e.clientX, y: e.clientY },
          element: {
            tag: detectedElement.tag,
            id: detectedElement.id,
            classes: detectedElement.classes,
            text: detectedElement.text,
            parentPath: detectedElement.parentPath,
            attributes: detectedElement.attributes,
            size: detectedElement.size,
          },
        });
        
        // Trigger the element inspection
        if (onElementClick) {
          onElementClick();
        }
      }
    }
  }, [isTraceActive, isMobile, detectedElement, recordEvent, onElementClick]);

  const handleKeyboardInput = useCallback((e: KeyboardEvent) => {
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }
    
    // Only keep Escape key for closing modals/overlays
    if (e.key === 'Escape') {
      handleEscapeKey();
    }
  }, [handleEscapeKey]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardInput);
    return () => {
      document.removeEventListener('keydown', handleKeyboardInput);
      // Clean up any pending animation frames
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleKeyboardInput]);

  return {
    handleCursorMovement,
    handleElementClick,
    handleTouchStart: isMobile ? handleTouchStart : undefined,
    handleTouchEnd: isMobile ? handleTouchEnd : undefined,
  };
};
