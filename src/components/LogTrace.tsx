import React, { useEffect, useRef, useState } from 'react';
import { useLogTraceOrchestrator } from '@/shared/hooks/useLogTraceOrchestrator';
import { useInteractionHandlers } from '@/shared/hooks/useInteractionHandlers';
import { useMultipleInspectors } from '@/shared/hooks/useMultipleInspectors';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Terminal } from 'lucide-react';
import NavBar from './NavBar';
import InstructionsCard from './LogTrace/InstructionsCard';
import MouseOverlay from './LogTrace/MouseOverlay';
import ElementInspector from './LogTrace/ElementInspector';
import DebugModal from './LogTrace/DebugModal';
import TabbedTerminal from './LogTrace/TabbedTerminal';
import InteractivePanel from './LogTrace/InteractivePanel';
import QuickActionPill from './LogTrace/QuickActionPill';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';
import { formatElementDataForCopy } from '@/utils/elementDataFormatter';
import { useScreenshot } from '@/shared/hooks/useScreenshot';
import { useToast } from '@/hooks/use-toast';
import { screenshotService } from '@/shared/services/screenshotService';
import RectScreenshotOverlay from './LogTrace/RectScreenshotOverlay';
import FreeformScreenshotOverlay from './LogTrace/FreeformScreenshotOverlay';
import { supabase } from '@/integrations/supabase/client';

interface LogTraceProps {
  captureActive: boolean;
  onCaptureToggle: (active: boolean) => void;
  onEventCountChange?: (count: number) => void;
}

