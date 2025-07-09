import React, { useState } from 'react';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { usePinnedDetails } from '@/shared/hooks/usePinnedDetails';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';
import { useLogTraceEventHandlers } from '@/shared/hooks/useLogTraceEventHandlers';
import { supabase } from '@/integrations/supabase/client';
import { initializeSupabase } from '@/shared/api';
import Header from './LogTrace/Header';
import InstructionsCard from './LogTrace/InstructionsCard';
import MouseOverlay from './LogTrace/MouseOverlay';
import InteractivePanel from './LogTrace/InteractivePanel';
import DebugModal from './LogTrace/DebugModal';
import TabbedTerminal from './LogTrace/TabbedTerminal';
import PinnedDetails from './LogTrace/PinnedDetails';

// Initialize Supabase for shared API
initializeSupabase(supabase);

const LogTrace: React.FC = () => {
  const [showInteractivePanel, setShowInteractivePanel] = useState(false);
  const interactivePanelRef = React.useRef<HTMLDivElement>(null);

  const {
    isActive,
    setIsActive,
    mousePosition,
    setMousePosition,
    currentElement,
    setCurrentElement,
    showDebugModal,
    setShowDebugModal,
    showTerminal,
    setShowTerminal,
    events,
    isAnalyzing,
    overlayRef,
    modalRef,
    addEvent,
    extractElementInfo,
    analyzeWithAI,
    clearEvents,
    exportEvents,
    generateAdvancedPrompt,
  } = useLogTrace();

  const {
    pinnedDetails,
    addPin,
    removePin,
    updatePinPosition,
    clearAllPins,
  } = usePinnedDetails();

  const {
    debugResponses,
    addDebugResponse,
  } = useDebugResponses();

  const handleElementClick = () => {
    setShowInteractivePanel(true);
    
    // Auto-pin details to canvas when modal opens
    if (currentElement) {
      addPin(currentElement, mousePosition);
    }
    
    addEvent({
      type: 'inspect',
      position: mousePosition,
      element: currentElement ? {
        tag: currentElement.tag,
        id: currentElement.id,
        classes: currentElement.classes,
        text: currentElement.text,
      } : undefined,
    });
  };

  const handleDebugFromPanel = () => {
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
  };

  const handleEscape = () => {
    setShowInteractivePanel(false);
    setShowDebugModal(false);
    clearAllPins(); // Clear all pins on escape
  };

  const handleAnalyzeWithAI = async (prompt: string) => {
    try {
      const response = await analyzeWithAI(prompt);
      addDebugResponse(prompt, response || 'No response received');
      return response;
    } catch (error) {
      console.error('Error in AI analysis:', error);
      addDebugResponse(prompt, 'Error occurred during analysis');
      return null;
    }
  };

  const {
    handleMouseMove,
    handleClick,
  } = useLogTraceEventHandlers({
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
    onElementClick: handleElementClick,
    onDebugFromPanel: handleDebugFromPanel,
    onEscape: handleEscape,
  });

  return (
    <div className="min-h-screen bg-slate-900 text-green-400 font-mono relative overflow-hidden"
         onMouseMove={handleMouseMove}
         onClick={handleClick}>
      
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative z-10 p-6">
        <Header 
          isActive={isActive}
          setIsActive={setIsActive}
          showTerminal={showTerminal}
          setShowTerminal={setShowTerminal}
        />
        <InstructionsCard />
      </div>

      <MouseOverlay 
        isActive={isActive}
        currentElement={currentElement}
        mousePosition={mousePosition}
        overlayRef={overlayRef}
        onElementClick={handleElementClick}
      />

      <div data-interactive-panel>
        <InteractivePanel
          isVisible={showInteractivePanel}
          currentElement={currentElement}
          mousePosition={mousePosition}
          onDebug={handleDebugFromPanel}
          onClose={() => setShowInteractivePanel(false)}
          panelRef={interactivePanelRef}
        />
      </div>

      <DebugModal 
        showDebugModal={showDebugModal}
        setShowDebugModal={setShowDebugModal}
        currentElement={currentElement}
        mousePosition={mousePosition}
        isAnalyzing={isAnalyzing}
        analyzeWithAI={handleAnalyzeWithAI}
        generateAdvancedPrompt={generateAdvancedPrompt}
        modalRef={modalRef}
      />

      <PinnedDetails 
        pinnedDetails={pinnedDetails}
        onRemovePin={removePin}
        onUpdatePosition={updatePinPosition}
      />

      <TabbedTerminal 
        showTerminal={showTerminal}
        setShowTerminal={setShowTerminal}
        events={events}
        exportEvents={exportEvents}
        clearEvents={clearEvents}
        debugResponses={debugResponses}
      />
    </div>
  );
};

export default LogTrace;