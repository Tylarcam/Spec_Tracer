
import { useCallback, useEffect, useRef } from 'react';
import { ElementInfo, LogEvent, QuickActionType } from '../types';
import { useMobileTouchInteractions } from './useMobileTouchInteractions';

interface InteractionHandlersProps {
  isTraceActive: boolean;
  isHoverPaused: boolean;
  detectedElement: ElementInfo | null;
  cursorPosition: { x: number; y: number };
  showInteractivePanel: boolean;
  setCursorPosition: (pos: { x: number; y: number }) => void;
  setDetectedElement: (element: ElementInfo | null) => void;
  setShowInteractivePanel: (show: boolean) => void;
  setShowAIDebugModal: (show: boolean) => void;
  extractElementDetails: (element: HTMLElement) => ElementInfo;
  recordEvent: (event: LogEvent) => void;
  handleEscapeKey: () => void;
  onElementClick: () => void;
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
}: InteractionHandlersProps) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const lastClickedElement = useRef<HTMLElement | null>(null);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  // Mobile touch interactions
  const { handleTouchStart, handleTouchEnd } = useMobileTouchInteractions({
    isTraceActive,
    extractElementDetails,
    recordEvent,
    setDetectedElement,
    setCursorPosition,
    onElementClick,
  });

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleEscapeKey();
      }
    };

    if (isTraceActive) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTraceActive, handleEscapeKey]);

  // Right-click context menu handler - optimized with useCallback
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTraceActive) return;

    const target = e.target as HTMLElement;
    
    // Skip if right-clicking on LogTrace UI elements
    if (target && (
        target.closest('#logtrace-overlay') ||
        target.closest('#logtrace-modal') ||
        target.closest('[data-interactive-panel]') ||
        target.closest('[data-inspector-panel]')
    )) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Update cursor position and detected element
    setCursorPosition({ x: e.clientX, y: e.clientY });
    const elementInfo = extractElementDetails(target);
    setDetectedElement(elementInfo);

    // Show the interactive panel with quick actions
    setShowInteractivePanel(true);

    // Record the right-click event
    recordEvent({
      id: crypto.randomUUID(),
      type: 'click',
      timestamp: new Date().toISOString(),
      position: { x: e.clientX, y: e.clientY },
      element: {
        tag: elementInfo.tag,
        id: elementInfo.id,
        classes: elementInfo.classes,
        text: elementInfo.text,
        parentPath: elementInfo.parentPath,
        attributes: elementInfo.attributes,
        size: elementInfo.size,
      },
    });
  }, [isTraceActive, setCursorPosition, extractElementDetails, setDetectedElement, setShowInteractivePanel, recordEvent]);

  // Cursor movement handler - optimized with useCallback
  const handleCursorMovement = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTraceActive || isHoverPaused) return;

    const target = e.target as HTMLElement;
    
    // Skip if cursor is over LogTrace UI elements or inspector panels
    if (target && 
        !target.closest('#logtrace-overlay') && 
        !target.closest('#logtrace-modal') &&
        !target.closest('[data-interactive-panel]') &&
        !target.closest('[data-inspector-panel]')) {
      
      setCursorPosition({ x: e.clientX, y: e.clientY });
      const elementInfo = extractElementDetails(target);
      setDetectedElement(elementInfo);
    }
  }, [extractElementDetails, setCursorPosition, setDetectedElement, isTraceActive, isHoverPaused]);

  // Element click handler - optimized with useCallback
  const handleElementClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTraceActive || isMobile) return;

    const target = e.target as HTMLElement;
    
    // Skip if clicking on LogTrace UI elements or inspector panels
    if (target && (
        target.closest('#logtrace-overlay') ||
        target.closest('#logtrace-modal') ||
        target.closest('[data-interactive-panel]') ||
        target.closest('[data-inspector-panel]') ||
        target.closest('[data-close-button]')
    )) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (detectedElement) {
      // Clear any existing timeout
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
      }

      // Set a small timeout to prevent double-clicks
      clickTimeout.current = setTimeout(() => {
        // Check if this is a different element than the last clicked one
        if (lastClickedElement.current !== detectedElement.element) {
          lastClickedElement.current = detectedElement.element;
          
          // Record the click event
          recordEvent({
            id: crypto.randomUUID(),
            type: 'click',
            timestamp: new Date().toISOString(),
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

          // Trigger the element click handler (opens inspector)
          onElementClick();
        }
      }, 100);
    }
  }, [isTraceActive, isMobile, detectedElement, recordEvent, onElementClick]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
      }
    };
  }, []);

  return {
    handleCursorMovement,
    handleElementClick,
    handleContextMenu,
    handleTouchStart: isMobile ? handleTouchStart : undefined,
    handleTouchEnd: isMobile ? handleTouchEnd : undefined,
  };
};