const LogTrace: React.FC<LogTraceProps> = ({ 
  captureActive, 
  onCaptureToggle,
  onEventCountChange 
}) => {
  const isMobile = useIsMobile();
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickActionPosition, setQuickActionPosition] = useState({ x: 0, y: 0 });
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(384);
  const [activeScreenshotOverlay, setActiveScreenshotOverlay] = useState<'rectangle' | 'freeform' | null>(null);
  
  // State to pause cursor movement when quick actions are visible
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  
  const orchestrator = useLogTraceOrchestrator();
  const { debugResponses, clearDebugResponses, addDebugResponse } = useDebugResponses();
  const { inspectors, addInspector, removeInspector, bringToFront, clearAllInspectors } = useMultipleInspectors();
  const { toast } = useToast();
  
  // Screenshot functionality
  const {  
    captureWindow, 
    captureFullscreen, 
    isCapturing 
  } = useScreenshot({ autoCopy: true });

  const {
    isTraceActive,
    setIsTraceActive,
    cursorPosition,
    setCursorPosition,
    detectedElement,
    setDetectedElement,
    showAIDebugModal,
    setShowAIDebugModal,
    capturedEvents,
    isAIAnalyzing,
    recordEvent,
    extractElementDetails,
    analyzeElementWithAI,
    clearCapturedEvents,
    exportCapturedEvents,
    generateElementPrompt,
    overlayRef,
    modalRef,
  } = orchestrator;

  // Create refs for panels
  const interactivePanelRef = useRef<HTMLDivElement>(null);

  // Sync event count with parent component
  useEffect(() => {
    if (onEventCountChange) {
      onEventCountChange(capturedEvents?.length || 0);
    }
  }, [capturedEvents, onEventCountChange]);

  // Handle escape key functionality
  const handleEscapeKey = () => {
    if (showQuickActions) {
      setShowQuickActions(false);
      setIsHoverPaused(false);
    } else if (showAIDebugModal) {
      setShowAIDebugModal(false);
    } else if (showTerminal) {
      setShowTerminal(false);
    } else if (inspectors.length > 0) {
      // Close most recent inspector
      const mostRecent = inspectors.reduce((latest, current) => 
        current.createdAt > latest.createdAt ? current : latest
      );
      removeInspector(mostRecent.id);
    } else if (detectedElement) {
      setDetectedElement(null);
    }
  };

  // Handle element click for inspection
  const handleElementClick = () => {
    if (detectedElement) {
      addInspector(detectedElement, cursorPosition);
    }
  };

  // Handle right-click to show quick actions
  const handleRightClick = (e: React.MouseEvent) => {
    if (!isTraceActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Update position and element
    setCursorPosition({ x: e.clientX, y: e.clientY });
    setQuickActionPosition({ x: e.clientX, y: e.clientY });
    
    const target = e.target as HTMLElement;
    const elementInfo = extractElementDetails(target);
    setDetectedElement(elementInfo);
    
    // Pause cursor movement and show quick actions
    setIsHoverPaused(true);
    setShowQuickActions(true);
    
    // Record the right-click event with correct type structure
    recordEvent({
      type: 'click',
      position: { x: e.clientX, y: e.clientY },
      element: {
        tag: elementInfo.tag,
        id: elementInfo.id,
        classes: elementInfo.classes,
        text: elementInfo.text,
        parentPath: elementInfo.parentPath,
        attributes: elementInfo.attributes,
        size: elementInfo.size,
      },
    });
  };

  // Handle quick action selection
  const handleQuickAction = (action: 'screenshot' | 'context' | 'debug' | 'details' | 'copy' | { type: string; mode?: string; input?: string }) => {
    if (!detectedElement) return;
    
    if (typeof action === 'string') {
      switch (action) {
        case 'copy':
          // Copy element details to clipboard using formatted data
          const elementData = formatElementDataForCopy(detectedElement, cursorPosition);
          navigator.clipboard.writeText(elementData).then(() => {
            console.log('Element details copied to clipboard');
          }).catch(err => {
            console.error('Failed to copy to clipboard:', err);
          });
          break;
        case 'details':
          // Open element inspector
          addInspector(detectedElement, cursorPosition);
          break;
        case 'debug':
          // Open AI debug modal
          setShowAIDebugModal(true);
          break;
        case 'context':
          // Generate context with default prompt
          handleContextGeneration('general', 'Analyze this element and provide context');
          break;
        case 'screenshot':
          // Open screenshot options
          setShowQuickActions(true);
          break;
      }
    } else if (typeof action === 'object') {
      // Handle complex actions with mode and input
      if (action.type === 'screenshot') {
        handleScreenshotAction(action.mode);
      } else if (action.type === 'context') {
        // Handle context generation with specific mode and input
        handleContextGeneration(action.mode || 'general', action.input || '');
      } else if (action.type === 'debug') {
        console.log('Debug with mode:', action.mode, 'input:', action.input);
        // Open AI debug modal with custom input
        if (action.input) {
          // You can pass the custom input to the debug modal here
          console.log('Custom debug input:', action.input);
        }
        setShowAIDebugModal(true);
      }
    }
    
    // Close quick actions
    setShowQuickActions(false);
    setIsHoverPaused(false);
  };

  // New function to handle context generation
  const handleContextGeneration = async (mode: string, userInput: string) => {
    console.log('handleContextGeneration called with:', { mode, userInput, detectedElement });
    
    if (!detectedElement) {
      console.log('No detected element, showing error toast');
      toast({
        title: 'No Element Selected',
        description: 'Hover over an element first to generate context',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Generate appropriate prompt based on mode
      const prompt = generateContextPrompt(mode, userInput, detectedElement);
      console.log('Generated prompt:', prompt);
      
      // Show loading toast
      toast({
        title: 'Generating Context',
        description: 'Analyzing element and generating context...',
      });

      console.log('Calling analyzeElementWithAI...');
      // Call AI function
      const response = await analyzeElementWithAI(prompt);
      console.log('AI response received:', response);
      
      // Add response to debugResponses array for terminal display
      addDebugResponse(prompt, response);
      
      // Show success toast and open terminal
      toast({
        title: 'Context Generated',
        description: 'Context analysis completed. Check the terminal for results.',
        variant: 'success',
      });
      
      // Open terminal to show results
      setShowTerminal(true);
      
    } catch (error) {
      console.error('Context generation failed:', error);
      toast({
        title: 'Context Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate context',
        variant: 'destructive',
      });
    }
  };

  // Updated function to generate context prompts based on mode with structured templates
  const generateContextPrompt = (mode: string, userInput: string, element: any): string => {
    const baseElementInfo = `
Element: <${element.tag}${element.id ? ` id="${element.id}"` : ''}${element.classes.length ? ` class="${element.classes.join(' ')}"` : ''}>
Text: "${element.text}"
Position: x:${cursorPosition.x}, y:${cursorPosition.y}
Size: ${element.size ? `${element.size.width}x${element.size.height}` : 'Unknown'}
Parent Path: ${element.parentPath || 'N/A'}
`;

    // Get computed styles for the element
    const computedStyles = getComputedStyles(element.element);
    
    // Build context-specific information
    let contextInfo = '';
    let systemInstructions = '';
    let analysisInstructions = '';
    
    switch (mode) {
      case 'layout':
        systemInstructions = `You are a front-end layout analyst. Review the provided HTML/CSS/DOM snapshot and output a structured critique on layout balance, alignment, and hierarchy. Highlight problem zones and offer optimization strategies. Focus on:
- Visual hierarchy and spacing
- Alignment and positioning issues
- Responsive design considerations
- CSS layout method effectiveness
- Cross-browser compatibility concerns`;

        contextInfo = `
CSS Properties:
${computedStyles}
DOM Structure: ${extractDOMStructure(element.element)}
`;

        analysisInstructions = `
Please analyze the layout and positioning of this element:

1. How is this element positioned in the layout? (flexbox, grid, absolute, etc.)
2. What CSS properties are affecting its layout behavior?
3. Are there any layout issues or improvements needed?
4. How does it interact with surrounding elements?
5. What responsive considerations should be made?
6. Are there any alignment or spacing problems?

${userInput ? `Additional context: ${userInput}` : ''}

Expected Output Format:
- Identify specific layout issues or areas of concern
- Provide actionable recommendations for layout improvements
- Rate severity (Low/Medium/High)
- Include code examples where applicable`;
        break;
        
      case 'accessibility':
        systemInstructions = `You are an accessibility auditor. Examine the provided DOM and metadata for compliance with WCAG 2.1. Focus on:
- Color contrast ratios
- Keyboard navigation support
- ARIA roles and attributes
- Alt text for images
- Screen reader compatibility
- Focus management
- Semantic HTML structure`;

        contextInfo = `
CSS Properties:
${computedStyles}
ARIA Attributes: ${extractARIAInfo(element.element)}
Interactive Properties: ${extractInteractiveInfo(element.element)}
`;

        analysisInstructions = `
Please analyze the accessibility of this element:

1. What accessibility features does this element have?
2. Are there any accessibility issues or missing attributes?
3. How well does it work with screen readers?
4. What ARIA attributes would improve accessibility?
5. Are there any keyboard navigation concerns?
6. Does it meet WCAG 2.1 guidelines?

${userInput ? `Additional context: ${userInput}` : ''}

Expected Output Format:
- List specific WCAG violations with line references
- Rate severity (Critical/Moderate/Minor)
- Provide fix instructions with attribute examples
- Include accessibility best practices`;
        break;
        
      case 'performance':
        systemInstructions = `You are a web performance analyst. Based on the provided performance trace and DOM structure, detect UI bottlenecks, expensive renders, and inefficient CSS/JS patterns. Focus on:
- Layout thrashing and reflows
- Memory leaks and garbage collection
- CSS selector complexity
- Event listener optimization
- Render performance bottlenecks
- Resource loading optimization`;

        contextInfo = `
CSS Properties:
${computedStyles}
Performance Indicators: ${extractPerformanceInfo(element.element)}
`;

        analysisInstructions = `
Please analyze the performance implications of this element:

1. What performance impact does this element have?
2. Are there any rendering or layout performance issues?
3. How could this element be optimized?
4. Are there any unnecessary re-renders or calculations?
5. What performance best practices could be applied?
6. Are there any memory leaks or inefficient patterns?

${userInput ? `Additional context: ${userInput}` : ''}

Expected Output Format:
- Identify memory leaks, layout thrashing, event bloat
- Provide source file or component references
- Suggest optimizations using async, lazy load, etc.
- Rate performance impact (Low/Medium/High)`;
        break;
        
      case 'general':
      default:
        systemInstructions = `You are a web development expert. Analyze the provided element and context to provide comprehensive insights and actionable recommendations.`;

        contextInfo = `
CSS Properties:
${computedStyles}
`;

        analysisInstructions = `
Please provide a comprehensive analysis of this element:

1. What is the purpose and function of this element?
2. How is it currently implemented?
3. What are its key characteristics and behaviors?
4. Are there any issues or areas for improvement?
5. What best practices could be applied?

${userInput ? `Additional context: ${userInput}` : ''}

Provide a detailed analysis with specific insights and recommendations.`;
        break;
    }

    return `${systemInstructions}

${baseElementInfo}
${contextInfo}

${analysisInstructions}`;
  };

  // Helper functions for extracting element information
  const getComputedStyles = (element: HTMLElement): string => {
    const styles = window.getComputedStyle(element);
    const relevantProperties = [
      'display', 'position', 'top', 'left', 'right', 'bottom',
      'width', 'height', 'margin', 'padding', 'border',
      'flex-direction', 'justify-content', 'align-items',
      'grid-template-columns', 'grid-template-rows',
      'z-index', 'opacity', 'visibility', 'overflow',
      'background', 'color', 'font-size', 'font-weight'
    ];

    return relevantProperties
      .map(prop => `${prop}: ${styles.getPropertyValue(prop)}`)
      .join('\n');
  };

  const extractDOMStructure = (element: HTMLElement): string => {
    const parent = element.parentElement;
    const siblings = parent ? Array.from(parent.children) : [];
    const siblingIndex = siblings.indexOf(element);
    
    return `Parent: ${parent?.tagName?.toLowerCase() || 'root'}
Siblings: ${siblings.length} (index: ${siblingIndex})
Children: ${element.children.length}`;
  };

  const extractARIAInfo = (element: HTMLElement): string => {
    const ariaAttributes = [
      'role', 'aria-label', 'aria-labelledby', 'aria-describedby',
      'aria-hidden', 'aria-expanded', 'aria-pressed', 'aria-checked',
      'aria-required', 'aria-invalid', 'aria-disabled'
    ];

    const ariaInfo = ariaAttributes
      .map(attr => {
        const value = element.getAttribute(attr);
        return value ? `${attr}="${value}"` : null;
      })
      .filter(Boolean)
      .join(', ');

    return ariaInfo || 'No ARIA attributes found';
  };

  const extractInteractiveInfo = (element: HTMLElement): string => {
    const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase());
    const hasClickHandler = element.onclick !== null;
    const tabIndex = element.getAttribute('tabindex');
    const isFocusable = element.focus !== undefined;
    
    return `Interactive: ${isInteractive || hasClickHandler}
Focusable: ${isFocusable}
Tab Index: ${tabIndex || 'default'}`;
  };

  const extractPerformanceInfo = (element: HTMLElement): string => {
    const styles = window.getComputedStyle(element);
    const hasTransform = styles.transform !== 'none';
    const hasTransition = styles.transition !== 'all 0s ease 0s';
    const hasAnimation = styles.animation !== 'none';
    
    return `Transforms: ${hasTransform ? 'Yes' : 'No'}
Transitions: ${hasTransition ? 'Yes' : 'No'}
Animations: ${hasAnimation ? 'Yes' : 'No'}
Will-change: ${styles.willChange}`;
  };

  // Handle screenshot actions
  const handleScreenshotAction = (mode?: string) => {
    if (!mode) return;

    switch (mode) {
      case 'rectangle':
        setActiveScreenshotOverlay('rectangle');
        break;
      case 'window':
        captureWindow();
        break;
      case 'fullscreen':
        captureFullscreen();
        break;
      case 'freeform':
        setActiveScreenshotOverlay('freeform');
        break;
      default:
        console.warn('Unknown screenshot mode:', mode);
    }
  };

  // Handle screenshot overlay completion
  const handleScreenshotOverlayComplete = async (dataUrl: string) => {
    setActiveScreenshotOverlay(null);
    
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create a screenshot result object for consistency
      const result = {
        dataUrl,
        blob,
        filename: `screenshot-${Date.now()}.png`,
        success: true
      };
      
      // Use screenshotService for consistent clipboard handling
      const copied = await screenshotService.copyToClipboard(result);
      
      if (copied) {
        // Show success toast
        toast({
          title: 'Screenshot Copied',
          description: 'Screenshot copied to clipboard',
          variant: 'success'
        });
      } else {
        throw new Error('Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy screenshot to clipboard:', error);
      
      // Show error toast
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy screenshot to clipboard',
        variant: 'destructive'
      });
    }
  };

  // Handle screenshot overlay cancellation
  const handleScreenshotOverlayCancel = () => {
    setActiveScreenshotOverlay(null);
  };

  // Set up interaction handlers
  const {
    handleCursorMovement,
    handleElementClick: handleElementClickEvent,
    handleContextMenu,
    handleTouchStart,
    handleTouchEnd,
  } = useInteractionHandlers({
    isTraceActive,
    isHoverPaused,
    detectedElement,
    cursorPosition,
    showInteractivePanel: false,
    setCursorPosition,
    setDetectedElement,
    setShowInteractivePanel: () => {},
    setShowAIDebugModal,
    extractElementDetails,
    recordEvent,
    handleEscapeKey,
    onElementClick: handleElementClick,
  });

  // Fix: Sync capture state with parent WITHOUT creating circular dependency
  useEffect(() => {
    if (captureActive !== isTraceActive) {
      setIsTraceActive(captureActive);
    }
  }, [captureActive, isTraceActive, setIsTraceActive]);

  // Set up DOM event listeners
  useEffect(() => {
    if (!isTraceActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleCursorMovement(e as any);
    };

    const handleClick = (e: MouseEvent) => {
      handleElementClickEvent(e as any);
    };

    const handleRightClickEvent = (e: MouseEvent) => {
      handleRightClick(e as any);
    };

    const handleTouchStartEvent = (e: TouchEvent) => {
      if (handleTouchStart) {
        handleTouchStart(e as any);
      }
    };

    const handleTouchEndEvent = (e: TouchEvent) => {
      if (handleTouchEnd) {
        handleTouchEnd(e as any);
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleRightClickEvent);
    
    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStartEvent);
      document.addEventListener('touchend', handleTouchEndEvent);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleRightClickEvent);
      
      if (isMobile) {
        document.removeEventListener('touchstart', handleTouchStartEvent);
        document.removeEventListener('touchend', handleTouchEndEvent);
      }
    };
  }, [isTraceActive, handleCursorMovement, handleElementClickEvent, handleRightClick, handleTouchStart, handleTouchEnd, isMobile]);

  // Clear all inspectors when trace is deactivated
  useEffect(() => {
    if (!isTraceActive) {
      clearAllInspectors();
      setShowQuickActions(false);
      setIsHoverPaused(false);
    }
  }, [isTraceActive, clearAllInspectors]);

  console.log('LogTrace rendering with capturedEvents:', capturedEvents?.length || 0);

  return (
    <div className="relative w-full h-full">
      {/* Universal Control Panel in NavBar */}
      <NavBar
        isTracing={isTraceActive}
        isHoverEnabled={true}
        onToggleTracing={() => onCaptureToggle(!isTraceActive)}
        onToggleHover={() => {}}
        onOpenSettings={() => setShowSettings(true)}
        onToggleTerminal={() => {}}
        eventCount={capturedEvents?.length || 0}
        showTerminal={false}
      />

      {/* Instructions Card - Always visible */}
      <div className="relative z-10 p-4 md:p-6 mt-16">
        <InstructionsCard />
      </div>

      {/* Mouse Overlay for element detection */}
      <MouseOverlay 
        isActive={isTraceActive}
        currentElement={detectedElement}
        mousePosition={cursorPosition}
        overlayRef={overlayRef}
        inspectorCount={inspectors.length}
      />

      {/* Quick Action Pill */}
      <QuickActionPill
        visible={showQuickActions}
        x={quickActionPosition.x}
        y={quickActionPosition.y}
        onClose={() => {
          setShowQuickActions(false);
          setIsHoverPaused(false);
        }}
        onAction={handleQuickAction}
      />

      {/* Multiple Element Inspectors */}
      {inspectors.map((inspector) => (
        <ElementInspector
          key={inspector.id}
          isVisible={true}
          currentElement={inspector.element}
          mousePosition={inspector.position}
          onDebug={() => {
            setDetectedElement(inspector.element);
            setShowAIDebugModal(true);
          }}
          onClose={() => removeInspector(inspector.id)}
          onShowMoreDetails={() => {}}
          onPin={() => bringToFront(inspector.id)}
        />
      ))}

      {/* AI Debug Modal */}
      <DebugModal 
        showDebugModal={showAIDebugModal}
        setShowDebugModal={setShowAIDebugModal}
        currentElement={detectedElement}
        mousePosition={cursorPosition}
        isAnalyzing={isAIAnalyzing}
        analyzeWithAI={analyzeElementWithAI}
        generateAdvancedPrompt={generateElementPrompt}
        modalRef={modalRef}
      />

      {/* Tabbed Terminal */}
      <TabbedTerminal
        showTerminal={showTerminal}
        setShowTerminal={setShowTerminal}
        events={capturedEvents || []}
        exportEvents={exportCapturedEvents}
        clearEvents={clearCapturedEvents}
        debugResponses={debugResponses}
        clearDebugResponses={clearDebugResponses}
        currentElement={detectedElement}
        terminalHeight={terminalHeight}
        onTerminalHeightChange={setTerminalHeight}
      />

      {/* Terminal Button - Lower Left Corner */}
      {!showTerminal && (
        <Button
          onClick={() => setShowTerminal(true)}
          className={`fixed ${isMobile ? 'bottom-6 left-6 w-16 h-16' : 'bottom-4 left-4 w-12 h-12'} z-30 bg-green-600 hover:bg-green-700 text-white rounded-full p-0 shadow-lg transition-all duration-200 hover:scale-105`}
          style={{
            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4), 0 0 0 1px rgba(34, 197, 94, 0.2)',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          }}
        >
          <Terminal className="h-6 w-6" />
        </Button>
      )}

      {/* Screenshot Overlays */}
      {activeScreenshotOverlay === 'rectangle' && (
        <RectScreenshotOverlay onComplete={handleScreenshotOverlayComplete} onCancel={handleScreenshotOverlayCancel} />
      )}
      {activeScreenshotOverlay === 'freeform' && (
        <FreeformScreenshotOverlay onComplete={handleScreenshotOverlayComplete} onCancel={handleScreenshotOverlayCancel} />
      )}
    </div>
  );
};

export default LogTrace;
