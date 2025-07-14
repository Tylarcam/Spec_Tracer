
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGesture } from '@/shared/gestureManager';
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
import QuickActionModal from './LogTrace/QuickActionModal';
import { Button } from './ui/button';
import html2canvas from 'html2canvas';
import { Switch } from './ui/switch';

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
  
  // Mobile detection
  const isMobile = useIsMobile();
  
  // Terminal height - mobile vs desktop
  const [terminalHeight, setTerminalHeight] = useState(() => {
    const baseHeight = isMobile ? window.innerHeight * 0.6 : window.innerHeight * 0.4;
    return Math.max(baseHeight, isMobile ? 300 : 200);
  });
  const terminalMinHeight = isMobile ? 300 : 200;
  const resizingRef = useRef(false);
  const [pillOn, setPillOn] = useState(false);
  const [quickActionModalVisible, setQuickActionModalVisible] = useState(false);
  const [quickActionModalX, setQuickActionModalX] = useState(0);
  const [quickActionModalY, setQuickActionModalY] = useState(0);
  const logTraceRef = useRef<HTMLDivElement>(null);
  const [contextCaptureEnabled, setContextCaptureEnabled] = useState(false);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);

  // Mobile gesture integration
  const { captureActive } = useGesture();

  // Usage tracking with new credits system
  const {
    remainingUses,
    hasReachedLimit,
    canUseAiDebug,
    incrementAiDebugUsage,
    isPremium,
    waitlistBonusRemaining,
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

  // Auto-open upgrade modal when landing page sends ?upgrade=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgrade') === '1') {
      setShowUpgradeModal(true);
    }
  }, []);

  // Sync contextCaptureEnabled with isActive state
  useEffect(() => {
    if (contextCaptureEnabled && !isActive) {
      setIsActive(true);
    }
  }, [contextCaptureEnabled, isActive, setIsActive]);

  // Sync mobile gesture state with context capture
  useEffect(() => {
    setContextCaptureEnabled(captureActive);
    setIsActive(captureActive);
  }, [captureActive, setIsActive]);

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

  // Element click handler
  const handleElementClick = useCallback(() => {
    if (!currentElement) return;
    
    // Ensure only one modal is visible at a time
    setShowDebugModal(false);
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
  }, [currentElement, mousePosition, addEvent, setShowDebugModal, setShowInteractivePanel]);

  // Debug from panel handler
  const handleDebugFromPanel = useCallback(() => {
    // Check usage limit before proceeding
    if (!canUseAiDebug) {
      setShowUpgradeModal(true);
      return;
    }

    // Ensure only one modal is visible at a time
    setShowInteractivePanel(false);
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
  }, [currentElement, mousePosition, addEvent, setShowDebugModal, setShowInteractivePanel, canUseAiDebug]);

  // Escape handler
  const handleEscape = useCallback(() => {
    setShowInteractivePanel(false);
    setShowDebugModal(false);
    setIsHoverPaused(false);
    setShowSettingsDrawer(false);
    if (showTerminal) setShowTerminal(false);
  }, [setShowDebugModal, showTerminal]);

  // Analyze with AI handler
  const handleAnalyzeWithAI = useCallback(async (prompt: string) => {
    // Check usage limit for premium users
    if (isPremium) {
      // Premium users have unlimited access
      try {
        const response = await analyzeWithAI(prompt);
        addDebugResponse(prompt, response || 'No response received');
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error occurred during analysis';
        addDebugResponse(prompt, errorMessage);
        return null;
      }
    }

    // For non-premium users, check credit availability
    if (!canUseAiDebug) {
      setShowUpgradeModal(true);
      return null;
    }

    try {
      // The credit will be used inside analyzeWithAI via the API call
      const response = await analyzeWithAI(prompt);
      addDebugResponse(prompt, response || 'No response received');
      
      // The new system handles credit usage automatically, no need to manually increment
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error occurred during analysis';
      addDebugResponse(prompt, errorMessage);
      return null;
    }
  }, [analyzeWithAI, addDebugResponse, canUseAiDebug, isPremium]);

  const handleUpgradeClick = useCallback(() => {
    setShowUpgradeModal(true);
  }, []);

  const handleSettingsClick = useCallback(() => {
    setShowSettingsDrawer(true);
  }, []);

  // Mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || isHoverPaused) return;

    // Always update mouse position for cursor circle, even when debug modal is open
    setMousePosition({ x: e.clientX, y: e.clientY });

    // Only update current element when debug modal is NOT open
    if (showDebugModal) return;

    const target = e.target as HTMLElement;
    if (target && 
        !target.closest('#logtrace-overlay') && 
        !target.closest('#logtrace-modal') &&
        !target.closest('[data-interactive-panel]') &&
        !target.closest('[data-element-inspector]')) {
      const elementInfo = extractElementInfo(target);
      setCurrentElement(elementInfo);
      
      // Only auto-close inspector if user is moving to a different element
      // and no debug modal is currently open
      if (showInteractivePanel && !showDebugModal) {
        setShowInteractivePanel(false);
      }
    }
  }, [isActive, isHoverPaused, extractElementInfo, setMousePosition, setCurrentElement, showInteractivePanel, showDebugModal]);

  // Click handler
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

  // quick action handler
  const handleQuickAction = async (action: 'screenshot' | 'context' | 'debug') => {
    setQuickActionModalVisible(false);
    if (action === 'screenshot') {
      try {
        // Wait for modal to hide
        await new Promise(res => setTimeout(res, 100));
        if (logTraceRef.current) {
          const canvas = await html2canvas(logTraceRef.current);
          const dataUrl = canvas.toDataURL('image/png');
          // Download
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'logtrace-screenshot.png';
          link.click();
          // Copy to clipboard
          try {
            const blob = await (await fetch(dataUrl)).blob();
            await navigator.clipboard.write([
              new window.ClipboardItem({ 'image/png': blob })
            ]);
            toast({ title: 'Screenshot', description: 'Screenshot downloaded and copied to clipboard', variant: 'success' });
          } catch (clipErr) {
            toast({ title: 'Screenshot', description: 'Downloaded, but failed to copy to clipboard', variant: 'default' });
          }
        } else {
          toast({ title: 'Screenshot', description: 'Could not find LogTrace area', variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Screenshot', description: 'Screenshot failed', variant: 'destructive' });
      }
    } else if (action === 'context') {
      try {
        const prompt = generateAdvancedPrompt();
        if (!prompt || prompt.trim() === '') {
          toast({ title: 'No Element Selected', description: 'Please select an element to generate context.', variant: 'default' });
          return;
        }
        await navigator.clipboard.writeText(prompt);
        toast({ title: 'Context Prompt Copied', description: 'The generated context prompt has been copied to your clipboard.', variant: 'success' });
      } catch (err) {
        toast({ title: 'Copy Failed', description: 'Failed to copy context prompt.', variant: 'destructive' });
      }
    } else if (action === 'debug') {
      if (!currentElement) {
        toast({ title: 'No Element Selected', description: 'Please select an element to debug.', variant: 'default' });
        return;
      }
      setShowDebugModal(true);
    }
  };

  // keyboard event handlers
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

  // mouse events for resizing
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

  // Handle touch move for mobile gestures
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && captureActive) {
      const touch = e.touches[0];
      setTouchPosition({ x: touch.clientX, y: touch.clientY });
      
      const target = e.target as HTMLElement;
      if (target && 
          !target.closest('#logtrace-overlay') && 
          !target.closest('#logtrace-modal') &&
          !target.closest('[data-interactive-panel]') &&
          !target.closest('[data-element-inspector]')) {
        const elementInfo = extractElementInfo(target);
        setCurrentElement(elementInfo);
      }
    }
  }, [captureActive, extractElementInfo, setCurrentElement]);

  return (
    <div
      ref={logTraceRef}
      className="min-h-screen bg-slate-900 text-green-400 font-mono relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
      onContextMenu={e => {
        e.preventDefault();
        setQuickActionModalX(e.clientX);
        setQuickActionModalY(e.clientY);
        setQuickActionModalVisible(true);
      }}
    >
      <QuickActionModal
        visible={quickActionModalVisible}
        x={quickActionModalX}
        y={quickActionModalY}
        onClose={() => setQuickActionModalVisible(false)}
        onAction={handleQuickAction}
      />
      
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
          onSettingsClick={() => setShowSettingsDrawer(true)}
          onUpgradeClick={() => setShowUpgradeModal(true)}
          contextCaptureEnabled={contextCaptureEnabled}
          onContextCaptureChange={(enabled) => {
            setContextCaptureEnabled(enabled);
            setIsActive(enabled);
          }}
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

      {/* Test components section */}
      <div className="p-6 mt-6 bg-slate-800/40 rounded-xl border border-cyan-500/20">
        <h3 className="text-cyan-400 font-semibold mb-4">Test These Components</h3>
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
      </div>

      <SettingsDrawer 
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
      />

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
        touchPosition={touchPosition}
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
        terminalHeight={showTerminal ? terminalHeight : 0}
      />

      <MoreDetailsModal 
        element={detailsElement}
        open={showMoreDetails}
        onClose={() => setShowMoreDetails(false)}
        terminalHeight={showTerminal ? terminalHeight : 0}
      />

      {!showTerminal && (
        <Button
          onClick={() => setShowTerminal(true)}
          className={`fixed ${isMobile ? 'bottom-6 right-6 w-16 h-16' : 'bottom-4 right-4 w-12 h-12'} z-30 bg-green-600 hover:bg-green-700 text-white rounded-full p-0 shadow-lg`}
        >
          <span style={{ 
            fontSize: isMobile ? 24 : 32, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            {isMobile ? '⌨' : '>'}
          </span>
        </Button>
      )}

      {showTerminal && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            top: isMobile ? 0 : 'auto',
            zIndex: 100,
            height: isMobile ? '100vh' : terminalHeight,
            minHeight: terminalMinHeight,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: isMobile ? 'rgba(15, 23, 42, 0.98)' : 'transparent',
          }}
        >
          {/* Mobile: Add close button at top */}
          {isMobile && (
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-green-500/30">
              <h3 className="text-green-400 font-semibold">LogTrace Terminal</h3>
              <Button
                onClick={() => setShowTerminal(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
          )}
          
          {/* Desktop: Resize handle */}
          {!isMobile && (
            <div
              style={{
                height: 8,
                cursor: 'ns-resize',
                background: 'rgba(34,197,94,0.15)',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                zIndex: 101,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                resizingRef.current = true;
              }}
            />
          )}
          
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <TabbedTerminal
              showTerminal={showTerminal}
              setShowTerminal={setShowTerminal}
              events={events}
              exportEvents={exportEvents}
              clearEvents={clearEvents}
              debugResponses={debugResponses}
              clearDebugResponses={clearDebugResponses}
              terminalHeight={isMobile ? undefined : terminalHeight}
            />
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        remainingUses={remainingUses}
      />
    </div>
  );
};

export default LogTrace;
