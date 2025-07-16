import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { useIframeBridge } from '@/shared/hooks/useIframeBridge';
import { useToast } from '@/hooks/use-toast';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';
import { Button } from './ui/button';
import html2canvas from 'html2canvas';

interface LogTraceProps {
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}

const LogTrace: React.FC<LogTraceProps> = ({ iframeRef }) => {
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [pausedPosition, setPausedPosition] = useState({ x: 0, y: 0 });
  const [pausedElement, setPausedElement] = useState<any>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const logTraceRef = useRef<HTMLDivElement>(null);
  
  const { useCredit } = useCreditsSystem();

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

  // Element click handler
  const handleElementClick = useCallback(() => {
    if (!effectiveElement) return;
    
    setShowDebugModal(true);
    
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
  }, [effectiveElement, effectivePosition, addEvent, setShowDebugModal]);

  // Escape handler
  const handleEscape = useCallback(() => {
    setShowDebugModal(false);
    setIsHoverPaused(false);
    if (showTerminal) setShowTerminal(false);
  }, [setShowDebugModal, showTerminal, setShowTerminal]);

  // Analyze with AI handler
  const handleAnalyzeWithAI = useCallback(async (prompt: string) => {
    try {
      const response = await analyzeWithAI(prompt);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error occurred during analysis';
      return null;
    }
  }, [analyzeWithAI]);

  // Mouse move handler - only for direct DOM when no iframe
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || isHoverPaused || iframeRef?.current) return;

    setMousePosition({ x: e.clientX, y: e.clientY });

    if (showDebugModal) return;

    const target = e.target as HTMLElement;
    if (target && 
        !target.closest('#logtrace-overlay') && 
        !target.closest('#logtrace-modal')) {
      const elementInfo = extractElementInfo(target);
      setCurrentElement(elementInfo);
    }
  }, [isActive, isHoverPaused, extractElementInfo, setMousePosition, setCurrentElement, showDebugModal, iframeRef]);

  // Click handler - only for direct DOM when no iframe
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || iframeRef?.current) return;
    
    const target = e.target as HTMLElement;
    if (target && 
        !target.closest('#logtrace-overlay') && 
        !target.closest('#logtrace-modal')) {
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
    if (action === 'screenshot') {
      try {
        await new Promise(res => setTimeout(res, 100));
        const canvas = await html2canvas(document.body);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'logtrace-screenshot.png';
        link.click();
        toast({ title: 'Screenshot', description: 'Screenshot downloaded', variant: 'default' });
      } catch (err) {
        toast({ title: 'Screenshot', description: 'Screenshot failed', variant: 'destructive' });
      }
    } else if (action === 'context') {
      try {
        const prompt = generateAdvancedPrompt();
        await navigator.clipboard.writeText(prompt);
        toast({ title: 'Context Copied', description: 'Context prompt copied to clipboard', variant: 'default' });
      } catch (err) {
        toast({ title: 'Copy Failed', description: 'Failed to copy context', variant: 'destructive' });
      }
    } else if (action === 'debug') {
      if (!effectiveElement) {
        toast({ title: 'No Element', description: 'Please select an element to debug', variant: 'default' });
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
        setShowTerminal(!showTerminal);
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
    handleEscape
  ]);

  return (
    <div
      ref={logTraceRef}
      className="min-h-screen bg-transparent text-green-400 font-mono relative overflow-hidden pointer-events-none"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onContextMenu={e => {
        e.preventDefault();
        handleQuickAction('debug');
      }}
    >
      <div className="pointer-events-auto">
        {/* Header */}
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsActive(!isActive)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  isActive 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {isActive ? 'Active' : 'Start'}
              </Button>
              
              <Button
                onClick={() => setShowTerminal(!showTerminal)}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
              >
                Terminal
              </Button>
            </div>
            
            <div className="text-sm text-slate-400">
              Press S to start, E to exit, D to debug, T for terminal
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
        </div>

        {/* Mouse Overlay */}
        {isActive && (
          <div
            ref={overlayRef}
            className="fixed inset-0 pointer-events-none z-20"
            style={{
              background: 'rgba(0, 0, 0, 0.1)',
            }}
          >
            {effectiveElement && (
              <div
                className="absolute border-2 border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/50 pointer-events-none"
                style={{
                  left: effectiveElement.element?.getBoundingClientRect?.()?.left || effectivePosition.x,
                  top: effectiveElement.element?.getBoundingClientRect?.()?.top || effectivePosition.y,
                  width: effectiveElement.element?.getBoundingClientRect?.()?.width || 100,
                  height: effectiveElement.element?.getBoundingClientRect?.()?.height || 20,
                }}
              />
            )}
            
            {effectiveElement && (
              <div
                className="absolute bg-slate-900/95 text-green-400 px-3 py-2 rounded-lg text-sm font-mono border border-green-500/30 pointer-events-none"
                style={{
                  left: Math.min(effectivePosition.x + 10, window.innerWidth - 300),
                  top: Math.max(effectivePosition.y - 60, 10),
                  maxWidth: '300px',
                }}
              >
                <div className="font-semibold text-cyan-400">
                  {effectiveElement.tag}
                  {effectiveElement.id && `#${effectiveElement.id}`}
                  {effectiveElement.classes.length > 0 && `.${effectiveElement.classes.join('.')}`}
                </div>
                {effectiveElement.text && (
                  <div className="text-slate-300 text-xs mt-1 truncate">
                    {effectiveElement.text.slice(0, 50)}
                  </div>
                )}
                <div className="text-slate-400 text-xs mt-1">
                  Click to inspect • Ctrl+D to debug
                </div>
              </div>
            )}
          </div>
        )}

        {/* Debug Modal */}
        {showDebugModal && effectiveElement && (
          <div
            ref={modalRef}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-auto"
            onClick={(e) => e.target === e.currentTarget && setShowDebugModal(false)}
          >
            <div className="bg-slate-900 border border-green-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-400">AI Debug Assistant</h3>
                <Button
                  onClick={() => setShowDebugModal(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-800 p-4 rounded">
                  <div className="text-cyan-400 font-mono">
                    {effectiveElement.tag}
                    {effectiveElement.id && `#${effectiveElement.id}`}
                    {effectiveElement.classes.length > 0 && `.${effectiveElement.classes.join('.')}`}
                  </div>
                  {effectiveElement.text && (
                    <div className="text-slate-300 mt-2">
                      "{effectiveElement.text}"
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => {
                    const prompt = generateAdvancedPrompt();
                    handleAnalyzeWithAI(prompt);
                  }}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-green-400 to-cyan-400 text-white font-semibold"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Terminal */}
        {showTerminal && (
          <div className="fixed bottom-0 left-0 right-0 h-96 bg-slate-900/95 border-t border-green-500/30 z-40 pointer-events-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
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
            
            <div className="p-4 h-full overflow-auto">
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div key={index} className="text-sm font-mono">
                    <span className="text-slate-400">[{event.timestamp}]</span>
                    <span className="text-cyan-400 ml-2">{event.type}</span>
                    {event.element && (
                      <span className="text-green-400 ml-2">
                        {event.element.tag}
                        {event.element.id && `#${event.element.id}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogTrace;
