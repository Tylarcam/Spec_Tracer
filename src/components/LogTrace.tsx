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
  }, [setShowDebugModal]);

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

      <TabbedTerminal 
        isVisible={showTerminal}
        onToggle={() => setShowTerminal(!showTerminal)}
        onClear={clearEvents}
        showTerminal={showTerminal}
        setShowTerminal={setShowTerminal}
        events={events}
        exportEvents={exportEvents}
        clearEvents={clearEvents}
        debugResponses={debugResponses}
        clearDebugResponses={clearDebugResponses}
      />

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
