

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Pause, Settings, Terminal, ArrowUp, Lightbulb, MousePointer } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation, useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';

import ElementInspector from './LogTrace/ElementInspector';
import DebugModal from './LogTrace/DebugModal';
import QuickActionPill from './LogTrace/QuickActionPill';
import TabbedTerminal from './LogTrace/TabbedTerminal';
import SettingsDrawer from './LogTrace/SettingsDrawer';
import MobileQuickActionsMenu from './LogTrace/MobileQuickActionsMenu';
import InstructionsCard from './LogTrace/InstructionsCard';
import MouseOverlay from './LogTrace/MouseOverlay';
import UnifiedTraceControl from './LogTrace/UnifiedTraceControl';

import { useElementPosition } from '@/hooks/useElementPosition';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useToast } from '@/hooks/use-toast';
import { useTracingContext } from '@/App';
import { callAIDebugFunction } from '@/shared/api';
import { ElementInfo } from '@/shared/types';
import { formatElementDataForCopy } from '@/utils/elementDataFormatter';
import { Button } from '@/components/ui/button';

interface LogTraceProps {
}

const LogTrace: React.FC<LogTraceProps> = () => {
  const { tracingActive, setTracingActive } = useTracingContext();
  const [isHoverEnabled, setIsHoverEnabled] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [openInspectors, setOpenInspectors] = useState<Array<{ id: string; element: ElementInfo; position: { x: number; y: number } }>>([]);
  const [currentElement, setCurrentElement] = useState<ElementInfo | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [debugResponses, setDebugResponses] = useState<any[]>([]);
  const [isInspectorHovered, setIsInspectorHovered] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [pausedElement, setPausedElement] = useState<ElementInfo | null>(null);
  const [pausedPosition, setPausedPosition] = useState<{ x: number; y: number } | null>(null);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [debugModalElement, setDebugModalElement] = useState<ElementInfo | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickActionPosition, setQuickActionPosition] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const location = useLocation();
  const { elementInfo, setElement } = useElementPosition();
  const { canUseAiDebug, incrementAiDebugUsage } = useUsageTracking();
  const { toast } = useToast();
  const terminalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Helper function to build parent path
  const buildParentPath = useCallback((element: HTMLElement): string => {
    const path: string[] = [];
    let current = element.parentElement;
    
    while (current && current !== document.body) {
      const tag = current.tagName.toLowerCase();
      const id = current.id ? `#${current.id}` : '';
      const classes = Array.from(current.classList).map(c => `.${c}`).join('');
      path.unshift(`${tag}${id}${classes}`);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  }, []);

  // Helper function to check if element is a UI control
  const isUIControl = useCallback((target: HTMLElement): boolean => {
    return !!(
      // Close buttons (X buttons)
      target.closest('[data-close-button]') ||
      target.closest('.close-button') ||
      target.closest('[aria-label*="close" i]') ||
      target.closest('[title*="close" i]') ||
      target.textContent?.trim() === '×' ||
      target.textContent?.trim() === 'X' ||
      
      // Tracing toggle button specifically
      target.closest('[data-trace-toggle]') ||
      
      // Inspector panels themselves
      target.closest('[data-inspector-panel]') ||
      target.closest('.inspector-panel') ||
      
      // Debug modals
      target.closest('[data-debug-modal]') ||
      target.closest('.debug-modal') ||
      
      // Context menus
      target.closest('[data-context-menu]') ||
      target.closest('.context-menu') ||
      
      // Quick action pills
      target.closest('[data-quick-actions]') ||
      target.closest('.quick-action-pill')
    );
  }, []);

  // Helper function to extract element info from DOM element
  const extractElementInfo = useCallback((target: HTMLElement): ElementInfo => {
    const attributes = Array.from(target.attributes).map(attr => ({
      name: attr.name,
      value: attr.value
    }));

    const rect = target.getBoundingClientRect();
    const size = {
      width: rect.width,
      height: rect.height
    };

    const parentPath = buildParentPath(target);

    return {
      tag: target.tagName.toLowerCase(),
      id: target.id,
      classes: Array.from(target.classList),
      text: target.textContent?.trim() || '',
      element: target,
      attributes,
      size,
      parentPath,
    };
  }, [buildParentPath]);

  // Helper function to log to terminal
  const logToTerminal = useCallback((message: string) => {
    setTerminalOutput(prev => [...prev, `[LogTrace]: ${message} at ${new Date().toLocaleTimeString()}`]);
  }, []);

  const startTracing = useCallback(() => {
    setTracingActive(true);
    logToTerminal('Tracing started');
    
    // Test console logging functionality
    if (process.env.NODE_ENV === 'development') {
      console.log('[LogTrace] Tracing started - console log test');
      console.warn('[LogTrace] This is a test warning message');
      console.info('[LogTrace] This is a test info message');
    }
  }, [setTracingActive, logToTerminal]);

  const endTracing = useCallback(() => {
    setTracingActive(false);
    setIsHoverEnabled(true);
    setCurrentElement(null);
    setOpenInspectors([]);
    logToTerminal('Tracing ended');
  }, [setTracingActive, logToTerminal]);

  const toggleHover = useCallback(() => {
    setIsHoverEnabled(!isHoverEnabled);
    logToTerminal(`Hover tracking ${isHoverEnabled ? 'disabled' : 'enabled'}`);
  }, [isHoverEnabled, logToTerminal]);

  const toggleTerminal = useCallback(() => {
    setIsTerminalOpen(!isTerminalOpen);
  }, [isTerminalOpen]);

  const openMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleElementClick = useCallback((element: ElementInfo) => {
    if (!tracingActive) return;
    
    // Check if we already have 3 inspectors open
    if (openInspectors.length >= 3) {
      logToTerminal('Maximum 3 inspectors allowed. Close one first.');
      return;
    }
    
    // Create unique ID for this inspector
    const inspectorId = `inspector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add new inspector to the list
    setOpenInspectors(prev => [...prev, {
      id: inspectorId,
      element: element,
      position: { x: mousePosition.x, y: mousePosition.y }
    }]);
    
    setElement(element);
    logToTerminal(`Element "${element.tag}" inspector opened`);
    
    const clickEvent = {
      id: crypto.randomUUID(),
      type: 'click' as const,
      timestamp: new Date().toISOString(),
      position: { x: mousePosition.x, y: mousePosition.y },
      element: {
        tag: element.tag,
        id: element.id,
        classes: element.classes,
        text: element.text,
        parentPath: element.parentPath,
        attributes: element.attributes,
        size: element.size,
      }
    };
    setEvents(prev => [clickEvent, ...prev]);
  }, [tracingActive, openInspectors.length, mousePosition, setElement, logToTerminal]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleAIDebug = useCallback(async (element?: ElementInfo) => {
    if (!canUseAiDebug) {
      navigate('/upgrade');
      return;
    }

    // Set the element to debug (either passed in or current element)
    const elementToDebug = element || currentElement;
    if (!elementToDebug) {
      logToTerminal('No element selected for debugging');
      return;
    }

    // Open debug modal with the element
    setDebugModalElement(elementToDebug);
    setShowDebugModal(true);
    logToTerminal(`Debug modal opened for "${elementToDebug.tag}"`);
  }, [canUseAiDebug, navigate, currentElement, logToTerminal]);

  const analyzeWithAI = useCallback(async (prompt: string) => {
    if (!debugModalElement) return;

    setIsAnalyzing(true);
    try {
      const response = await callAIDebugFunction(prompt, debugModalElement, mousePosition);
      setDebugResponses(prev => [...prev, { prompt, response, timestamp: new Date().toISOString() }]);
      incrementAiDebugUsage();
      logToTerminal('AI analysis completed');
      
      return response;
    } catch (error: any) {
      logToTerminal(`AI analysis error - ${error.message}`);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [debugModalElement, mousePosition, incrementAiDebugUsage, logToTerminal]);

  const generateAdvancedPrompt = useCallback(() => {
    if (!debugModalElement) return '';
    
    const element = debugModalElement;
    const isInteractive = ['button','a','input','select','textarea'].includes(element.tag) || element.element?.onclick != null;
    const eventListeners = [];
    const el = element.element as any;
    [
      'onclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmouseout',
      'onmouseenter', 'onmouseleave', 'onkeydown', 'onkeyup', 'oninput',
      'onchange', 'onfocus', 'onblur', 'onsubmit'
    ].forEach(listener => {
      if (typeof el[listener] === 'function') eventListeners.push(listener);
    });
    const styles = window.getComputedStyle(element.element);
    
    return `Target Context For Debug:
- Tag: <${element.tag}>
- ID: ${element.id || 'none'}
- Classes: ${element.classes.join(', ') || 'none'}
- Text: "${element.text || 'none'}"
- Interactive: ${isInteractive ? 'Yes' : 'No'}
- Event Listeners: ${eventListeners.join(', ') || 'none'}
- Styles: display=${styles.display}, visibility=${styles.visibility}, pointer-events=${styles.pointerEvents}`;
  }, [debugModalElement]);

  const handleSettingsClick = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleUpgradeClick = useCallback(() => {
    navigate('/upgrade');
  }, [navigate]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Hover pause functionality for inspector
  const handleInspectorMouseEnter = useCallback(() => {
    setIsInspectorHovered(true);
    setIsHoverPaused(true);
    setPausedElement(currentElement);
    setPausedPosition(mousePosition);
  }, [currentElement, mousePosition]);

  const handleInspectorMouseLeave = useCallback(() => {
    setIsInspectorHovered(false);
    setIsHoverPaused(false);
    setPausedElement(null);
    setPausedPosition(null);
  }, []);

  // Function to close a specific inspector
  const closeInspector = useCallback((inspectorId: string) => {
    setOpenInspectors(prev => prev.filter(inspector => inspector.id !== inspectorId));
  }, []);

  const exportEvents = useCallback(() => {
    // Export events functionality
    console.log('Exporting events:', events);
  }, [events]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const clearDebugResponses = useCallback(() => {
    setDebugResponses([]);
  }, []);

  // New handler function for copying element data
  const handleElementCopy = useCallback(async (element: ElementInfo) => {
    try {
      const formattedData = formatElementDataForCopy(element, mousePosition);
      await navigator.clipboard.writeText(formattedData);
      
      // Show success toast
      toast({
        title: 'Element Data Copied',
        description: 'Element identifying data copied to clipboard',
      });
      
      // Log the action
      logToTerminal('Element data copied');
    } catch (error) {
      console.error('Failed to copy element data:', error);
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy element data to clipboard',
        variant: 'destructive',
      });
    }
  }, [mousePosition, toast, logToTerminal]);

  // Quick action handlers
  const handleQuickAction = useCallback((action: 'screenshot' | 'context' | 'debug' | 'details' | 'copy') => {
    if (!currentElement) return;

    setShowQuickActions(false);

    switch (action) {
      case 'details':
        handleElementClick(currentElement);
        break;
      case 'debug':
        handleAIDebug(currentElement);
        break;
      case 'context':
        // For context, we'll open the debug modal with a context prompt
        const prompt = `Generate context for this element: ${currentElement.tag}${currentElement.id ? `#${currentElement.id}` : ''}`;
        setDebugModalElement(currentElement);
        setShowDebugModal(true);
        // Pre-fill the debug modal with context prompt
        setTimeout(() => {
          analyzeWithAI(prompt);
        }, 100);
        break;
      case 'screenshot':
        logToTerminal('Screenshot mode activated');
        // TODO: Implement screenshot functionality
        break;
      case 'copy':
        handleElementCopy(currentElement);
        break;
    }
  }, [currentElement, handleElementClick, handleAIDebug, analyzeWithAI, handleElementCopy, logToTerminal]);

  // Unified event handlers
  const handleHover = useCallback((e: MouseEvent) => {
    if (!tracingActive || !isHoverEnabled || isDragging) return;

    // Update mouse position for the overlay
    setMousePosition({ x: e.clientX, y: e.clientY });

    const target = e.target as HTMLElement;
    if (target && !isUIControl(target)) {
      const elementInfo = extractElementInfo(target);
      setElement(elementInfo);
      setCurrentElement(elementInfo);
    }
  }, [tracingActive, isHoverEnabled, isDragging, isUIControl, extractElementInfo, setElement]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!tracingActive || isDragging) return;

    const target = e.target as HTMLElement;
    if (target && !isUIControl(target)) {
      const elementInfo = extractElementInfo(target);
      handleElementClick(elementInfo);
    }
  }, [tracingActive, isDragging, isUIControl, extractElementInfo, handleElementClick]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (!tracingActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    if (target && !isUIControl(target)) {
      const elementInfo = extractElementInfo(target);
      setCurrentElement(elementInfo);
      setQuickActionPosition({ x: e.clientX, y: e.clientY });
      setShowQuickActions(true);
    }
  }, [tracingActive, isUIControl, extractElementInfo]);

  // Keyboard shortcuts
  useHotkeys('ctrl+s', () => tracingActive ? endTracing() : startTracing(), { preventDefault: true });
  useHotkeys('ctrl+e', () => endTracing(), { preventDefault: true });
  useHotkeys('ctrl+t', () => toggleTerminal(), { preventDefault: true });
  useHotkeys('ctrl+d', () => handleAIDebug(), { preventDefault: true });
  useHotkeys('ctrl+p', () => toggleHover(), { preventDefault: true });
  useHotkeys('q', () => {
    if (tracingActive && currentElement) {
      setQuickActionPosition({ x: mousePosition.x, y: mousePosition.y });
      setShowQuickActions(true);
    }
  }, { preventDefault: true });

  // Event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close the most recent inspector
        setOpenInspectors(prev => prev.slice(0, -1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleHover);
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('mousemove', handleHover);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleHover, handleClick, handleContextMenu]);

  return (
    <div id="logtrace-container" className="h-screen flex flex-col bg-slate-900 text-white relative overflow-hidden">

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-auto" onMouseMove={handleMouseMove}>
        {/* Left Panel - Instructions and Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-green-400 mb-4">Welcome to LogTrace</h1>
              <p className="text-slate-300 text-lg">
                The AI-powered debugging tool that helps you capture perfect context for any UI element.
              </p>
            </div>

            {/* Instructions Card */}
            <InstructionsCard />
          </div>
        </div>
      </div>

      {/* Terminal - Full screen overlay when open */}
      {isTerminalOpen && (
        <div data-terminal className="fixed inset-0 z-50 bg-slate-900/95">
          <TabbedTerminal
            showTerminal={isTerminalOpen}
            setShowTerminal={setIsTerminalOpen}
            events={events}
            exportEvents={exportEvents}
            clearEvents={clearEvents}
            debugResponses={debugResponses}
            clearDebugResponses={clearDebugResponses}
            currentElement={currentElement}
            terminalHeight={window.innerHeight * 0.33}
          />
        </div>
      )}

      {/* Floating Terminal Button - appears when terminal is closed */}
      {!isTerminalOpen && (
        <Button
          data-terminal
          onClick={toggleTerminal}
          className="fixed bottom-4 right-4 z-30 bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 p-0 shadow-lg"
        >
          <span style={{ fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'>'}</span>
        </Button>
      )}

      {/* Multiple Element Inspectors */}
      {openInspectors.map((inspector, index) => (
        <ElementInspector
          key={inspector.id}
          isVisible={true}
          currentElement={inspector.element}
          mousePosition={inspector.position}
          onDebug={() => handleAIDebug(inspector.element)}
          onClose={() => closeInspector(inspector.id)}
          panelRef={overlayRef}
          isExtensionMode={false}
          isDraggable={true}
          isPinned={false}
          onPin={() => {}}
          onShowMoreDetails={() => {}}
          currentDebugCount={undefined}
          maxDebugCount={undefined}
          onMouseEnter={handleInspectorMouseEnter}
          onMouseLeave={handleInspectorMouseLeave}
        />
      ))}

      {/* Debug Modal */}
      <DebugModal
        showDebugModal={showDebugModal}
        setShowDebugModal={setShowDebugModal}
        currentElement={debugModalElement}
        mousePosition={mousePosition}
        isAnalyzing={isAnalyzing}
        analyzeWithAI={analyzeWithAI}
        generateAdvancedPrompt={generateAdvancedPrompt}
        modalRef={overlayRef}
        isExtensionMode={false}
        showAuthModal={false}
        setShowAuthModal={() => {}}
        user={undefined}
        guestDebugCount={undefined}
        maxGuestDebugs={undefined}
        terminalHeight={0}
      />

      {/* Context Menu */}
      <QuickActionPill
        visible={showQuickActions}
        x={quickActionPosition.x}
        y={quickActionPosition.y}
        onClose={() => setShowQuickActions(false)}
        onAction={handleQuickAction}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpgradeClick={handleUpgradeClick}
      />

      <MobileQuickActionsMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        onStartTrace={startTracing}
        onEndTrace={endTracing}
        onToggleHover={toggleHover}
        onUpgrade={handleUpgradeClick}
        onSettings={handleSettingsClick}
        isTracing={tracingActive}
        isHoverEnabled={isHoverEnabled}
      />

      {/* Mouse Overlay - shows element inspection UI when tracing is active */}
      <MouseOverlay
        isActive={tracingActive && isHoverEnabled && !isHoverPaused}
        currentElement={isHoverPaused && pausedElement ? pausedElement : currentElement}
        mousePosition={isHoverPaused && pausedPosition ? pausedPosition : mousePosition}
        overlayRef={overlayRef}
        inspectorCount={openInspectors.length}
      />
    </div>
  );
};

export default LogTrace;
