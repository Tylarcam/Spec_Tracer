
/**
 * Hook for handling mouse and keyboard interactions during LogTrace sessions
 * Manages cursor tracking, element detection, and user input events
 */

import { useCallback, useEffect } from 'react';
import { ElementInfo, LogEvent } from '../types';
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
  onQuickAction?: (action: string, element: ElementInfo | null) => void;
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

  // Mobile touch interaction handlers
  const handleMobileDoubleTap = useCallback((element: ElementInfo | null, position: { x: number; y: number }) => {
    if (element && onElementClick) {
      setCursorPosition(position);
      setDetectedElement(element);
      onElementClick();
      
      recordEvent({
        type: 'inspect',
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
  }, [onElementClick, setCursorPosition, setDetectedElement, recordEvent]);

  const handleMobileLongPressStart = useCallback((element: ElementInfo | null, position: { x: number; y: number }) => {
    if (element) {
      setCursorPosition(position);
      setDetectedElement(element);
    }
  }, [setCursorPosition, setDetectedElement]);

  const handleMobileLongPressEnd = useCallback((selectedAction: string | null) => {
    if (selectedAction && detectedElement && onQuickAction) {
      onQuickAction(selectedAction, detectedElement);
    }
  }, [detectedElement, onQuickAction]);

  const handleMobileTouchMove = useCallback((position: { x: number; y: number }) => {
    setCursorPosition(position);
  }, [setCursorPosition]);

  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isLongPressActive,
    isDoubleTapDetected,
  } = useMobileTouchInteractions({
    isActive: isTraceActive && isMobile,
    onDoubleTap: handleMobileDoubleTap,
    onLongPressStart: handleMobileLongPressStart,
    onLongPressEnd: handleMobileLongPressEnd,
    onTouchMove: handleMobileTouchMove,
    extractElementDetails,
  });

  const handleCursorMovement = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTraceActive || isHoverPaused || isMobile) return;

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
  }, [isTraceActive, isHoverPaused, isMobile, extractElementDetails, setCursorPosition, setDetectedElement, showInteractivePanel, setShowInteractivePanel]);

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
    return () => document.removeEventListener('keydown', handleKeyboardInput);
  }, [handleKeyboardInput]);

  return {
    handleCursorMovement,
    handleElementClick,
    handleTouchStart: isMobile ? handleTouchStart : undefined,
    handleTouchMove: isMobile ? handleTouchMove : undefined,
    handleTouchEnd: isMobile ? handleTouchEnd : undefined,
    isLongPressActive,
    isDoubleTapDetected,
  };
};
