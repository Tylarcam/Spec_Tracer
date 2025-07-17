
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';
import { useLogTraceEventHandlers } from '@/shared/hooks/useLogTraceEventHandlers';
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
import QuickActionModal from './LogTrace/QuickActionModal';
import { Button } from './ui/button';
import html2canvas from 'html2canvas';
import { Switch } from './ui/switch';
import RectScreenshotOverlay from './LogTrace/RectScreenshotOverlay';
import FreeformScreenshotOverlay from './LogTrace/FreeformScreenshotOverlay';
import { v4 as uuidv4 } from 'uuid';
import { ElementInfo } from '@/shared/types';

interface LogTraceProps {
  showOnboarding?: boolean;
  onOnboardingComplete?: () => void;
}

const LogTrace: React.FC<LogTraceProps> = ({ 
  showOnboarding: externalShowOnboarding, 
  onOnboardingComplete: externalOnboardingComplete 
}) => {
  const [showInteractivePanel, setShowInteractivePanel] = useState(false);
  const [isInspectorHovered, setIsInspectorHovered] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [pausedElement, setPausedElement] = useState<ElementInfo | null>(null);
  const [pausedPosition, setPausedPosition] = useState<{ x: number; y: number } | null>(null);
  const interactivePanelRef = useRef<HTMLDivElement>(null);
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
  const [quickActionModalVisible, setQuickActionModalVisible] = useState(false);
  const [quickActionModalX, setQuickActionModalX] = useState(0);
  const [quickActionModalY, setQuickActionModalY] = useState(0);
  const logTraceRef = useRef<HTMLDivElement>(null);
  const [contextCaptureEnabled, setContextCaptureEnabled] = useState(false);
  const [activeScreenshotOverlay, setActiveScreenshotOverlay] = useState<null | 'rectangle' | 'freeform'>(null);
  const [openInspectors, setOpenInspectors] = useState<Array<{ id: string, elementInfo: ElementInfo, mousePosition: { x: number, y: number } }>>([]);
  const [clipboardFallback, setClipboardFallback] = useState<{ response: string, open: boolean }>({ response: '', open: false });

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

  // Escape handler
  const handleEscape = useCallback(() => {
    setOpenInspectors((prev) => prev.length > 0 ? prev.slice(0, -1) : prev);
    setShowDebugModal(false);
    setIsHoverPaused(false);
    setShowSettingsDrawer(false);
    if (showTerminal) setShowTerminal(false);
  }, [setShowDebugModal, showTerminal, setShowTerminal]);

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

  const handleMultiElementContext = useCallback(async () => {
    try {
      const elementsInfo = openInspectors.map(inspector => inspector.elementInfo);
      const prompt = `Generate context for multiple elements:
${elementsInfo.map((el, index) => `
Element ${index + 1}:
- Tag: ${el.tag}
- ID: ${el.id}
- Classes: ${el.classes.join(', ')}
- Text: ${el.text}
- Parent Path: ${el.parentPath}
`).join('')}

Please provide a comprehensive analysis of these elements and their relationships.`;

      const aiResponse = await analyzeWithAI(prompt);
      addDebugResponse(prompt, aiResponse);
      
      try {
        await navigator.clipboard.writeText(aiResponse);
        toast({ title: 'Multi-Element Context Copied', description: 'Context for all selected elements has been copied to your clipboard.', variant: 'success' });
      } catch (err) {
        setClipboardFallback({ response: aiResponse, open: true });
      }
    } catch (err) {
      toast({ title: 'Context Generation Failed', description: 'Failed to generate multi-element context.', variant: 'destructive' });
    }
  }, [openInspectors, analyzeWithAI, addDebugResponse, toast]);

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

  const handleAnalyzeWithAI = useCallback(async (prompt: string) => {
    // Check usage limit for premium users
    if (isPremium) {
      // Premium users have unlimited access
      try {
        const response = await analyzeWithAI(prompt);
        addDebugResponse(prompt, response || 'No response received');
        // UX improvement: open terminal and show toast
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

    // For non-premium users, check credit availability
    if (!canUseAiDebug) {
      setShowUpgradeModal(true);
      return null;
    }

    try {
      // The credit will be used inside analyzeWithAI via the API call
      const response = await analyzeWithAI(prompt);
      addDebugResponse(prompt, response || 'No response received');
      // UX improvement: open terminal and show toast
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

  const handleUpgradeClick = useCallback(() => {
    setShowUpgradeModal(true);
  }, []);

  const handleSettingsClick = useCallback(() => {
    setShowSettingsDrawer(true);
  }, []);

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

  const handleQuickAction = async (
    action: 'screenshot' | 'context' | 'debug' | 'details' | { type: 'screenshot', mode: 'rectangle' | 'window' | 'fullscreen' | 'freeform' } | { type: 'context', mode: string, input: string }
  ) => {
    setQuickActionModalVisible(false);

    // Handle screenshot with specific mode
    if (typeof action === 'object' && action.type === 'screenshot') {
      if (action.mode === 'rectangle' || action.mode === 'freeform') {
        setActiveScreenshotOverlay(action.mode);
        return;
      }
      await handleScreenshot(action.mode);
      return;
    }

    // Handle context generation with user input
    if (typeof action === 'object' && action.type === 'context') {
      try {
        // Check usage limit before proceeding
        if (!canUseAiDebug) {
          setShowUpgradeModal(true);
          return;
        }

        // Build a prompt based on mode and input
        const elementInfo = currentElement ? {
          tag: currentElement.tag,
          id: currentElement.id,
          classes: currentElement.classes,
          text: currentElement.text,
          parentPath: currentElement.parentPath,
          attributes: currentElement.attributes,
          size: currentElement.size,
        } : null;

        const prompt = `Context Action: ${action.mode}
User Input: ${action.input}
Element: ${elementInfo ? JSON.stringify(elementInfo, null, 2) : 'none'}

Please provide a response for the "${action.mode}" action with the user's specific request: "${action.input}"`;

        const aiResponse = await analyzeWithAI(prompt);
        addDebugResponse(prompt, aiResponse);
        
        // Copy to clipboard
        try {
          await navigator.clipboard.writeText(aiResponse);
          toast({ 
            title: 'Context Generated', 
            description: `AI response for "${action.mode}" copied to clipboard`, 
            variant: 'success' 
          });
        } catch (err) {
          setClipboardFallback({ response: aiResponse, open: true });
          toast({ 
            title: 'Context Generation Failed', 
            description: 'Failed to copy to clipboard. See details below.', 
            variant: 'destructive' 
          });
        }

        // Track usage
        incrementAiDebugUsage();
        
        // Open terminal to show results
        setShowTerminal(true);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        toast({ 
          title: 'AI Generation Failed', 
          description: errorMessage, 
          variant: 'destructive' 
        });
      }
      return;
    }

    // Handle simple actions
    if (action === 'screenshot') {
      await handleScreenshot('fullscreen');
    } else if (action === 'context') {
      if (openInspectors.length > 0) {
        await handleMultiElementContext();
      } else {
        try {
          const prompt = generateAdvancedPrompt();
          if (!prompt || prompt.trim() === '') {
            toast({ title: 'No Element Selected', description: 'Please select an element to generate context.', variant: 'default' });
            return;
          }
          const aiResponse = await analyzeWithAI(prompt);
          addDebugResponse(prompt, aiResponse);
          try {
            await navigator.clipboard.writeText(aiResponse);
            toast({ title: 'Context Prompt Copied', description: 'The generated context prompt has been copied to your clipboard.', variant: 'success' });
          } catch (err) {
            setClipboardFallback({ response: aiResponse, open: true });
            toast({ title: 'Context Generation Failed', description: 'Failed to copy to clipboard. See details below.', variant: 'destructive' });
          }
        } catch (err) {
          toast({ title: 'AI Generation Failed', description: 'Failed to generate context.', variant: 'destructive' });
        }
      }
    } else if (action === 'debug') {
      if (!currentElement) {
        toast({ title: 'No Element Selected', description: 'Please select an element to debug.', variant: 'default' });
        return;
      }
      setShowDebugModal(true);
    } else if (action === 'details') {
      if (!currentElement) {
        toast({ title: 'No Element Selected', description: 'Please select an element to view details.', variant: 'default' });
        return;
      }
      setDetailsElement(currentElement);
      setShowMoreDetails(true);
    }
  };

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

  return (
    <div
      ref={logTraceRef}
      className="min-h-screen bg-slate-900 text-green-400 font-mono relative overflow-hidden"
      onMouseMove={handleMouseMove}
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-green-400 font-bold text-2xl">LogTrace</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Remaining Uses: {remainingUses}</span>
            <Switch
              checked={contextCaptureEnabled}
              onCheckedChange={(checked) => {
                setContextCaptureEnabled(checked);
                setIsActive(checked);
              }}
              aria-label="Context Capture"
            />
            <Button onClick={handleSettingsClick} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Settings
            </Button>
            <Button onClick={handleUpgradeClick} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
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
          showInspectorOpen={openInspectors.length > 0}
          showTerminal={showTerminal}
        />
      )}

      <MouseOverlay 
        isActive={isActive}
        currentElement={currentElement}
        mousePosition={mousePosition}
        overlayRef={overlayRef}
        onElementClick={handleElementClick}
      />

      {openInspectors.map((inspector) => (
        <div data-interactive-panel key={inspector.id}>
        <ElementInspector
            isVisible={true}
            currentElement={isHoverPaused && pausedElement ? pausedElement : inspector.elementInfo}
            mousePosition={isHoverPaused && pausedPosition ? pausedPosition : inspector.mousePosition}
          onDebug={handleDebugFromPanel}
            onClose={() => setOpenInspectors((prev) => prev.filter((i) => i.id !== inspector.id))}
          panelRef={interactivePanelRef}
          onShowMoreDetails={() => {
              setDetailsElement(inspector.elementInfo);
            setShowMoreDetails(true);
          }}
          currentDebugCount={5 - remainingUses}
          maxDebugCount={5}
          onMouseEnter={handleInspectorMouseEnter}
          onMouseLeave={handleInspectorMouseLeave}
        />
      </div>
      ))}

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
            />
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        remainingUses={remainingUses}
      />

      {/* Screenshot overlays */}
      {activeScreenshotOverlay === 'rectangle' && (
        <RectScreenshotOverlay onComplete={handleScreenshotOverlayComplete} />
      )}
      {activeScreenshotOverlay === 'freeform' && (
        <FreeformScreenshotOverlay onComplete={handleScreenshotOverlayComplete} />
      )}

      {/* Clipboard Fallback Modal */}
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
