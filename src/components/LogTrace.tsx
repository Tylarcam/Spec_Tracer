import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import Header from './LogTrace/Header';
import InstructionsCard from './LogTrace/InstructionsCard';
import MouseOverlay from './LogTrace/MouseOverlay';
import ElementInspector from './LogTrace/ElementInspector';
import DebugModal from './LogTrace/DebugModal';
import TabbedTerminal from './LogTrace/TabbedTerminal';
import MoreDetailsModal from './LogTrace/PinnedDetails';
import OnboardingWalkthrough from './LogTrace/OnboardingWalkthrough';
import SettingsDrawer from './LogTrace/SettingsDrawer';
import UpgradeModal from './LogTrace/UpgradeModal';
import { Button } from './ui/button';

const LogTrace: React.FC = () => {
  const [showInteractivePanel, setShowInteractivePanel] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [pausedPosition, setPausedPosition] = useState({ x: 0, y: 0 });
  const [pausedElement, setPausedElement] = useState<any>(null);
  const interactivePanelRef = useRef<HTMLDivElement>(null);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [detailsElement, setDetailsElement] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('logtrace-onboarding-completed');
  });
  const [terminalHeight, setTerminalHeight] = useState(() => Math.max(window.innerHeight * 0.4, 200));
  const terminalMinHeight = 200;
  const resizingRef = useRef(false);
  const [pillOn, setPillOn] = useState(false);

  // Usage tracking
  const {
    remainingUses,
    hasReachedLimit,
    canUseAiDebug,
    incrementAiDebugUsage,
  } = useUsageTracking();

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
    hasErrors,
    errors,
  } = useLogTrace();

  const {
    debugResponses,
    addDebugResponse,
    clearDebugResponses,
  } = useDebugResponses();

  const { toast } = useToast();

  // Watch for errors from useLogTrace and display toast
  useEffect(() => {
    if (hasErrors) {
      if (errors.settings) {
        toast({
          title: 'Settings Error',
          description: errors.settings,
          variant: 'destructive',
        });
      }
      if (errors.storage) {
        toast({
          title: 'Storage Error',
          description: errors.storage,
          variant: 'destructive',
        });
      }
      if (errors.loading) {
        toast({
          title: 'Load Error',
          description: errors.loading,
          variant: 'destructive',
        });
      }
    }
  }, [hasErrors, errors, toast]);

  // Onboarding handlers
  const handleOnboardingNext = () => {
    setOnboardingStep(prev => prev + 1);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    localStorage.setItem('logtrace-onboarding-completed', 'true');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('logtrace-onboarding-completed', 'true');
  };

  const handleElementClick = useCallback(() => {
    if (!currentElement) return;
    
    // Ensure only one modal is visible at a time
    setShowDebugModal(false);
    setShowTerminal(false);
    setShowInteractivePanel(true);
    
    addEvent({
      type: 'inspect',
      position: mousePosition,
      element: {
        tag: currentElement.tag,
        id: currentElement.id,
        classes: currentElement.classes,
        text: currentElement.text,
      },
    });
  }, [currentElement, mousePosition, addEvent, setShowDebugModal, setShowTerminal]);

  const handleDebugFromPanel = useCallback(() => {
    // Check usage limit before proceeding
    if (!canUseAiDebug) {
      setShowUpgradeModal(true);
      return;
    }

    // Ensure only one modal is visible at a time
    setShowInteractivePanel(false);
    setShowTerminal(false);
    setShowDebugModal(true);
    
    if (currentElement) {
      addEvent({
        type: 'debug',
        position: mousePosition,
        element: {
          tag: currentElement.tag,
          id: currentElement.id,
          classes: currentElement.classes,
          text: currentElement.text,
        },
      });
    }
  }, [currentElement, mousePosition, addEvent, setShowDebugModal, setShowTerminal, canUseAiDebug]);

  const handleEscape = useCallback(() => {
    setShowInteractivePanel(false);
    setShowDebugModal(false);
    setIsHoverPaused(false);
    setShowSettingsDrawer(false);
    if (showTerminal) setShowTerminal(false);
  }, [setShowDebugModal, showTerminal]);

  const handleAnalyzeWithAI = useCallback(async (prompt: string) => {
    // Check usage limit
    if (!canUseAiDebug) {
      setShowUpgradeModal(true);
      return null;
    }

    try {
      const response = await analyzeWithAI(prompt);
      addDebugResponse(prompt, response || 'No response received');
      
      // Increment usage after successful AI debug
      incrementAiDebugUsage();
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error occurred during analysis';
      addDebugResponse(prompt, errorMessage);
      return null;
    }
  }, [analyzeWithAI, addDebugResponse, canUseAiDebug, incrementAiDebugUsage]);

  const handleUpgradeClick = useCallback(() => {
    setShowUpgradeModal(true);
  }, []);

  const handleSettingsClick = useCallback(() => {
    setShowSettingsDrawer(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || isHoverPaused) return;

    const target = e.target as HTMLElement;
    if (target && 
        !target.closest('#logtrace-overlay') && 
        !target.closest('#logtrace-modal') &&
        !target.closest('[data-interactive-panel]') &&
        !target.closest('[data-element-inspector]')) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      const elementInfo = extractElementInfo(target);
      setCurrentElement(elementInfo);
      
      // Only auto-close inspector if user is moving to a different element
      // and no debug modal is currently open
      if (showInteractivePanel && !showDebugModal) {
        setShowInteractivePanel(false);
      }
    }
  }, [isActive, isHoverPaused, extractElementInfo, setMousePosition, setCurrentElement, showInteractivePanel, showDebugModal]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      
      if (isActive && e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        
        // Check usage limit before proceeding
        if (!canUseAiDebug) {
          setShowUpgradeModal(true);
          return;
        }

        // Ensure only one modal is visible at a time
        setShowInteractivePanel(false);
        setShowTerminal(false);
        setShowDebugModal(true);
        
        if (currentElement) {
          addEvent({
            type: 'debug',
            position: mousePosition,
            element: {
              tag: currentElement.tag,
              id: currentElement.id,
              classes: currentElement.classes,
              text: currentElement.text,
            },
          });
        }
      }
      
      if (isActive && e.key === 'd' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (!isHoverPaused) {
          setPausedPosition(mousePosition);
          setPausedElement(currentElement);
          setIsHoverPaused(true);
        } else {
          setIsHoverPaused(false);
        }
      }
      
      if (e.key === 's' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (!isActive) {
          setIsActive(true);
        }
      }
      
      if (e.key === 'e' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (isActive) {
          setIsActive(false);
          handleEscape();
        }
      }
      
      if (e.key === 't' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        // Ensure only one modal is visible at a time
        if (!showTerminal) {
          setShowInteractivePanel(false);
          setShowDebugModal(false);
          setShowTerminal(true);
        } else {
          setShowTerminal(false);
        }
      }
      
      if (e.key === 'Escape') {
        handleEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isActive, 
    mousePosition, 
    currentElement, 
    addEvent, 
    setShowDebugModal, 
    isHoverPaused, 
    showTerminal, 
    setShowTerminal, 
    setIsActive,
    handleEscape,
    canUseAiDebug
  ]);

  // Handle mouse events for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingRef.current) {
        const newHeight = Math.max(window.innerHeight - e.clientY, terminalMinHeight);
        setTerminalHeight(newHeight);
      }
    };
    const handleMouseUp = () => {
      resizingRef.current = false;
    };
    // Always listen for mouse move/up globally
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-green-400 font-mono relative overflow-hidden"
         onMouseMove={handleMouseMove}
         onClick={handleClick}>
      
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
          remainingUses={remainingUses}
          onSettingsClick={handleSettingsClick}
          onUpgradeClick={handleUpgradeClick}
        />

        {/* Test Button and Pill Slider */}
        <div className="flex items-center gap-6 mb-6">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            onClick={() => alert('Test Button Clicked!')}
          >
            Test Button
          </button>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Pill Slider:</span>
            <button
              type="button"
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${pillOn ? 'bg-green-500' : 'bg-gray-400'}`}
              onClick={() => setPillOn(v => !v)}
              aria-pressed={pillOn}
            >
              <span
                className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${pillOn ? 'translate-x-6' : ''}`}
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
              />
            </button>
            <span className={`ml-2 text-sm font-semibold ${pillOn ? 'text-green-500' : 'text-gray-400'}`}>{pillOn ? 'ON' : 'OFF'}</span>
          </div>
        </div>

        {hasErrors && (
          <div className="my-4 p-3 rounded bg-red-800/60 text-red-200 animate-pulse max-w-xl">
            <h4 className="font-semibold text-red-300 mb-1">Errors Detected</h4>
            <ul className="text-sm list-disc list-inside space-y-1">
              {Object.entries(errors).map(([key, value]) => (
                value ? <li key={key}>{value}</li> : null
              ))}
            </ul>
          </div>
        )}
        <InstructionsCard />
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer 
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        onUpgradeClick={handleUpgradeClick}
      />

      {/* Onboarding Walkthrough */}
      {showOnboarding && (
        <OnboardingWalkthrough
          step={onboardingStep}
          onNext={handleOnboardingNext}
          onSkip={handleOnboardingSkip}
          onComplete={handleOnboardingComplete}
          isActive={isActive}
          currentElement={currentElement}
          mousePosition={mousePosition}
          showInteractivePanel={showInteractivePanel}
          showTerminal={showTerminal}
        />
      )}

      <MouseOverlay 
        isActive={isActive}
        currentElement={isHoverPaused ? pausedElement : currentElement}
        mousePosition={isHoverPaused ? pausedPosition : mousePosition}
        overlayRef={overlayRef}
        onElementClick={handleElementClick}
      />

      <div data-interactive-panel>
        <ElementInspector
          isVisible={showInteractivePanel}
          currentElement={currentElement}
          mousePosition={mousePosition}
          onDebug={handleDebugFromPanel}
          onClose={() => setShowInteractivePanel(false)}
          panelRef={interactivePanelRef}
          onShowMoreDetails={() => {
            setDetailsElement(currentElement);
            setShowMoreDetails(true);
            setShowInteractivePanel(false);
          }}
          currentDebugCount={5 - remainingUses}
          maxDebugCount={5}
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

      <MoreDetailsModal 
        element={detailsElement}
        open={showMoreDetails}
        onClose={() => setShowMoreDetails(false)}
      />

      {/* Always render TabbedTerminal for the icon button when closed */}
      {!showTerminal && (
        <Button
          onClick={() => setShowTerminal(true)}
          className="fixed bottom-4 right-4 z-30 bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 p-0 shadow-lg"
        >
          <span style={{ fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'>'}</span>
        </Button>
      )}

      {/* Only render the resizable terminal when open */}
      {showTerminal && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            height: terminalHeight,
            minHeight: terminalMinHeight,
            // Remove maxHeight
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: 8,
              cursor: 'ns-resize',
              background: 'rgba(34,197,94,0.15)',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              zIndex: 51,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              resizingRef.current = true;
            }}
          />
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <TabbedTerminal
              showTerminal={showTerminal}
              setShowTerminal={setShowTerminal}
              events={events}
              exportEvents={exportEvents}
              clearEvents={clearEvents}
              debugResponses={debugResponses}
              clearDebugResponses={clearDebugResponses}
              terminalHeight={terminalHeight}
            />
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        remainingUses={remainingUses}
      />
    </div>
  );
};

export default LogTrace;
