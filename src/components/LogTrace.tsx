
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { X, Play, Pause, Info } from 'lucide-react';
import { useLogTraceOrchestrator } from '@/shared/hooks/useLogTraceOrchestrator';
import { useInteractionHandlers } from '@/shared/hooks/useInteractionHandlers';
import InteractivePanel from './InteractivePanel';
import { LogEvent } from '@/shared/types';
import MobileQuickActionsMenu from './LogTrace/MobileQuickActionsMenu';
import InspectorPanel from './InspectorPanel';
import TerminalPanel from './TerminalPanel';
import AIDebugModal from './AIDebugModal';
import SettingsPanel from './SettingsPanel';

const LogTrace: React.FC = () => {
  const {
    isTraceActive,
    setIsTraceActive,
    cursorPosition,
    setCursorPosition,
    detectedElement,
    setDetectedElement,
    showAIDebugModal,
    setShowAIDebugModal,
    showTerminalPanel,
    setShowTerminalPanel,
    capturedEvents,
    traceSettings,
    updateTraceSettings,
    isAIAnalyzing,
    isLoading,
    hasAnyErrors,
    allErrors,
    clearAllErrors,
    retrySettingsLoad,
    overlayRef,
    modalRef,
    recordEvent,
    extractElementDetails,
    analyzeElementWithAI,
    clearCapturedEvents,
    exportCapturedEvents,
    generateElementPrompt,
    debugContext,
  } = useLogTraceOrchestrator();

  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [showInteractivePanel, setShowInteractivePanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showInspectorPanel, setShowInspectorPanel] = useState(false);
  const [showMobileQuickActions, setShowMobileQuickActions] = useState(false);
  const isMobile = useIsMobile();

  const handleEscapeKey = useCallback(() => {
    if (showAIDebugModal) {
      setShowAIDebugModal(false);
    } else if (showSettingsPanel) {
      setShowSettingsPanel(false);
    } else if (showInspectorPanel) {
      setShowInspectorPanel(false);
    } else if (showTerminalPanel) {
      setShowTerminalPanel(false);
    } else if (isTraceActive) {
      setIsTraceActive(false);
    }
  }, [showAIDebugModal, showSettingsPanel, showInspectorPanel, showTerminalPanel, isTraceActive, setIsTraceActive, setShowAIDebugModal, setShowTerminalPanel]);

  const handleElementClick = useCallback(() => {
    setShowInteractivePanel(true);
    setIsHoverPaused(true);
  }, [setIsHoverPaused]);

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'inspector':
        setShowInspectorPanel(true);
        break;
      case 'screenshot':
        // Placeholder for screenshot functionality
        alert('Screenshot action triggered!');
        break;
      case 'context':
        setShowAIDebugModal(true);
        break;
      case 'debug':
        setShowTerminalPanel(true);
        break;
      case 'terminal':
        setShowTerminalPanel(true);
        break;
      default:
        console.warn(`Unknown action: ${actionId}`);
    }
  };

  const {
    handleCursorMovement,
    handleElementClick: handleClick,
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
    onQuickAction: handleQuickAction,
  });

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isTraceActive && traceSettings.warnOnExit) {
        event.preventDefault();
        event.returnValue = 'LogTrace is active. Are you sure you want to leave?';
        return 'LogTrace is active. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isTraceActive, traceSettings.warnOnExit]);

  return (
    <>
      {/* LogTrace Overlay - Only when active */}
      {isTraceActive && (
        <div
          id="logtrace-overlay"
          ref={overlayRef}
          className="fixed top-0 left-0 w-full h-full z-[9998] pointer-events-none"
          style={{ pointerEvents: isHoverPaused ? 'auto' : 'none' }}
          onMouseMove={handleCursorMovement}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Element Highlighting */}
          {detectedElement && detectedElement.element && (
            <div
              style={{
                position: 'absolute',
                left: `${cursorPosition.x}px`,
                top: `${cursorPosition.y}px`,
                transform: 'translate(-50%, -50%)',
                width: `${detectedElement.size.width}px`,
                height: `${detectedElement.size.height}px`,
                border: '2px dashed rgba(255, 255, 0, 0.7)',
                backgroundColor: 'rgba(255, 255, 0, 0.2)',
                pointerEvents: 'none',
                zIndex: 9999,
              }}
            />
          )}
        </div>
      )}

      {/* Main LogTrace Interface */}
      <div className="min-h-screen bg-background">
        {/* LogTrace Control Modal - Always visible when active */}
        {isTraceActive && (
          <div
            id="logtrace-modal"
            ref={modalRef}
            className="fixed top-4 right-4 z-[10000] bg-gray-800 bg-opacity-70 rounded-md shadow-lg p-4 data-[interactive-panel]:pointer-events-auto"
            data-interactive-panel={showInteractivePanel}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white">LogTrace Active</h2>
              <button 
                onClick={() => setIsTraceActive(false)} 
                className="text-gray-500 hover:text-gray-300"
                title="Stop Tracing"
              >
                <Pause className="h-5 w-5" />
              </button>
            </div>

            {/* Error Display */}
            {hasAnyErrors && (
              <div className="mb-4 p-3 bg-red-700 text-white rounded-md">
                <p>
                  <strong>Errors:</strong>
                </p>
                {allErrors.settings && <p>Settings: {allErrors.settings}</p>}
                {allErrors.storage && <p>Storage: {allErrors.storage}</p>}
                {allErrors.loading && <p>Loading: {allErrors.loading}</p>}
                <button onClick={clearAllErrors} className="mt-2 text-sm underline">
                  Clear Errors
                </button>
                {allErrors.settings && (
                  <button onClick={retrySettingsLoad} className="mt-2 ml-4 text-sm underline">
                    Retry Load
                  </button>
                )}
              </div>
            )}

            {/* Settings Panel Toggle */}
            <button
              onClick={() => setShowSettingsPanel(!showSettingsPanel)}
              className="block text-white hover:text-gray-300 mb-2"
            >
              {showSettingsPanel ? 'Hide Settings' : 'Show Settings'}
            </button>

            <div className="text-sm text-gray-300">
              <p>Hover over elements to inspect them</p>
              <p>Click elements for detailed analysis</p>
            </div>

            {/* Mobile Quick Actions Menu */}
            {isMobile && (
              <MobileQuickActionsMenu
                isVisible={showMobileQuickActions}
                onToggle={() => setShowMobileQuickActions(!showMobileQuickActions)}
                onAction={handleQuickAction}
              />
            )}
          </div>
        )}

        {/* Settings Panel */}
        {showSettingsPanel && (
          <div className="fixed top-4 left-4 right-4 z-[10001] bg-card border rounded-lg shadow-lg">
            <SettingsPanel
              traceSettings={traceSettings}
              updateTraceSettings={updateTraceSettings}
              isLoading={isLoading}
            />
            <div className="p-4 border-t">
              <button
                onClick={() => setShowSettingsPanel(false)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
              >
                Close Settings
              </button>
            </div>
          </div>
        )}

        {/* Interactive Panel */}
        {showInteractivePanel && (
          <InteractivePanel
            detectedElement={detectedElement}
            cursorPosition={cursorPosition}
            onClose={() => {
              setShowInteractivePanel(false);
              setIsHoverPaused(false);
            }}
            onAnalyzeWithAI={analyzeElementWithAI}
            isAIAnalyzing={isAIAnalyzing}
            generateElementPrompt={generateElementPrompt}
          />
        )}

        {/* Inspector Panel */}
        {showInspectorPanel && isTraceActive && (
          <InspectorPanel
            element={detectedElement}
            onClose={() => setShowInspectorPanel(false)}
          />
        )}

        {/* Terminal Panel */}
        {showTerminalPanel && (
          <TerminalPanel
            events={capturedEvents}
            onClose={() => setShowTerminalPanel(false)}
            onClear={clearCapturedEvents}
            onExport={exportCapturedEvents}
            debugContext={debugContext}
          />
        )}

        {/* AI Debug Modal */}
        {showAIDebugModal && (
          <AIDebugModal
            isOpen={showAIDebugModal}
            onClose={() => setShowAIDebugModal(false)}
            element={detectedElement}
            position={cursorPosition}
            analyzeElementWithAI={analyzeElementWithAI}
            isAIAnalyzing={isAIAnalyzing}
            generateElementPrompt={generateElementPrompt}
          />
        )}
      </div>
    </>
  );
};

export default LogTrace;
