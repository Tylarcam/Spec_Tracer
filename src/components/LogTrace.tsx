
import React, { useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLogTraceOrchestrator } from '@/shared/hooks/useLogTraceOrchestrator';
import { useInteractionHandlers } from '@/shared/hooks/useInteractionHandlers';

import UnifiedTraceControl from './LogTrace/UnifiedTraceControl';
import MouseOverlay from './LogTrace/MouseOverlay';
import ElementInspector from './LogTrace/ElementInspector';
import DebugModal from './LogTrace/DebugModal';
import TabbedTerminal from './LogTrace/TabbedTerminal';
import SettingsDrawer from './LogTrace/SettingsDrawer';
import OnboardingWalkthrough from './LogTrace/OnboardingWalkthrough';
import MobileQuickActionsMenu from './LogTrace/MobileQuickActionsMenu';
import QuickActionPill from './LogTrace/QuickActionPill';
import InstructionsCard from './LogTrace/InstructionsCard';

import { useTracingContext } from '@/App';
import { QuickActionType } from '@/shared/types';

const LogTrace: React.FC = React.memo(() => {
  const { tracingActive, setTracingActive } = useTracingContext();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  // Initialize the main orchestrator hook
  const orchestrator = useLogTraceOrchestrator();
  
  // Stable references to prevent flickering
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
    overlayRef,
    modalRef,
    recordEvent,
    extractElementDetails,
    analyzeElementWithAI,
    clearCapturedEvents,
    exportCapturedEvents,
    generateElementPrompt,
    debugContext,
  } = orchestrator;

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = React.useState(0);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = React.useState(false);

  // UI state
  const [isHoverEnabled, setIsHoverEnabled] = React.useState(true);
  const [isHoverPaused, setIsHoverPaused] = React.useState(false);
  const [showInteractivePanel, setShowInteractivePanel] = React.useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [showQuickActions, setShowQuickActions] = React.useState(false);
  const [quickActionPosition, setQuickActionPosition] = React.useState({ x: 0, y: 0 });
  const [inspectorPanels, setInspectorPanels] = React.useState<Array<{
    id: string;
    element: any;
    position: { x: number; y: number };
  }>>([]);

  // Single source of truth for tracing state - only sync once on mount
  useEffect(() => {
    if (tracingActive !== isTraceActive) {
      setIsTraceActive(tracingActive);
    }
  }, [tracingActive]); // Only depend on tracingActive from context

  // Update context when internal state changes
  useEffect(() => {
    if (isTraceActive !== tracingActive) {
      setTracingActive(isTraceActive);
    }
  }, [isTraceActive]); // Only depend on isTraceActive

  // Handle onboarding from URL parameter
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding');
    if (onboardingParam === 'true' && !onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [searchParams, onboardingCompleted]);

  // Memoized handlers to prevent flickering
  const handleEscapeKey = useCallback(() => {
    if (showAIDebugModal) {
      setShowAIDebugModal(false);
    } else if (showQuickActions) {
      setShowQuickActions(false);
    } else if (inspectorPanels.length > 0) {
      setInspectorPanels(prev => prev.slice(0, -1));
    } else if (showSettingsDrawer) {
      setShowSettingsDrawer(false);
    }
  }, [showAIDebugModal, showQuickActions, inspectorPanels.length, showSettingsDrawer, setShowAIDebugModal]);

  const handleElementClick = useCallback(() => {
    if (!detectedElement || inspectorPanels.length >= 3) return;
    
    const newInspector = {
      id: `inspector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      element: detectedElement,
      position: { x: cursorPosition.x, y: cursorPosition.y }
    };
    
    setInspectorPanels(prev => [...prev, newInspector]);
  }, [detectedElement, cursorPosition, inspectorPanels.length]);

  const handleQuickAction = useCallback((action: QuickActionType) => {
    setShowQuickActions(false);
    
    switch (action) {
      case 'details':
        if (detectedElement) {
          const newInspector = {
            id: `inspector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            element: detectedElement,
            position: { x: cursorPosition.x, y: cursorPosition.y }
          };
          setInspectorPanels(prev => [...prev, newInspector]);
        }
        break;
      case 'debug':
        if (detectedElement) {
          setShowAIDebugModal(true);
        }
        break;
      case 'screenshot':
        // Handle screenshot
        break;
      case 'copy':
        // Handle copy
        break;
      case 'context':
        // Handle context
        break;
    }
  }, [detectedElement, cursorPosition, setShowAIDebugModal]);

  // Memoized interaction handlers
  const interactionHandlers = useMemo(() => ({
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
  }), [
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
    handleElementClick,
    handleQuickAction,
  ]);

  // Interaction handlers
  const {
    handleCursorMovement,
    handleElementClick: handleInteractionClick,
    handleTouchStart,
    handleTouchEnd,
  } = useInteractionHandlers(interactionHandlers);

  // Keyboard shortcuts
  useHotkeys('ctrl+shift+l', () => setIsTraceActive(!isTraceActive));
  useHotkeys('ctrl+shift+t', () => setShowTerminalPanel(!showTerminalPanel));
  useHotkeys('ctrl+shift+s', () => setShowSettingsDrawer(!showSettingsDrawer));
  useHotkeys('escape', handleEscapeKey);

  // Onboarding handlers
  const handleOnboardingNext = useCallback(() => {
    setOnboardingStep(prev => prev + 1);
  }, []);

  const handleOnboardingSkip = useCallback(() => {
    setShowOnboarding(false);
    setOnboardingCompleted(true);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    setOnboardingCompleted(true);
  }, []);

  // Close inspector panel
  const closeInspectorPanel = useCallback((id: string) => {
    setInspectorPanels(prev => prev.filter(panel => panel.id !== id));
  }, []);

  // Memoized context menu handler
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (isTraceActive && detectedElement) {
      e.preventDefault();
      setQuickActionPosition({ x: e.clientX, y: e.clientY });
      setShowQuickActions(true);
    }
  }, [isTraceActive, detectedElement]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading LogTrace...</p>
        </div>
      </div>
    );
  }

  if (hasAnyErrors) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4">
            <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
            <p className="text-sm">
              {allErrors.settings || allErrors.storage || allErrors.loading || 'Unknown error occurred'}
            </p>
          </div>
          <button
            onClick={clearAllErrors}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-900 text-white relative overflow-hidden"
      onMouseMove={handleCursorMovement}
      onClick={handleInteractionClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
    >
      {/* Unified Trace Control */}
      <UnifiedTraceControl
        isTracing={isTraceActive}
        isHoverEnabled={isHoverEnabled}
        onToggleTracing={() => setIsTraceActive(!isTraceActive)}
        onToggleHover={() => setIsHoverEnabled(!isHoverEnabled)}
        onOpenSettings={() => setShowSettingsDrawer(true)}
        eventCount={capturedEvents.length}
      />

      {/* Main Content */}
      <div className="pt-20 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-green-400 mb-4">Welcome to LogTrace</h1>
            <p className="text-slate-300 text-lg">
              The AI-powered debugging tool that helps you capture perfect context for any UI element.
            </p>
          </div>

          <InstructionsCard />
        </div>
      </div>

      {/* Mouse Overlay */}
      <MouseOverlay
        isActive={isTraceActive && isHoverEnabled && !isHoverPaused}
        currentElement={detectedElement}
        mousePosition={cursorPosition}
        overlayRef={overlayRef}
        inspectorCount={inspectorPanels.length}
      />

      {/* Inspector Panels */}
      {inspectorPanels.map((panel) => (
        <ElementInspector
          key={panel.id}
          isVisible={true}
          currentElement={panel.element}
          mousePosition={panel.position}
          onDebug={() => {
            setDetectedElement(panel.element);
            setShowAIDebugModal(true);
          }}
          onClose={() => closeInspectorPanel(panel.id)}
          panelRef={overlayRef}
          isExtensionMode={false}
          isDraggable={true}
          isPinned={false}
          onPin={() => {}}
          onShowMoreDetails={() => {}}
          onMouseEnter={() => setIsHoverPaused(true)}
          onMouseLeave={() => setIsHoverPaused(false)}
        />
      ))}

      {/* Debug Modal */}
      <DebugModal
        showDebugModal={showAIDebugModal}
        setShowDebugModal={setShowAIDebugModal}
        currentElement={detectedElement}
        mousePosition={cursorPosition}
        isAnalyzing={isAIAnalyzing}
        analyzeWithAI={analyzeElementWithAI}
        generateAdvancedPrompt={generateElementPrompt}
        modalRef={modalRef}
        isExtensionMode={false}
        showAuthModal={false}
        setShowAuthModal={() => {}}
        user={null}
        guestDebugCount={0}
        maxGuestDebugs={3}
        terminalHeight={showTerminalPanel ? 400 : 0}
      />

      {/* Terminal Panel */}
      {showTerminalPanel && (
        <TabbedTerminal
          isOpen={showTerminalPanel}
          onClose={() => setShowTerminalPanel(false)}
          events={capturedEvents}
          exportEvents={exportCapturedEvents}
          clearEvents={clearCapturedEvents}
          debugResponses={[]}
          clearDebugResponses={() => {}}
          currentElement={detectedElement}
          terminalHeight={400}
        />
      )}

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        onUpgradeClick={() => {}}
      />

      {/* Mobile Menu */}
      {isMobile && (
        <MobileQuickActionsMenu
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          onStartTrace={() => setIsTraceActive(true)}
          onEndTrace={() => setIsTraceActive(false)}
          onToggleHover={() => setIsHoverEnabled(!isHoverEnabled)}
          onUpgrade={() => {}}
          onSettings={() => setShowSettingsDrawer(true)}
          isTracing={isTraceActive}
          isHoverEnabled={isHoverEnabled}
        />
      )}

      {/* Quick Actions */}
      <QuickActionPill
        visible={showQuickActions}
        x={quickActionPosition.x}
        y={quickActionPosition.y}
        onClose={() => setShowQuickActions(false)}
        onAction={handleQuickAction}
      />

      {/* Onboarding Walkthrough */}
      {showOnboarding && (
        <OnboardingWalkthrough
          step={onboardingStep}
          onNext={handleOnboardingNext}
          onSkip={handleOnboardingSkip}
          onComplete={handleOnboardingComplete}
          isActive={isTraceActive}
          currentElement={detectedElement}
          mousePosition={cursorPosition}
          showInspectorOpen={inspectorPanels.length > 0}
          showTerminal={showTerminalPanel}
        />
      )}

      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          onClick={() => setShowMobileMenu(true)}
          className="fixed bottom-4 right-4 z-40 bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        >
          ⚙️
        </button>
      )}

      {/* Terminal Toggle */}
      {!showTerminalPanel && (
        <button
          onClick={() => setShowTerminalPanel(true)}
          className="fixed bottom-4 left-4 z-40 bg-slate-700 hover:bg-slate-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        >
          &gt;
        </button>
      )}
    </div>
  );
});

LogTrace.displayName = 'LogTrace';

export default LogTrace;
