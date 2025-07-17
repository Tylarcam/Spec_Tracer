import { useCallback, useEffect } from 'react';
import { ElementInfo, LogEvent } from '../types';

interface UseLogTraceEventHandlersProps {
  isActive: boolean;
  isHoverPaused: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  showInteractivePanel: boolean;
  setMousePosition: (pos: { x: number; y: number }) => void;
  setCurrentElement: (element: ElementInfo | null) => void;
  setShowInteractivePanel: (show: boolean) => void;
  setShowDebugModal: (show: boolean) => void;
  extractElementInfo: (target: HTMLElement) => ElementInfo;
  addEvent: (event: Omit<LogEvent, 'id' | 'timestamp'>) => void;
  handleEscape: () => void;
}

export const useLogTraceEventHandlers = ({
  isActive,
  isHoverPaused,
  currentElement,
  mousePosition,
  showInteractivePanel,
  setMousePosition,
  setCurrentElement,
  setShowInteractivePanel,
  setShowDebugModal,
  extractElementInfo,
  addEvent,
  handleEscape,
}: UseLogTraceEventHandlersProps) => {

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || isHoverPaused) return;

    const target = e.target as HTMLElement;
    if (target && 
        !target.closest('#logtrace-overlay') && 
        !target.closest('#logtrace-modal') &&
        !target.closest('[data-interactive-panel]')) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      const elementInfo = extractElementInfo(target);
      setCurrentElement(elementInfo);
      
      if (showInteractivePanel) {
        setShowInteractivePanel(false);
      }
    }
  }, [isActive, isHoverPaused, extractElementInfo, setMousePosition, setCurrentElement, showInteractivePanel, setShowInteractivePanel]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    
    const target = e.target as HTMLElement;
    if (target && 
        !target.closest('#logtrace-overlay') && 
        !target.closest('#logtrace-modal') &&
        !target.closest('[data-interactive-panel]')) {
      e.preventDefault();
      
      addEvent({
        type: 'click',
        position: { x: e.clientX, y: e.clientY },
        element: currentElement ? {
          tag: currentElement.tag,
          id: currentElement.id,
          classes: currentElement.classes,
          text: currentElement.text,
          parentPath: currentElement.parentPath,
          attributes: currentElement.attributes,
          size: currentElement.size,
        } : undefined,
      });
    }
  }, [isActive, currentElement, addEvent]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }
    
    // Only keep Escape key for closing modals/overlays
    if (e.key === 'Escape') {
      handleEscape();
    }
  }, [handleEscape]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    handleMouseMove,
    handleClick,
  };
};
