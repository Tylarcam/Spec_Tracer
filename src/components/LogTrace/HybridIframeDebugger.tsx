import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ElementInfo } from '@/shared/types';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import ElementInspector from './ElementInspector';
import DebugModal from './DebugModal';
import TabbedTerminal from './TabbedTerminal';
import UpgradeModal from './UpgradeModal';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';
import { callAIDebugFunction } from '@/shared/api';
import { sanitizeText } from '@/utils/sanitization';

interface HybridIframeDebuggerProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isActive: boolean;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
}

const HybridIframeDebugger: React.FC<HybridIframeDebuggerProps> = ({
  iframeRef,
  isActive,
  showTerminal,
  setShowTerminal,
}) => {
  // State management
  const [currentElement, setCurrentElement] = useState<ElementInfo | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showElementInspector, setShowElementInspector] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [debugMethod, setDebugMethod] = useState<'same-origin' | 'cross-origin' | 'unknown'>('unknown');
  const [iframeContentReady, setIframeContentReady] = useState(false);

  // Refs
  const overlayRef = useRef<HTMLDivElement>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { toast } = useToast();
  const {
    remainingUses,
    canUseAiDebug,
    incrementAiDebugUsage,
  } = useUsageTracking();

  const {
    debugResponses,
    addDebugResponse,
  } = useDebugResponses();

  // Add event helper
  const addEvent = useCallback((event: any) => {
    setEvents(prev => [event, ...prev]);
  }, []);

  // Detect iframe origin and setup appropriate debugging method
  const detectIframeOrigin = useCallback(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    try {
      // Try to access iframe content
      const iframeDoc = iframe.contentDocument;
      if (iframeDoc) {
        setDebugMethod('same-origin');
        setupSameOriginDebugging();
      } else {
        throw new Error('No access to iframe document');
      }
    } catch (error) {
      setDebugMethod('cross-origin');
      setupCrossOriginDebugging();
    }
  }, [iframeRef]);

  // Setup same-origin debugging with postMessage and direct access
  const setupSameOriginDebugging = useCallback(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    // Inject debugging script into iframe
    const script = iframeDoc.createElement('script');
    script.textContent = `
      (function() {
        let isDebugActive = false;
        let currentHighlight = null;

        function createHighlight() {
          const highlight = document.createElement('div');
          highlight.id = 'logtrace-highlight';
          highlight.style.cssText = \`
            position: absolute;
            border: 2px solid #06b6d4;
            background: rgba(6, 182, 212, 0.1);
            pointer-events: none;
            z-index: 999999;
            transition: all 0.1s ease;
            border-radius: 4px;
          \`;
          document.body.appendChild(highlight);
          return highlight;
        }

        function updateHighlight(element) {
          if (!currentHighlight) {
            currentHighlight = createHighlight();
          }
          const rect = element.getBoundingClientRect();
          currentHighlight.style.left = rect.left + 'px';
          currentHighlight.style.top = rect.top + 'px';
          currentHighlight.style.width = rect.width + 'px';
          currentHighlight.style.height = rect.height + 'px';
        }

        function removeHighlight() {
          if (currentHighlight) {
            currentHighlight.remove();
            currentHighlight = null;
          }
        }

        function getElementInfo(element) {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          
          return {
            tag: element.tagName.toLowerCase(),
            id: element.id || '',
            classes: Array.from(element.classList),
            text: element.textContent?.slice(0, 100) || '',
            attributes: Array.from(element.attributes).map(attr => ({
              name: attr.name,
              value: attr.value
            })),
            size: { width: Math.round(rect.width), height: Math.round(rect.height) },
            position: { x: Math.round(rect.left), y: Math.round(rect.top) },
            css: {
              display: style.display,
              position: style.position,
              visibility: style.visibility,
              opacity: style.opacity,
              pointerEvents: style.pointerEvents,
              zIndex: style.zIndex
            }
          };
        }

        function handleMouseMove(e) {
          if (!isDebugActive) return;
          
          const element = e.target;
          if (element === document.body || element === document.documentElement) return;
          
          updateHighlight(element);
          
          window.parent.postMessage({
            type: 'logtrace:elementHover',
            elementInfo: getElementInfo(element),
            mousePosition: { x: e.clientX, y: e.clientY }
          }, '*');
        }

        function handleClick(e) {
          if (!isDebugActive) return;
          
          e.preventDefault();
          e.stopPropagation();
          
          const element = e.target;
          window.parent.postMessage({
            type: 'logtrace:elementClick',
            elementInfo: getElementInfo(element),
            mousePosition: { x: e.clientX, y: e.clientY }
          }, '*');
        }

        function handleKeyDown(e) {
          if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            e.stopPropagation();
            
            const elementUnderMouse = document.elementFromPoint(
              mousePosition.x || window.innerWidth / 2,
              mousePosition.y || window.innerHeight / 2
            );
            
            if (elementUnderMouse) {
              window.parent.postMessage({
                type: 'logtrace:debugElement',
                elementInfo: getElementInfo(elementUnderMouse),
                mousePosition: mousePosition
              }, '*');
            }
          }
        }

        let mousePosition = { x: 0, y: 0 };
        document.addEventListener('mousemove', (e) => {
          mousePosition = { x: e.clientX, y: e.clientY };
        });

        // Listen for messages from parent
        window.addEventListener('message', (e) => {
          if (e.data.type === 'logtrace:activate') {
            isDebugActive = true;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('click', handleClick, true);
            document.addEventListener('keydown', handleKeyDown, true);
            document.body.style.cursor = 'crosshair';
          } else if (e.data.type === 'logtrace:deactivate') {
            isDebugActive = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('keydown', handleKeyDown, true);
            document.body.style.cursor = '';
            removeHighlight();
          }
        });

        // Signal that iframe is ready
        window.parent.postMessage({ type: 'logtrace:ready' }, '*');
      })();
    `;
    
    iframeDoc.head.appendChild(script);
    setIframeContentReady(true);
  }, [iframeRef]);

  // Setup cross-origin debugging with enhanced overlay
  const setupCrossOriginDebugging = useCallback(() => {
    // For cross-origin, we use a transparent interaction layer
    console.log('Setting up cross-origin debugging with overlay approach');
    setIframeContentReady(true);
  }, []);

  // Extract element info for cross-origin iframes using coordinate detection
  const extractCrossOriginElementInfo = useCallback((globalX: number, globalY: number): ElementInfo | null => {
    if (!iframeRef.current) return null;

    const iframe = iframeRef.current;
    const iframeRect = iframe.getBoundingClientRect();
    
    const relativeX = globalX - iframeRect.left;
    const relativeY = globalY - iframeRect.top;

    if (relativeX < 0 || relativeY < 0 || relativeX > iframeRect.width || relativeY > iframeRect.height) {
      return null;
    }

    // Create smart fallback element info
    return {
      tag: 'iframe-element',
      id: '',
      classes: [],
      text: `Interactive element at (${Math.round(relativeX)}, ${Math.round(relativeY)})`,
      element: null,
      parentPath: '',
      attributes: [],
      size: { width: 0, height: 0 },
    };
  }, [iframeRef]);

  // Handle messages from same-origin iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'logtrace:ready') {
        setIframeContentReady(true);
      } else if (e.data.type === 'logtrace:elementHover') {
        setCurrentElement(e.data.elementInfo);
        setMousePosition(e.data.mousePosition);
      } else if (e.data.type === 'logtrace:elementClick') {
        setCurrentElement(e.data.elementInfo);
        setMousePosition(e.data.mousePosition);
        setShowElementInspector(true);
        addEvent({
          type: 'inspect',
          position: e.data.mousePosition,
          element: e.data.elementInfo,
        });
      } else if (e.data.type === 'logtrace:debugElement') {
        if (!canUseAiDebug) {
          setShowUpgradeModal(true);
          return;
        }
        setCurrentElement(e.data.elementInfo);
        setMousePosition(e.data.mousePosition);
        setShowDebugModal(true);
        addEvent({
          type: 'debug',
          position: e.data.mousePosition,
          element: e.data.elementInfo,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [canUseAiDebug, addEvent]);

  // Handle cross-origin overlay mouse events
  const handleOverlayMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isActive || debugMethod !== 'cross-origin') return;

    const globalX = e.clientX;
    const globalY = e.clientY;
    
    setMousePosition({ x: globalX, y: globalY });

    if (showDebugModal) return; // Apply memory guard

    const elementInfo = extractCrossOriginElementInfo(globalX, globalY);
    if (elementInfo) {
      setCurrentElement(elementInfo);
    }

    // Update cursor position
    if (cursorRef.current) {
      cursorRef.current.style.left = `${globalX - 10}px`;
      cursorRef.current.style.top = `${globalY - 10}px`;
    }
  }, [isActive, debugMethod, showDebugModal, extractCrossOriginElementInfo]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (!isActive || debugMethod !== 'cross-origin') return;

    e.preventDefault();
    e.stopPropagation();

    const elementInfo = extractCrossOriginElementInfo(e.clientX, e.clientY);
    if (elementInfo) {
      setCurrentElement(elementInfo);
      setShowElementInspector(true);
      addEvent({
        type: 'inspect',
        position: { x: e.clientX, y: e.clientY },
        element: elementInfo,
      });
    }
  }, [isActive, debugMethod, extractCrossOriginElementInfo, addEvent]);

  // Activate/deactivate debugging
  useEffect(() => {
    if (!iframeRef.current || !iframeContentReady) return;

    if (isActive) {
      detectIframeOrigin();
      
      if (debugMethod === 'same-origin') {
        // Send activation message to iframe
        iframeRef.current.contentWindow?.postMessage({ type: 'logtrace:activate' }, '*');
      } else if (debugMethod === 'cross-origin') {
        // Enable overlay mode
        if (iframeRef.current) {
          iframeRef.current.style.pointerEvents = 'none';
        }
      }
    } else {
      if (debugMethod === 'same-origin') {
        // Send deactivation message to iframe
        iframeRef.current.contentWindow?.postMessage({ type: 'logtrace:deactivate' }, '*');
      } else if (debugMethod === 'cross-origin') {
        // Disable overlay mode
        if (iframeRef.current) {
          iframeRef.current.style.pointerEvents = 'auto';
        }
      }
    }
  }, [isActive, iframeContentReady, debugMethod, detectIframeOrigin]);

  // Setup iframe content when it loads
  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const handleLoad = () => {
      setTimeout(() => {
        detectIframeOrigin();
      }, 100);
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [detectIframeOrigin]);

  // Handle debug from inspector
  const handleDebugFromInspector = useCallback(() => {
    if (!canUseAiDebug) {
      setShowUpgradeModal(true);
      return;
    }

    setShowElementInspector(false);
    setShowDebugModal(true);

    if (currentElement) {
      addEvent({
        type: 'debug',
        position: mousePosition,
        element: currentElement,
      });
    }
  }, [currentElement, mousePosition, addEvent, canUseAiDebug]);

  // AI analysis function
  const analyzeWithAI = useCallback(async (prompt: string) => {
    if (!currentElement) return;

    setIsAnalyzing(true);
    try {
      const response = await callAIDebugFunction(
        prompt,
        currentElement,
        mousePosition,
        incrementAiDebugUsage
      );

      addDebugResponse(prompt, response);
      
      addEvent({
        type: 'llm_response',
        position: mousePosition,
        prompt: sanitizeText(prompt),
        response: sanitizeText(response),
        element: currentElement,
      });

      setShowDebugModal(false);
      toast({
        title: 'Debug Complete',
        description: 'AI analysis complete! Check the terminal for results.',
      });
    } catch (error: any) {
      console.error('AI Debug Error:', error);
      toast({
        title: 'Debug Failed',
        description: error.message || 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentElement, mousePosition, incrementAiDebugUsage, addDebugResponse, addEvent, toast]);

  // Generate advanced prompt
  const generateAdvancedPrompt = useCallback((): string => {
    if (!currentElement) return '';

    const methodContext = debugMethod === 'same-origin' 
      ? 'same-origin iframe with full access' 
      : 'cross-origin iframe with limited access';

    return `Debug this element in ${methodContext}:

Element: <${currentElement.tag}${currentElement.id ? ` id="${sanitizeText(currentElement.id)}"` : ''}${currentElement.classes.length ? ` class="${currentElement.classes.map(c => sanitizeText(c)).join(' ')}"` : ''}>
Text: "${sanitizeText(currentElement.text)}"
Position: x:${mousePosition.x}, y:${mousePosition.y}
Debug Method: ${debugMethod}

Consider:
1. Why might this element not be behaving as expected?
2. Are there any CSS properties preventing interaction?
3. Are there any event listeners that might be interfering?
4. What accessibility concerns might exist?
5. How could the user experience be improved?
6. Any iframe-specific considerations (same-origin vs cross-origin)?

Provide specific, actionable debugging steps and potential solutions.`;
  }, [currentElement, mousePosition, debugMethod]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      const activeElement = document.activeElement as HTMLElement | null;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable)
      ) {
        return;
      }

      if (e.ctrlKey && e.key === 'd' && debugMethod === 'cross-origin') {
        e.preventDefault();
        if (currentElement && canUseAiDebug) {
          setShowElementInspector(false);
          setShowDebugModal(true);
        } else if (!canUseAiDebug) {
          setShowUpgradeModal(true);
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setShowElementInspector(false);
        setShowDebugModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentElement, canUseAiDebug, debugMethod]);

  // Calculate iframe bounds for overlay
  const getIframeBounds = useCallback(() => {
    if (!iframeRef.current) return { left: 0, top: 0, width: 0, height: 0 };
    
    const rect = iframeRef.current.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }, [iframeRef]);

  const terminalHeight = showTerminal ? Math.max(window.innerHeight * 0.3, 200) : 0;
  const iframeBounds = getIframeBounds();

  return (
    <>
      {/* Cross-origin overlay - only visible when needed */}
      {isActive && debugMethod === 'cross-origin' && (
        <div
          ref={overlayRef}
          className="fixed pointer-events-auto"
          style={{
            left: iframeBounds.left,
            top: iframeBounds.top,
            width: iframeBounds.width,
            height: iframeBounds.height,
            zIndex: 2147483640, // Lower z-index to avoid ad blocker detection
            background: 'transparent',
            cursor: 'crosshair',
          }}
          onMouseMove={handleOverlayMouseMove}
          onClick={handleOverlayClick}
        />
      )}

      {/* Custom cursor for cross-origin mode */}
      {isActive && debugMethod === 'cross-origin' && (
        <div
          ref={cursorRef}
          className="fixed pointer-events-none"
          style={{
            width: '20px',
            height: '20px',
            border: '2px solid #06b6d4',
            borderRadius: '50%',
            background: 'rgba(6, 182, 212, 0.2)',
            zIndex: 2147483641,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.1s ease',
          }}
        />
      )}

      {/* Debug method indicator */}
      {isActive && (
        <div className="fixed bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-cyan-500/30 rounded-lg p-2 text-xs text-slate-300 z-[2147483642]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${debugMethod === 'same-origin' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>{debugMethod === 'same-origin' ? 'Direct Access' : 'Overlay Mode'}</span>
          </div>
        </div>
      )}

      {/* Element Inspector */}
      <div data-element-inspector>
        <ElementInspector
          isVisible={showElementInspector}
          currentElement={currentElement}
          mousePosition={mousePosition}
          onDebug={handleDebugFromInspector}
          onClose={() => setShowElementInspector(false)}
          panelRef={inspectorRef}
          onShowMoreDetails={() => {
            console.log('Show more details for:', currentElement);
          }}
          currentDebugCount={5 - remainingUses}
          maxDebugCount={5}
        />
      </div>

      {/* Debug Modal */}
      {showDebugModal && (
        <DebugModal
          showDebugModal={showDebugModal}
          setShowDebugModal={setShowDebugModal}
          currentElement={currentElement}
          mousePosition={mousePosition}
          isAnalyzing={isAnalyzing}
          analyzeWithAI={analyzeWithAI}
          generateAdvancedPrompt={generateAdvancedPrompt}
          modalRef={modalRef}
          terminalHeight={terminalHeight}
        />
      )}

      {/* Terminal */}
      <TabbedTerminal
        isVisible={showTerminal}
        height={terminalHeight}
        events={events}
        debugResponses={debugResponses}
        onClose={() => setShowTerminal(false)}
        onClearEvents={() => setEvents([])}
        onExportEvents={() => {
          const dataStr = JSON.stringify(events, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = 'logtrace-events.json';
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
        }}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};

export default HybridIframeDebugger; 