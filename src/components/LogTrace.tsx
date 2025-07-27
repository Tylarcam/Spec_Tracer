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
import QuickActionModal from './LogTrace/QuickActionModal';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';
import { formatElementDataForCopy } from '@/utils/elementDataFormatter';

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
  
  const orchestrator = useLogTraceOrchestrator();
  const { debugResponses, clearDebugResponses } = useDebugResponses();
  const { inspectors, addInspector, removeInspector, bringToFront, clearAllInspectors } = useMultipleInspectors();

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
    } else if (showAIDebugModal) {
      setShowAIDebugModal(false);
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
    
    // Show quick actions
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
  const handleQuickAction = (action: any) => {
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
          // Generate context (placeholder)
          console.log('Generate context for:', detectedElement);
          break;
        case 'screenshot':
          // Take screenshot (placeholder)
          console.log('Take screenshot of:', detectedElement);
          break;
      }
    } else if (typeof action === 'object') {
      // Handle complex actions like screenshot with mode
      if (action.type === 'screenshot') {
        console.log('Take screenshot with mode:', action.mode);
      } else if (action.type === 'context') {
        console.log('Generate context with mode:', action.mode, 'input:', action.input);
      }
    }
    
    // Close quick actions
    setShowQuickActions(false);
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
    isHoverPaused: false,
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

      {/* Quick Action Modal */}
      <QuickActionModal
        visible={showQuickActions}
        x={quickActionPosition.x}
        y={quickActionPosition.y}
        onClose={() => setShowQuickActions(false)}
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
                     <span style={{ 
             fontSize: isMobile ? 24 : 32, 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center',
             fontWeight: 'bold'
           }}>
             {'>_'}
           </span>
        </Button>
      )}
    </div>
  );
};

export default LogTrace;
