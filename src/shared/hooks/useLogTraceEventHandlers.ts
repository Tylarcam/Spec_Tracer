import { useCallback, useEffect } from 'react';
import { ElementInfo } from '../types';

interface LogTraceEventHandlersProps {
  isActive: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  showInteractivePanel: boolean;
  setMousePosition: (pos: { x: number; y: number }) => void;
  setCurrentElement: (element: ElementInfo | null) => void;
  setShowInteractivePanel: (show: boolean) => void;
  setShowDebugModal: (show: boolean) => void;
  extractElementInfo: (target: HTMLElement) => ElementInfo;
  addEvent: (event: any) => void;
  onElementClick: () => void;
  onDebugFromPanel: () => void;
  onEscape: () => void;
}

export const useLogTraceEventHandlers = ({
  isActive,
  currentElement,
  mousePosition,
  showInteractivePanel,
  setMousePosition,
  setCurrentElement,
  setShowInteractivePanel,
  setShowDebugModal,
  extractElementInfo,
  addEvent,
  onElementClick,
  onDebugFromPanel,
  onEscape,
}: LogTraceEventHandlersProps) => {

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;

    const target = e.target as HTMLElement;
    if (target && 
        !target.closest('#logtrace-overlay') && 
        !target.closest('#logtrace-modal') &&
        !target.closest('[data-interactive-panel]')) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      const elementInfo = extractElementInfo(target);
      setCurrentElement(elementInfo);
      
      // Hide interactive panel when moving to a new element
      if (showInteractivePanel) {
        setShowInteractivePanel(false);
      }
      
      // Don't log move events anymore - only track position
    }
  }, [isActive, extractElementInfo, setMousePosition, setCurrentElement, showInteractivePanel, setShowInteractivePanel]);

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
        } : undefined,
      });
    }
  }, [isActive, currentElement, addEvent]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isActive && e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      setShowInteractivePanel(false);
      setShowDebugModal(true);
      addEvent({
        type: 'debug',
        position: mousePosition,
        element: currentElement ? {
          tag: currentElement.tag,
          id: currentElement.id,
          classes: currentElement.classes,
          text: currentElement.text,
        } : undefined,
      });
    }
    if (e.key === 'Escape') {
      onEscape();
    }
  }, [isActive, mousePosition, currentElement, addEvent, setShowDebugModal, setShowInteractivePanel, onEscape]);

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, handleKeyDown]);

  return {
    handleMouseMove,
    handleClick,
    handleElementClick: onElementClick,
    handleDebugFromPanel: onDebugFromPanel,
  };
};