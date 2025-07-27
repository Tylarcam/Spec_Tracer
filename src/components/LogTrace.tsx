
import React, { useEffect, useRef, useState } from 'react';
import { useLogTraceOrchestrator } from '@/shared/hooks/useLogTraceOrchestrator';
import { useInteractionHandlers } from '@/shared/hooks/useInteractionHandlers';
import { useMultipleInspectors } from '@/shared/hooks/useMultipleInspectors';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Terminal } from 'lucide-react';
import NavBar from './NavBar';
import InstructionsCard from './LogTrace/InstructionsCard';
import MouseOverlay from './LogTrace/MouseOverlay';
import ElementInspector from './LogTrace/ElementInspector';
import DebugModal from './LogTrace/DebugModal';
import TabbedTerminal from './LogTrace/TabbedTerminal';
import InteractivePanel from './LogTrace/InteractivePanel';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';

interface LogTraceProps {
  captureActive: boolean;
  onCaptureToggle: (active: boolean) => void;
  onEventCountChange?: (count: number) => void;
}

const LogTrace: React.FC<LogTraceProps> = ({ 
  captureActive, 
  onCaptureToggle,
  onEventCountChange 
}) => {
  const isMobile = useIsMobile();
  const [showTerminal, setShowTerminal] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [showInteractivePanel, setShowInteractivePanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(400);
  
  const orchestrator = useLogTraceOrchestrator();
  const { debugResponses, clearDebugResponses } = useDebugResponses();
  const { inspectors, addInspector, removeInspector, bringToFront, clearAllInspectors } = useMultipleInspectors();

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

  // Create refs for panels
  const interactivePanelRef = useRef<HTMLDivElement>(null);

  // Sync event count with parent component
  useEffect(() => {
    if (onEventCountChange) {
      onEventCountChange(capturedEvents?.length || 0);
    }
  }, [capturedEvents, onEventCountChange]);

  // Handle escape key functionality
  const handleEscapeKey = () => {
    if (showAIDebugModal) {
      setShowAIDebugModal(false);
    } else if (showInteractivePanel) {
      setShowInteractivePanel(false);
    } else if (inspectors.length > 0) {
      // Close most recent inspector
      const mostRecent = inspectors.reduce((latest, current) => 
        current.createdAt > latest.createdAt ? current : latest
      );
      removeInspector(mostRecent.id);
    } else if (detectedElement) {
      setDetectedElement(null);
    }
  };

  // Handle element click for inspection
  const handleElementClick = () => {
    if (detectedElement) {
      addInspector(detectedElement, cursorPosition);
    }
  };

  // Set up interaction handlers
  const {
    handleCursorMovement,
    handleElementClick: handleElementClickEvent,
    handleContextMenu,
    handleTouchStart,
    handleTouchEnd,
  } = useInteractionHandlers({
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
    onElementClick: handleElementClick,
  });

  // Fix: Sync capture state with parent WITHOUT creating circular dependency
  useEffect(() => {
    if (captureActive !== isTraceActive) {
      setIsTraceActive(captureActive);
    }
  }, [captureActive, isTraceActive, setIsTraceActive]);

  // Set up DOM event listeners
  useEffect(() => {
    if (!isTraceActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleCursorMovement(e as any);
    };

    const handleClick = (e: MouseEvent) => {
      handleElementClickEvent(e as any);
    };

    const handleRightClick = (e: MouseEvent) => {
      handleContextMenu(e as any);
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
    document.addEventListener('contextmenu', handleRightClick);
    
    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStartEvent);
      document.addEventListener('touchend', handleTouchEndEvent);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleRightClick);
      
      if (isMobile) {
        document.removeEventListener('touchstart', handleTouchStartEvent);
        document.removeEventListener('touchend', handleTouchEndEvent);
      }
    };
  }, [isTraceActive, handleCursorMovement, handleElementClickEvent, handleContextMenu, handleTouchStart, handleTouchEnd, isMobile]);

  // Clear all inspectors when trace is deactivated
  useEffect(() => {
    if (!isTraceActive) {
      clearAllInspectors();
      setShowInteractivePanel(false);
    }
  }, [isTraceActive, clearAllInspectors]);

  console.log('LogTrace rendering with capturedEvents:', capturedEvents?.length || 0);

  return (
    <div className="relative w-full h-full">
      {/* Universal Control Panel in NavBar */}
      <NavBar
        isTracing={isTraceActive}
        isHoverEnabled={!isHoverPaused}
        onToggleTracing={() => onCaptureToggle(!isTraceActive)}
        onToggleHover={() => setIsHoverPaused(!isHoverPaused)}
        onOpenSettings={() => setShowSettings(true)}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        eventCount={capturedEvents?.length || 0}
        showTerminal={showTerminal}
      />

      {/* Instructions Card - Always visible */}
      <div className="relative z-10 p-4 md:p-6 mt-16">
        <InstructionsCard />
      </div>

      {/* Mouse Overlay for element detection */}
      <MouseOverlay 
        isActive={isTraceActive}
        currentElement={detectedElement}
        mousePosition={cursorPosition}
        overlayRef={overlayRef}
        inspectorCount={inspectors.length}
      />

      {/* Interactive Panel for Quick Actions */}
      <InteractivePanel
        isVisible={showInteractivePanel}
        currentElement={detectedElement}
        mousePosition={cursorPosition}
        onClose={() => setShowInteractivePanel(false)}
        onDebug={() => setShowAIDebugModal(true)}
        panelRef={interactivePanelRef}
      />

      {/* Multiple Element Inspectors */}
      {inspectors.map((inspector) => (
        <ElementInspector
          key={inspector.id}
          isVisible={true}
          currentElement={inspector.element}
          mousePosition={inspector.position}
          onDebug={() => {
            setDetectedElement(inspector.element);
            setShowAIDebugModal(true);
          }}
          onClose={() => removeInspector(inspector.id)}
          onShowMoreDetails={() => {}}
          onPin={() => bringToFront(inspector.id)}
        />
      ))}

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
