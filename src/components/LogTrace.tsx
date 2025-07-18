import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';
import { useLogTraceEventHandlers } from '@/shared/hooks/useLogTraceEventHandlers';
import { usePinnedDetails } from '@/shared/hooks/usePinnedDetails';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useIsMobile } from '@/hooks/use-mobile';
import InstructionsCard from './LogTrace/InstructionsCard';
import MouseOverlay from './LogTrace/MouseOverlay';
import ElementInspector from './LogTrace/ElementInspector';
import DebugModal from './LogTrace/DebugModal';
import TabbedTerminal from './LogTrace/TabbedTerminal';
import MoreDetailsModal from './LogTrace/PinnedDetails';
import OnboardingWalkthrough from './LogTrace/OnboardingWalkthrough';
import SettingsDrawer from './LogTrace/SettingsDrawer';
import UpgradeModal from './LogTrace/UpgradeModal';
import FloatingHint from './LogTrace/FloatingHint';
import QuickActionModal from './LogTrace/QuickActionModal';
import { Button } from './ui/button';
import html2canvas from 'html2canvas';
import { Switch } from './ui/switch';
import RectScreenshotOverlay from './LogTrace/RectScreenshotOverlay';
import FreeformScreenshotOverlay from './LogTrace/FreeformScreenshotOverlay';
import { v4 as uuidv4 } from 'uuid';
import { ElementInfo } from '@/shared/types';

type ScreenshotMode = 'rectangle' | 'window' | 'fullscreen' | 'freeform';

interface LogTraceProps {
  showOnboarding?: boolean;
  onOnboardingComplete?: () => void;
}

