import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';
import { useIframeBridge } from '@/shared/hooks/useIframeBridge';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from './LogTrace/Header';
import MouseOverlay from './LogTrace/MouseOverlay';
import ElementInspector from './LogTrace/ElementInspector';
import DebugModal from './LogTrace/DebugModal';
import TabbedTerminal from './LogTrace/TabbedTerminal';
import MoreDetailsModal from './LogTrace/PinnedDetails';
import SettingsDrawer from './LogTrace/SettingsDrawer';
import UpgradeModal from './LogTrace/UpgradeModal';
import QuickActionModal from './LogTrace/QuickActionModal';
import { Button } from './ui/button';
import html2canvas from 'html2canvas';

interface LogTraceProps {
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}

const LogTrace: React.FC<LogTraceProps> = ({ iframeRef }) => {
  const [showInteractivePanel, setShowInteractivePanel] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [pausedPosition, setPausedPosition] = useState({ x: 0, y: 0 });
  const [pausedElement, setPausedElement] = useState<any>(null);
  const interactivePanelRef = useRef<HTMLDivElement>(null);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [detailsElement, setDetailsElement] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [quickActionModalVisible, setQuickActionModalVisible] = useState(false);
  const [quickActionModalX, setQuickActionModalX] = useState(0);
  const [quickActionModalY, setQuickActionModalY] = useState(0);
  const logTraceRef = useRef<HTMLDivElement>(null);
  
  // Mobile detection
  const isMobile = useIsMobile();
  
  // Terminal height - mobile vs desktop
  const [terminalHeight, setTerminalHeight] = useState(() => {
    const baseHeight = isMobile ? window.innerHeight * 0.6 : window.innerHeight * 0.4;
    return Math.max(baseHeight, isMobile ? 300 : 200);
  });
  const terminalMinHeight = isMobile ? 300 : 200;
  const resizingRef = useRef(false);

  // Usage tracking with new credits system
  const {
    remainingUses,
    canUseAiDebug,
    incrementAiDebugUsage,
    isPremium,
  } = useUsageTracking();

  // Main LogTrace functionality
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

  // Iframe bridge functionality
  const {
    isIframeReady,
    isSameOrigin,
    iframeElement,
    iframeMousePosition,
    activateIframe,
    deactivateIframe
  } = useIframeBridge(iframeRef || { current: null });

  const {
    debugResponses,
    addDebugResponse,
    clearDebugResponses,
  } = useDebugResponses();

  const { toast } = useToast();

  // Determine which element and position to use (iframe or direct)
  const effectiveElement = iframeElement || currentElement;
  const effectivePosition = iframeRef && iframeElement ? iframeMousePosition : mousePosition;

  // Handle iframe activation/deactivation
  useEffect(() => {
    if (iframeRef?.current) {
      if (isActive) {
        activateIframe();
      } else {
        deactivateIframe();
      }
    }
  }, [isActive, activateIframe, deactivateIframe, iframeRef]);

  // Auto-open upgrade modal when landing page sends ?upgrade=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgrade') === '1') {
      setShowUpgradeModal(true);
    }
  }, []);

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

  // Element click handler
  const handleElementClick = useCallback(() => {
    if (!effectiveElement) return;
    
    setShowDebugModal(false);
    setShowInteractivePanel(true);
    
    addEvent({
      type: 'inspect',
      position: effectivePosition,
      element: {
        tag: effectiveElement.tag,
        id: effectiveElement.id,
        classes: effectiveElement.classes,
        text: effectiveElement.text,
      },
    });
  }, [effectiveElement, effectivePosition, addEvent, setShowDebugModal, setShowInteractivePanel]);

  // Debug from panel handler
  const handleDebugFromPanel = useCallback(() => {
    if (!canUseAiDebug) {
      setShowUpgradeModal(true);
      return;
    }

    setShowInteractivePanel(false);
    setShowDebugModal(true);
    
    if (effectiveElement) {
      addEvent({
        type: 'debug',
        position: effectivePosition,
        element: {
          tag: effectiveElement.tag,
          id: effectiveElement.id,
          classes: effectiveElement.classes,
          text: effectiveElement.text,
        },
      });
    }
  }, [effectiveElement, effectivePosition, addEvent, setShowDebugModal, setShowInteractivePanel, canUseAiDebug]);

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
    if (isPremium) {
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

    if (!canUseAiDebug) {
      setShowUpgradeModal(true);
      return null;
    }

    try {
      const response = await analyzeWithAI(prompt);
      addDebugResponse(prompt, response || 'No response received');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error occurred during analysis';
      addDebugResponse(prompt, errorMessage);
      return null;
    }
  }, [analyzeWithAI, addDebugResponse, canUseAiDebug, isPremium]);

  // Mouse move handler - only for direct DOM when no iframe
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || isHoverPaused || iframeRef?.current) return;

    setMousePosition({ x: e.clientX, y: e.clientY });

    if (showDebugModal) return;

    const target = e.target as HTMLElement;
    if (target && 
        !target.closest('#logtrace-overlay') && 
        !target.closest('#logtrace-modal') &&
        !target.closest('[data-interactive-panel]') &&
        !target.closest('[data-element-inspector]')) {
      const elementInfo = extractElementInfo(target);
      setCurrentElement(elementInfo);
      
      if (showInteractivePanel && !showDebugModal) {
        setShowInteractivePanel(false);
      }
    }
  }, [isActive, isHoverPaused, extractElementInfo, setMousePosition, setCurrentElement, showInteractivePanel, showDebugModal, iframeRef]);

  // Click handler - only for direct DOM when no iframe
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || iframeRef?.current) return;
    
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
  }, [isActive, currentElement, addEvent, iframeRef]);

  // Quick action handler
  const handleQuickAction = async (action: 'screenshot' | 'context' | 'debug') => {
    setQuickActionModalVisible(false);
    if (action === 'screenshot') {
      try {
        await new Promise(res => setTimeout(res, 100));
        const canvas = await html2canvas(document.body);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'logtrace-screenshot.png';
        link.click();
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
      if (!effectiveElement) {
        toast({ title: 'No Element Selected', description: 'Please select an element to debug.', variant: 'default' });
        return;
      }
      setShowDebugModal(true);
    }
  };

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      
      if (isActive && e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        
        if (!canUseAiDebug) {
          setShowUpgradeModal(true);
          return;
        }

        setShowInteractivePanel(false);
        setShowDebugModal(true);
        
        if (effectiveElement) {
          addEvent({
            type: 'debug',
            position: effectivePosition,
            element: {
              tag: effectiveElement.tag,
              id: effectiveElement.id,
              classes: effectiveElement.classes,
              text: effectiveElement.text,
            },
          });
        }
      }
      
      if (isActive && e.key === 'd' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (!isHoverPaused) {
          setPausedPosition(effectivePosition);
          setPausedElement(effectiveElement);
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
    effectivePosition, 
    effectiveElement, 
    addEvent, 
    setShowDebugModal, 
    isHoverPaused, 
    showTerminal, 
    setShowTerminal, 
    setIsActive,
    handleEscape,
    canUseAiDebug
  ]);

  // Mouse events for resizing
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
      className="min-h-screen bg-transparent text-green-400 font-mono relative overflow-hidden pointer-events-none"
      onMouseMove={handleMouseMove}
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
        
        <div className="relative z-10 p-6">
          <Header 
            isActive={isActive}
            setIsActive={setIsActive}
            showTerminal={showTerminal}
            setShowTerminal={setShowTerminal}
            remainingUses={remainingUses}
            onSettingsClick={() => setShowSettingsDrawer(true)}
            onUpgradeClick={() => setShowUpgradeModal(true)}
            contextCaptureEnabled={isActive}
            onContextCaptureChange={setIsActive}
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

        <SettingsDrawer 
          isOpen={showSettingsDrawer}
          onClose={() => setShowSettingsDrawer(false)}
        />

        <MouseOverlay 
          isActive={isActive}
          currentElement={isHoverPaused ? pausedElement : effectiveElement}
          mousePosition={isHoverPaused ? pausedPosition : effectivePosition}
          overlayRef={overlayRef}
          onElementClick={handleElementClick}
        />

        <div data-interactive-panel>
          <ElementInspector
            isVisible={showInteractivePanel}
            currentElement={effectiveElement}
            mousePosition={effectivePosition}
            onDebug={handleDebugFromPanel}
            onClose={() => setShowInteractivePanel(false)}
            panelRef={interactivePanelRef}
            onShowMoreDetails={() => {
              setDetailsElement(effectiveElement);
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
          currentElement={effectiveElement}
          mousePosition={effectivePosition}
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
