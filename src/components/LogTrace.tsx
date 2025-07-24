
import React, { useEffect, useRef, useState } from 'react';
import { useLogTraceOrchestrator } from '@/shared/hooks/useLogTraceOrchestrator';
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

  // Sync capture state with parent
  useEffect(() => {
    setIsTraceActive(captureActive);
  }, [captureActive, setIsTraceActive]);

  useEffect(() => {
    onCaptureToggle(isTraceActive);
  }, [isTraceActive, onCaptureToggle]);

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

      {/* Element Inspector */}
      <ElementInspector 
        isVisible={!!detectedElement && isTraceActive}
        currentElement={detectedElement}
        mousePosition={cursorPosition}
        onDebug={() => setShowAIDebugModal(true)}
        onClose={() => setDetectedElement(null)}
        onShowMoreDetails={() => {}}
      />

      {/* AI Debug Modal */}
      <DebugModal 
        showDebugModal={showAIDebugModal}
        setShowDebugModal={setShowAIDebugModal}
        currentElement={detectedElement}
        isAnalyzing={isAIAnalyzing}
        onAnalyze={analyzeElementWithAI}
        debugModalRef={modalRef}
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