const LogTrace: React.FC<LogTraceProps> = ({ 
  showOnboarding: externalShowOnboarding, 
  onOnboardingComplete: externalOnboardingComplete 
}) => {
  const [showInteractivePanel, setShowInteractivePanel] = useState(false);
  const [showElementInspector, setShowElementInspector] = useState(false);
  const [isInspectorHovered, setIsInspectorHovered] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [pausedElement, setPausedElement] = useState<ElementInfo | null>(null);
  const [pausedPosition, setPausedPosition] = useState<{ x: number; y: number } | null>(null);
  const interactivePanelRef = useRef<HTMLDivElement>(null);
  const elementInspectorRef = useRef<HTMLDivElement>(null);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [detailsElement, setDetailsElement] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Use external onboarding state if provided, otherwise use local state
  const [localShowOnboarding, setLocalShowOnboarding] = useState(() => {
    return !localStorage.getItem('logtrace-onboarding-completed');
  });
  
  const showOnboarding = externalShowOnboarding !== undefined ? externalShowOnboarding : localShowOnboarding;
  
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
  const logTraceRef = useRef<HTMLDivElement>(null);
  const [contextCaptureEnabled, setContextCaptureEnabled] = useState(false);
  const [activeScreenshotOverlay, setActiveScreenshotOverlay] = useState<null | 'rectangle' | 'freeform'>(null);
  const [openInspectors, setOpenInspectors] = useState<Array<{ id: string, elementInfo: ElementInfo, mousePosition: { x: number, y: number }, timestamp: number }>>([]);
  const [clipboardFallback, setClipboardFallback] = useState<{ response: string, open: boolean }>({ response: '', open: false });
  
  // Quick Action Modal state
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickActionPosition, setQuickActionPosition] = useState({ x: 0, y: 0 });

  // Usage tracking with new credits system
  const {
    remainingUses,
    hasReachedLimit,
    canUseAiDebug,
    incrementAiDebugUsage,
    isPremium,
    waitlistBonusRemaining,
  } = useUsageTracking();

  // Pinned details functionality
  const {
    pinnedDetails,
    addPin,
    removePin,
    updatePinPosition,
    clearAllPins,
  } = usePinnedDetails();

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

  // Escape handler - only handles modals/overlays now
  const handleEscape = useCallback(() => {
    setOpenInspectors((prev) => prev.length > 0 ? prev.slice(0, -1) : prev);
    setShowDebugModal(false);
    setShowSettingsDrawer(false);
    setShowQuickActions(false);
    if (showTerminal) setShowTerminal(false);
  }, [setShowDebugModal, showTerminal, setShowTerminal]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleEscape();
      } else if (e.key === 'q' || e.key === 'Q') {
        // Show quick actions at mouse position
        setQuickActionPosition({ x: mousePosition.x, y: mousePosition.y });
        setShowQuickActions(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleEscape, mousePosition]);

  // Element click handler - streamlined to directly open element inspector
  const handleElementClick = useCallback(() => {
    if (!currentElement) return;
    setShowDebugModal(false);
    
    // Check if we already have 3 panels open (max limit)
    if (openInspectors.length >= 3) {
      // Show a simple alert for now, we'll enhance this later
      alert('Maximum panels reached. Please close one of the existing inspector panels first.');
      return;
    }
    
    // Add new inspector panel
    const newInspector = {
      id: `inspector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      elementInfo: currentElement,
      mousePosition: mousePosition,
      timestamp: Date.now(),
    };
    
    setOpenInspectors(prev => [...prev, newInspector]);
    
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
  }, [currentElement, mousePosition, addEvent, setShowDebugModal, openInspectors.length]);

  // Quick Action handler
  const handleQuickAction = useCallback((action: 'screenshot' | 'context' | 'debug' | 'details' | { type: 'screenshot', mode: ScreenshotMode } | { type: 'context', mode: string, input: string }) => {
    setShowQuickActions(false);
    
    if (action === 'details') {
      setShowMoreDetails(true);
      setDetailsElement(currentElement);
    } else if (action === 'debug') {
      setShowDebugModal(true);
    } else if (action === 'screenshot' || (typeof action === 'object' && action.type === 'screenshot')) {
      const mode = typeof action === 'object' ? action.mode : 'window';
      setActiveScreenshotOverlay(mode === 'freeform' ? 'freeform' : 'rectangle');
    } else if (typeof action === 'object' && action.type === 'context') {
      // Handle context generation
      const prompt = `Context Action: ${action.mode}\nUser Input: ${action.input}\nElement: ${currentElement ? JSON.stringify(currentElement) : 'none'}`;
      console.log('Context generation:', prompt);
      // You can add AI call here if needed
    }
  }, [currentElement, setShowDebugModal, setShowMoreDetails, setDetailsElement, setActiveScreenshotOverlay]);

  // Get mouse and click handlers from the hook
  const { handleMouseMove, handleClick } = useLogTraceEventHandlers({
    isActive,
    isHoverPaused,
    currentElement,
    mousePosition,
    showInteractivePanel,
    setMousePosition,
    setCurrentElement,
    setShowInteractivePanel,
    setShowDebugModal,
    extractElementInfo,
    addEvent,
    handleEscape,
    onElementClick: handleElementClick,
  });

  const { toast } = useToast();

  // Sync contextCaptureEnabled with isActive state
  useEffect(() => {
    if (contextCaptureEnabled && !isActive) {
      setIsActive(true);
    }
  }, [contextCaptureEnabled, isActive, setIsActive]);

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

  // Screenshot handling functions
  const handleScreenshot = useCallback(async (mode: 'window' | 'fullscreen' | 'element') => {
    try {
      let canvas;
      if (mode === 'fullscreen') {
        canvas = await html2canvas(document.body);
      } else if (mode === 'window') {
        canvas = await html2canvas(document.documentElement);
      } else {
        // element mode - not implemented yet
        toast({ title: 'Element screenshot not implemented yet', variant: 'default' });
        return;
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `logtrace-screenshot-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast({ title: 'Screenshot saved!', variant: 'success' });
        }
      });
    } catch (error) {
      toast({ title: 'Screenshot failed', description: 'Could not capture screenshot', variant: 'destructive' });
    }
  }, [toast]);

  const handleScreenshotOverlayComplete = useCallback(async (dataUrl: string) => {
    setActiveScreenshotOverlay(null);
    
    try {
      // Create a download link for the screenshot
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `logtrace-screenshot-${Date.now()}.png`;
      a.click();
      toast({ title: 'Screenshot saved!', variant: 'success' });
    } catch (error) {
      toast({ title: 'Screenshot failed', description: 'Could not save screenshot', variant: 'destructive' });
    }
  }, [toast]);

  // Right-click handler for quick actions
  const handleRightClick = useCallback((e: React.MouseEvent) => {
    if (currentElement) {
      // Show quick actions for elements
      setQuickActionPosition({ x: e.clientX, y: e.clientY });
      setShowQuickActions(true);
    }
    // No context menu for empty space - just prevent default
    e.preventDefault();
  }, [currentElement]);

  // Onboarding handlers
  const handleOnboardingNext = () => {
    setOnboardingStep(prev => prev + 1);
  };

  const handleOnboardingSkip = () => {
    if (externalOnboardingComplete) {
      externalOnboardingComplete();
    } else {
      setLocalShowOnboarding(false);
      localStorage.setItem('logtrace-onboarding-completed', 'true');
    }
  };

  const handleOnboardingComplete = () => {
    if (externalOnboardingComplete) {
      externalOnboardingComplete();
    } else {
      setLocalShowOnboarding(false);
      localStorage.setItem('logtrace-onboarding-completed', 'true');
    }
  };

  const handleAnalyzeWithAI = useCallback(async (prompt: string) => {
    if (isPremium) {
      try {
        const response = await analyzeWithAI(prompt);
        addDebugResponse(prompt, response || 'No response received');
        setShowTerminal(true);
        toast({
          title: 'Request sent!',
          description: 'Your AI debug results are now in the terminal (bottom right).',
          variant: 'success',
          duration: 5000,
        });
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error occurred during analysis';
        addDebugResponse(prompt, errorMessage);
        return null;
      }
    }

    if (!canUseAiDebug) {
      setShowUpgradeModal(true);
      return null;
    }

    try {
      const response = await analyzeWithAI(prompt);
      addDebugResponse(prompt, response || 'No response received');
      setShowTerminal(true);
      toast({
        title: 'Request sent!',
        description: 'Your AI debug results are now in the terminal (bottom right).',
        variant: 'success',
        duration: 5000,
      });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error occurred during analysis';
      addDebugResponse(prompt, errorMessage);
      return null;
    }
  }, [analyzeWithAI, addDebugResponse, canUseAiDebug, isPremium, setShowTerminal, toast]);

  // Mouse tracking logic
  useEffect(() => {
    if (!isHoverPaused) {
      setPausedElement(null);
      setPausedPosition(null);
    }
  }, [isHoverPaused]);

  const handleInspectorMouseEnter = () => {
    setIsInspectorHovered(true);
          setIsHoverPaused(true);
  };
  const handleInspectorMouseLeave = () => {
    setIsInspectorHovered(false);
          setIsHoverPaused(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingRef.current) {
        // Calculate height from bottom of viewport to mouse position
        const newHeight = Math.max(window.innerHeight - e.clientY, terminalMinHeight);
        // Also ensure it doesn't exceed 80% of viewport height
        const maxHeight = window.innerHeight * 0.8;
        const clampedHeight = Math.min(newHeight, maxHeight);
        setTerminalHeight(clampedHeight);
      }
    };
    const handleMouseUp = () => {
      if (resizingRef.current) {
      resizingRef.current = false;
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [terminalMinHeight]);

  return (
    <div
      ref={logTraceRef}
      className="min-h-screen bg-slate-900 text-green-400 font-mono relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onContextMenu={handleRightClick}
    >
      {/* Quick Action Modal */}
      <QuickActionModal
        visible={showQuickActions}
        x={quickActionPosition.x}
        y={quickActionPosition.y}
        onClose={() => setShowQuickActions(false)}
        onAction={handleQuickAction}
      />

      {/* Floating Hint */}
      <FloatingHint 
        isActive={isActive}
        currentElement={currentElement}
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-green-400 font-bold text-2xl">LogTrace</h1>
          <div className="flex items-center gap-4">
            {/* Capture Toggle with Status */}
            <div className="flex items-center gap-3 bg-slate-800/60 border border-green-500/30 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
                  {isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Capture:</span>
            <Switch
              checked={contextCaptureEnabled}
              onCheckedChange={(checked) => {
                setContextCaptureEnabled(checked);
                setIsActive(checked);
              }}
              aria-label="Context Capture"
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-600"
                />
              </div>
            </div>
            
            {/* Credits Display */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 border border-green-500/30 rounded-full">
              <span className="text-xs text-green-400 font-semibold">
                {remainingUses}/5 credits
              </span>
              {waitlistBonusRemaining > 0 && (
                <span className="flex items-center gap-1 ml-2 text-yellow-400 font-semibold text-xs">
                  +{waitlistBonusRemaining} bonus
                </span>
              )}
            </div>
            
            <Button onClick={() => setShowSettingsDrawer(true)} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Settings
            </Button>
            <Button onClick={() => setShowUpgradeModal(true)} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Upgrade
            </Button>
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
        <div className="text-sm text-gray-400 bg-slate-800/60 rounded p-3">
          <p className="font-semibold text-cyan-400 mb-2">New Context Menu System:</p>
          <p>• <strong>Right-click anywhere</strong> to access all LogTrace actions</p>
          <p>• <strong>No more keyboard shortcuts</strong> - type freely without conflicts</p>
          <p>• <strong>Context-aware options</strong> - different actions based on current state</p>
          <p>• <strong>Element-specific actions</strong> when hovering over elements</p>
        </div>
      </div>

      {/* All existing components remain the same */}
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
          showInspectorOpen={openInspectors.length > 0}
          showTerminal={showTerminal}
        />
      )}

      <MouseOverlay 
        isActive={isActive}
          currentElement={currentElement}
          mousePosition={mousePosition}
        overlayRef={overlayRef}
        />



      {/* Sticky Element Inspectors - supports up to 3 panels */}
      {openInspectors.map((inspector, index) => {
        // Stagger positioning to avoid overlap
        const offsetX = index * 20;
        const offsetY = index * 20;
        const adjustedPosition = {
          x: inspector.mousePosition.x + offsetX,
          y: inspector.mousePosition.y + offsetY,
        };
        
        return (
        <ElementInspector
            key={inspector.id}
            isVisible={true}
            currentElement={inspector.elementInfo}
            mousePosition={adjustedPosition}
            onDebug={() => setShowDebugModal(true)}
            onClose={() => {
              setOpenInspectors(prev => prev.filter(i => i.id !== inspector.id));
            }}
            panelRef={elementInspectorRef}
          onShowMoreDetails={() => {
              setDetailsElement(inspector.elementInfo);
            setShowMoreDetails(true);
          }}
          currentDebugCount={5 - remainingUses}
          maxDebugCount={5}
            onMouseEnter={handleInspectorMouseEnter}
            onMouseLeave={handleInspectorMouseLeave}
        />
        );
      })}

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
          
          {!isMobile && (
            <div
              style={{
                height: 12,
                cursor: 'ns-resize',
                background: 'rgba(34,197,94,0.2)',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                zIndex: 101,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                resizingRef.current = true;
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(34,197,94,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(34,197,94,0.2)';
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  background: 'rgba(34,197,94,0.6)',
                  borderRadius: 2,
                }}
              />
            </div>
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
              terminalHeight={terminalHeight}
            />
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        remainingUses={remainingUses}
      />

      {activeScreenshotOverlay === 'rectangle' && (
        <RectScreenshotOverlay onComplete={handleScreenshotOverlayComplete} />
      )}
      {activeScreenshotOverlay === 'freeform' && (
        <FreeformScreenshotOverlay onComplete={handleScreenshotOverlayComplete} />
      )}

      {clipboardFallback.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-green-500/30 rounded-xl shadow-2xl p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold text-red-400 mb-2">Copy to Clipboard</h2>
            <p className="text-green-200 mb-2">Automatic copy failed. Please copy the AI response below manually:</p>
            <textarea
              className="w-full h-40 bg-slate-800 text-green-400 p-2 rounded mb-4"
              value={clipboardFallback.response}
              readOnly
            />
            <div className="flex gap-2 justify-end">
              <Button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(clipboardFallback.response);
                    setClipboardFallback({ response: '', open: false });
                    toast({ title: 'Copied!', description: 'AI response copied to clipboard.', variant: 'success' });
                  } catch {
                    toast({ title: 'Copy Failed', description: 'Still unable to copy. Please select and copy manually.', variant: 'destructive' });
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Copy
              </Button>
              <Button
                onClick={() => setClipboardFallback({ response: '', open: false })}
                className="bg-gray-700 hover:bg-gray-800 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogTrace;
