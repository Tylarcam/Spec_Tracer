/**
 * Hook for handling mouse and keyboard interactions during LogTrace sessions
 * Manages cursor tracking, element detection, and user input events
 */

import { useCallback, useEffect } from 'react';
import { ElementInfo, LogEvent } from '../types';

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
}: UseInteractionHandlersProps) => {

  const handleCursorMovement = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTraceActive || isHoverPaused) return;

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
  }, [isTraceActive, isHoverPaused, extractElementDetails, setCursorPosition, setDetectedElement, showInteractivePanel, setShowInteractivePanel]);

  const handleElementClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTraceActive) return;
    
    const target = e.target as HTMLElement;
    if (target && 
        !target.closest('#logtrace-overlay') && 
        !target.closest('#logtrace-modal') &&
        !target.closest('[data-interactive-panel]') &&
        !target.closest('[data-quick-actions]')) {
      e.preventDefault();
      
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
      
      // Only allow element inspector creation if cursor is not over an inspector panel
      if (!isOverInspector) {
        // Check if the click is on the currently highlighted element
        if (detectedElement && detectedElement.element) {
          const elementRect = detectedElement.element.getBoundingClientRect();
          const clickX = e.clientX;
          const clickY = e.clientY;
          
          // Check if click is within the highlighted element's bounds
          if (clickX >= elementRect.left && 
              clickX <= elementRect.right && 
              clickY >= elementRect.top && 
              clickY >= elementRect.bottom) {
            // This is a click on the highlighted element - trigger element inspector
            if (onElementClick) {
              onElementClick();
            }
          }
        }
      }
      
      recordEvent({
        type: 'click',
        position: { x: e.clientX, y: e.clientY },
        element: detectedElement ? {
          tag: detectedElement.tag,
          id: detectedElement.id,
          classes: detectedElement.classes,
          text: detectedElement.text,
          parentPath: detectedElement.parentPath,
          attributes: detectedElement.attributes,
          size: detectedElement.size,
        } : undefined,
      });
    }
  }, [isTraceActive, detectedElement, recordEvent, onElementClick]);

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
  };
};
