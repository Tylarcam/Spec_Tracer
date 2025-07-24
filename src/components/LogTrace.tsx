
import React, { useEffect, useRef, useState } from 'react';
import { useLogTraceOrchestrator } from '@/shared/hooks/useLogTraceOrchestrator';
import { useInteractionHandlers } from '@/shared/hooks/useInteractionHandlers';
import { useIsMobile } from '@/hooks/use-mobile';
import MouseOverlay from './LogTrace/MouseOverlay';
import ElementInspector from './LogTrace/ElementInspector';
import DebugModal from './LogTrace/DebugModal';
import TabbedTerminal from './LogTrace/TabbedTerminal';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';

interface LogTraceProps {
  captureActive: boolean;
  onCaptureToggle: (active: boolean) => void;
}

const LogTrace: React.FC<LogTraceProps> = ({ 
  captureActive, 
  onCaptureToggle 
}) => {
  const isMobile = useIsMobile();
  const [showTerminal, setShowTerminal] = useState(false);
  const [showElementInspector, setShowElementInspector] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(400);
  
  const orchestrator = useLogTraceOrchestrator();
  const { debugResponses, clearDebugResponses } = useDebugResponses();

  const {
    isTraceActive,
    setIsTraceActive,
    cursorPosition,
    setCursorPosition,
    detectedElement,
    setDetectedElement,
    showAIDebugModal,
    setShowAIDebugModal,
    capturedEvents,
    isAIAnalyzing,
    recordEvent,
    extractElementDetails,
    analyzeElementWithAI,
    clearCapturedEvents,
    exportCapturedEvents,
    generateElementPrompt,
    overlayRef,
    modalRef,
  } = orchestrator;

  // Handle escape key functionality
  const handleEscapeKey = () => {
    if (showAIDebugModal) {
      setShowAIDebugModal(false);
    } else if (showElementInspector) {
      setShowElementInspector(false);
    } else if (detectedElement) {
      setDetectedElement(null);
    }
  };

  // Handle element click for inspection
  const handleElementClick = () => {
    if (detectedElement) {
      setShowElementInspector(true);
    }
  };

  // Set up interaction handlers
  const {
    handleCursorMovement,
    handleElementClick: handleElementClickEvent,
    handleTouchStart,
    handleTouchEnd,
  } = useInteractionHandlers({
    isTraceActive,
    isHoverPaused,
    detectedElement,
    cursorPosition,
    showInteractivePanel: showElementInspector,
    setCursorPosition,
    setDetectedElement,
    setShowInteractivePanel: setShowElementInspector,
    setShowAIDebugModal,
    extractElementDetails,
    recordEvent,
    handleEscapeKey,
    onElementClick: handleElementClick,
  });

  // Sync capture state with parent
  useEffect(() => {
    setIsTraceActive(captureActive);
  }, [captureActive, setIsTraceActive]);

  useEffect(() => {
    onCaptureToggle(isTraceActive);
  }, [isTraceActive, onCaptureToggle]);

  // Set up DOM event listeners
  useEffect(() => {
    if (!isTraceActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleCursorMovement(e as any);
    };

    const handleClick = (e: MouseEvent) => {
      handleElementClickEvent(e as any);
    };

    const handleTouchStartEvent = (e: TouchEvent) => {
      if (handleTouchStart) {
        handleTouchStart(e as any);
      }
    };

    const handleTouchEndEvent = (e: TouchEvent) => {
      if (handleTouchEnd) {
        handleTouchEnd(e as any);
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    
    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStartEvent);
      document.addEventListener('touchend', handleTouchEndEvent);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      
      if (isMobile) {
        document.removeEventListener('touchstart', handleTouchStartEvent);
        document.removeEventListener('touchend', handleTouchEndEvent);
      }
    };
  }, [isTraceActive, handleCursorMovement, handleElementClickEvent, handleTouchStart, handleTouchEnd, isMobile]);

  console.log('LogTrace rendering with capturedEvents:', capturedEvents?.length || 0);

  return (
    <div className="relative w-full h-full">
      {/* Mouse Overlay for element detection */}
      <MouseOverlay 
        isActive={isTraceActive}
        currentElement={detectedElement}
        mousePosition={cursorPosition}
        overlayRef={overlayRef}
        inspectorCount={0}
      />

      {/* Element Inspector - shows on click */}
      <ElementInspector 
        isVisible={showElementInspector}
        currentElement={detectedElement}
        mousePosition={cursorPosition}
        onDebug={() => setShowAIDebugModal(true)}
        onClose={() => {
          setShowElementInspector(false);
          setDetectedElement(null);
        }}
        onShowMoreDetails={() => {}}
      />

      {/* AI Debug Modal */}
      <DebugModal 
        showDebugModal={showAIDebugModal}
        setShowDebugModal={setShowAIDebugModal}
        currentElement={detectedElement}
        mousePosition={cursorPosition}
        isAnalyzing={isAIAnalyzing}
        analyzeWithAI={analyzeElementWithAI}
        generateAdvancedPrompt={generateElementPrompt}
        modalRef={modalRef}
      />

      {/* Terminal Panel */}
      <div className={`fixed bottom-0 left-0 right-0 ${showTerminal ? `h-[${terminalHeight}px]` : 'h-auto'} z-40 transition-all duration-300 ease-in-out`}>
        <TabbedTerminal
          showTerminal={showTerminal}
          setShowTerminal={setShowTerminal}
          events={capturedEvents || []}
          exportEvents={exportCapturedEvents}
          clearEvents={clearCapturedEvents}
          debugResponses={debugResponses}
          clearDebugResponses={clearDebugResponses}
          currentElement={detectedElement}
          terminalHeight={terminalHeight}
        />
      </div>
    </div>
  );
};

export default LogTrace;
