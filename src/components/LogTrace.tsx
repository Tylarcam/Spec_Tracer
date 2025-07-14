import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGesture } from '@/shared/gestureManager';
import Header from './LogTrace/Header';
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

interface LogTraceProps {
  contextCaptureEnabled?: boolean;
  onContextCaptureChange?: (enabled: boolean) => void;
  showTerminal?: boolean;
  onShowTerminalChange?: (show: boolean) => void;
  hideHeader?: boolean;
}

const LogTrace: React.FC<LogTraceProps> = ({
  contextCaptureEnabled: externalContextCapture,
  onContextCaptureChange,
  showTerminal: externalShowTerminal,
  onShowTerminalChange,
  hideHeader = false,
}) => {
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
    if (hideHeader) return false; // Don't show onboarding in iframe mode
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
  
  // Use external state if provided, otherwise use internal state
  const [internalContextCapture, setInternalContextCapture] = useState(false);
  const [internalShowTerminal, setInternalShowTerminal] = useState(false);
  
  const contextCaptureEnabled = externalContextCapture !== undefined ? externalContextCapture : internalContextCapture;
  const showTerminal = externalShowTerminal !== undefined ? externalShowTerminal : internalShowTerminal;
  
  const setContextCaptureEnabled = (enabled: boolean) => {
    if (onContextCaptureChange) {
      onContextCaptureChange(enabled);
    } else {
      setInternalContextCapture(enabled);
    }
  };
  
  const setShowTerminal = (show: boolean) => {
    if (onShowTerminalChange) {
      onShowTerminalChange(show);
    } else {
      setInternalShowTerminal(show);
    }
  };

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
    } else if (!contextCaptureEnabled && isActive) {
      setIsActive(false);
    }
  }, [contextCaptureEnabled, isActive, setIsActive]);

  // Sync mobile gesture state with context capture
  useEffect(() => {
    if (captureActive !== contextCaptureEnabled) {
      setContextCaptureEnabled(captureActive);
      setIsActive(captureActive);
    }
  }, [captureActive, contextCaptureEnabled, setIsActive]);

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
  }, [setShowDebugModal, showTerminal, setShowTerminal]);

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

  // Mouse move handler - adapted for iframe context
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

  // Click handler - adapted for iframe context
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
        // Screenshot the entire iframe parent document
        const canvas = await html2canvas(document.body);
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
          toast({ title: 'Screenshot', description: 'Screenshot downloaded and copied to clipboard', variant: 'default' });
        } catch (clipErr) {
          toast({ title: 'Screenshot', description: 'Downloaded, but failed to copy to clipboard', variant: 'default' });
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
        toast({ title: 'Context Prompt Copied', description: 'The generated context prompt has been copied to your clipboard.', variant: 'default' });
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
          setContextCaptureEnabled(true);
        }
      }
      
      if (e.key === 'e' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (isActive) {
          setIsActive(false);
          setContextCaptureEnabled(false);
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
    canUseAiDebug,
    setContextCaptureEnabled
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
      className="min-h-screen bg-transparent text-green-400 font-mono relative overflow-hidden pointer-events-none"
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
      <div className="pointer-events-auto">
        <QuickActionModal
          visible={quickActionModalVisible}
          x={quickActionModalX}
          y={quickActionModalY}
          onClose={() => setQuickActionModalVisible(false)}
          onAction={handleQuickAction}
        />
        
        {/* Only show header if not hidden */}
        {!hideHeader && (
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
          </div>
        )}

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

        {!showTerminal && !hideHeader && (
          <Button
            onClick={() => setShowTerminal(true)}
            className={`fixed ${isMobile ? 'bottom-6 right-6 w-16 h-16' : 'bottom-4 right-4 w-12 h-12'} z-30 bg-green-600 hover:bg-green-700 text-white rounded-full p-0 shadow-lg pointer-events-auto`}
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
            className="pointer-events-auto"
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
    </div>
  );
};

export default LogTrace;
