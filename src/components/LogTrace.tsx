
import React, { useCallback, useEffect } from 'react';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { supabase } from '@/integrations/supabase/client';
import { initializeSupabase } from '@/shared/api';
import Header from './LogTrace/Header';
import InstructionsCard from './LogTrace/InstructionsCard';
import MouseOverlay from './LogTrace/MouseOverlay';
import DebugModal from './LogTrace/DebugModal';
import Terminal from './LogTrace/Terminal';

// Initialize Supabase for shared API
initializeSupabase(supabase);

const LogTrace: React.FC = () => {
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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    
    const target = e.target as HTMLElement;
    if (target && !target.closest('#logtrace-overlay') && !target.closest('#logtrace-modal')) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      const elementInfo = extractElementInfo(target);
      setCurrentElement(elementInfo);
      
      addEvent({
        type: 'move',
        position: { x: e.clientX, y: e.clientY },
        element: {
          tag: elementInfo.tag,
          id: elementInfo.id,
          classes: elementInfo.classes,
          text: elementInfo.text,
        },
      });
    }
  }, [isActive, extractElementInfo, addEvent, setMousePosition, setCurrentElement]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    
    const target = e.target as HTMLElement;
    if (target && !target.closest('#logtrace-overlay') && !target.closest('#logtrace-modal')) {
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
  }, [isActive, mousePosition, currentElement, addEvent, setShowDebugModal]);

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, handleKeyDown]);

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
      />

      <DebugModal 
        showDebugModal={showDebugModal}
        setShowDebugModal={setShowDebugModal}
        currentElement={currentElement}
        mousePosition={mousePosition}
        isAnalyzing={isAnalyzing}
        analyzeWithAI={analyzeWithAI}
        generateAdvancedPrompt={generateAdvancedPrompt}
        modalRef={modalRef}
      />

      <Terminal 
        showTerminal={showTerminal}
        setShowTerminal={setShowTerminal}
        events={events}
        exportEvents={exportEvents}
        clearEvents={clearEvents}
      />
    </div>
  );
};

export default LogTrace;
