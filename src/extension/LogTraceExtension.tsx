import React, { useState, useEffect, useCallback, useRef } from 'react';
import ExtensionMouseOverlay from './components/ExtensionMouseOverlay';
import PinnedDetails from './components/PinnedDetails';
import ExtensionTerminalWrapper from './components/ExtensionTerminalWrapper';
import { usePinnedDetails } from '@/shared/hooks/usePinnedDetails';
import { ElementInfo, LogEvent, ExtendedActionType } from '@/shared/types';
import ExtensionAuthModal from './components/ExtensionAuthModal';
import { useExtensionAuth } from './hooks/useExtensionAuth';
import { callAIDebugFunction } from '@/shared/api';
import { Settings, Terminal } from 'lucide-react';
import SettingsDrawer from '@/components/LogTrace/SettingsDrawer';
import ElementInspector from '@/components/LogTrace/ElementInspector';

export const LogTraceExtension: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [currentElement, setCurrentElement] = useState<ElementInfo | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showElementInspector, setShowElementInspector] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [debugResponses, setDebugResponses] = useState<any[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [activeTerminalTab, setActiveTerminalTab] = useState<'debug' | 'console' | 'events'>('debug');
  const [localToast, setLocalToast] = useState<{ title: string; description?: string; variant?: 'success' | 'destructive' } | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const elementInspectorRef = useRef<HTMLDivElement>(null);
  const [isInspectorHovered, setIsInspectorHovered] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [pausedElement, setPausedElement] = useState<ElementInfo | null>(null);
  const [pausedPosition, setPausedPosition] = useState<{ x: number; y: number } | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickActionsPosition, setQuickActionsPosition] = useState({ x: 0, y: 0 });

  const {
    pinnedDetails,
    addPin,
    removePin,
    updatePinPosition,
    clearAllPins,
  } = usePinnedDetails();

  const {
    user,
    authLoading,
    guestDebugCount,
    email,
    password,
    isLoading,
    toast,
    setEmail,
    setPassword,
    handleSignUp,
    handleSignIn,
    handleSignInWithGitHub,
    incrementGuestDebug,
  } = useExtensionAuth();

  // Pin handler for overlay
  const handleOverlayPin = () => {
    if (currentElement) {
      addPin(currentElement, mousePosition);
    }
  };

  // Pause hover overlay
  const pauseHoverOverlay = useCallback(() => {
    setIsHoverPaused(true);
    if (currentElement) {
      setPausedElement(currentElement);
      setPausedPosition(mousePosition);
    }
  }, [currentElement, mousePosition]);

  // Resume hover overlay
  const resumeHoverOverlay = useCallback(() => {
    setIsHoverPaused(false);
    setPausedElement(null);
    setPausedPosition(null);
    setShowQuickActions(false);
  }, []);

  // Handle right-click context menu
  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Pause hover overlay
    pauseHoverOverlay();
    
    // Show quick actions at cursor position
    setQuickActionsPosition({ x: e.clientX, y: e.clientY });
    setShowQuickActions(true);
  }, [pauseHoverOverlay]);

  // Event and debug response handlers
  const handleExportEvents = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logtrace-events.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleClearEvents = () => setEvents([]);
  const handleClearDebugResponses = () => setDebugResponses([]);

  // Updated Quick Action handler with proper typing
  const handleQuickAction = useCallback(async (
    action: string,
    element: ElementInfo | null = null
  ) => {
    const timestamp = new Date().toISOString();

    // Close quick actions
    setShowQuickActions(false);

    // Handle copy action
    if (action === 'copy' && element) {
      const elementText = `${element.tag}${element.id ? `#${element.id}` : ''}${element.classes?.length ? `.${element.classes.join('.')}` : ''} - ${element.text || 'No text'}`;
      navigator.clipboard.writeText(elementText);
      setLocalToast({
        title: 'Copied!',
        description: 'Element details copied to clipboard',
        variant: 'success',
      });
      return;
    }


    // Map action to allowed LogEvent type
    let eventType: LogEvent['type'] = 'inspect';
    if (action === 'debug' || action === 'context') eventType = 'debug';
    else if (action === 'screenshot') eventType = 'click';
    else if (action === 'details') eventType = 'inspect';
    
    // Log to events
    setEvents(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: eventType,
        timestamp,
        position: mousePosition,
        element: element ? {
          tag: element.tag,
          id: element.id,
          classes: element.classes,
          text: element.text,
          parentPath: element.parentPath,
          attributes: element.attributes,
          size: element.size,
        } : undefined,
      },
    ]);
    
    // Log to console
    setConsoleLogs(prev => [
      ...prev,
      `[${timestamp}] QuickAction: ${action} on ${element ? element.tag : 'unknown'}`
    ]);
    
    // Handle debug action
    if (action === 'debug' && element) {
      try {
        const aiResponse = await callAIDebugFunction('Debug this element', element, mousePosition);
        setDebugResponses(prev => [
          ...prev,
          { response: aiResponse, timestamp }
        ]);
        setShowTerminal(true);
        setActiveTerminalTab('debug');
        setLocalToast({
          title: 'Debug complete!',
          description: 'Check the terminal for AI debug results.',
          variant: 'success',
        });
      } catch (err) {
        setLocalToast({
          title: 'Debug failed',
          description: err instanceof Error ? err.message : 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    }
  }, [mousePosition]);

  // Check if user needs authentication for certain features
  const handleAuthRequired = useCallback(() => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  }, [user]);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('logtrace-extension-onboarding-completed', 'true');
  }, []);

  // Check if onboarding should be shown
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('logtrace-extension-onboarding-completed');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  // Add robust global shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).isContentEditable ||
          (activeElement.getAttribute && activeElement.getAttribute('role') === 'textbox')
        )
      ) {
        return; // Do not fire shortcut if user is typing
      }
      
      // Ctrl+S for start/stop
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsActive(!isActive);
      }
      
      // P for pause/unpause (single key, no modifier)
      if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (isHoverPaused) {
          resumeHoverOverlay();
        } else {
          pauseHoverOverlay();
        }
      }
      
      // Ctrl+E for end/escape
      if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsActive(false);
        setShowElementInspector(false);
        resumeHoverOverlay();
      }
      
      // Ctrl+Shift+T for terminal toggle
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setShowTerminal(!showTerminal);
      }
      
      // Escape for general close/cancel
      if (e.key === 'Escape') {
        if (showQuickActions) {
          setShowQuickActions(false);
          resumeHoverOverlay();
        } else {
          setShowElementInspector(false);
          resumeHoverOverlay();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isHoverPaused, currentElement, mousePosition, showTerminal, showQuickActions, pauseHoverOverlay, resumeHoverOverlay, handleQuickAction]);

  // Mouse tracking logic
  useEffect(() => {
    if (!isHoverPaused) {
      setPausedElement(null);
      setPausedPosition(null);
    }
  }, [isHoverPaused]);

  const handleOverlayElementClick = () => {
    if (currentElement) {
      addPin(currentElement, mousePosition);
    }
    setShowElementInspector(true);
    pauseHoverOverlay();
  };

  const handleInspectorMouseEnter = () => {
    setIsInspectorHovered(true);
    pauseHoverOverlay();
  };
  
  const handleInspectorMouseLeave = () => {
    setIsInspectorHovered(false);
    if (!showQuickActions) {
      resumeHoverOverlay();
    }
  };

  return (
    <>
      {localToast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[2147483649] px-4 py-2 rounded shadow-lg ${localToast.variant === 'success' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}
             onClick={() => setLocalToast(null)}
        >
          <strong>{localToast.title}</strong>
          {localToast.description && <div className="text-sm mt-1">{localToast.description}</div>}
        </div>
      )}
      
      {/* Settings Button - top right corner */}
      <button
        onClick={() => setShowSettingsDrawer(true)}
        className="fixed top-4 right-4 z-[2147483650] bg-slate-900/80 border border-cyan-500/40 rounded-full p-2 shadow-lg hover:bg-cyan-900 transition-colors"
        title="Settings"
        style={{ pointerEvents: 'auto' }}
      >
        <Settings className="h-5 w-5 text-cyan-400" />
      </button>

      {/* Terminal Toggle Button - bottom left corner */}
      <button
        onClick={() => setShowTerminal(!showTerminal)}
        className="fixed bottom-4 left-4 z-[2147483650] bg-slate-900/80 border border-green-500/40 rounded-full p-2 shadow-lg hover:bg-green-900 transition-colors"
        title="Toggle Terminal (Ctrl+Shift+T)"
        style={{ pointerEvents: 'auto' }}
      >
        <Terminal className="h-5 w-5 text-green-400" />
      </button>

      {/* Quick Actions Menu */}
      {showQuickActions && (
        <div 
          className="fixed z-[2147483650] bg-slate-900/95 border border-cyan-500/50 rounded-lg shadow-xl p-2 min-w-[150px]"
          style={{ 
            left: quickActionsPosition.x, 
            top: quickActionsPosition.y,
            pointerEvents: 'auto' 
          }}
        >
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleQuickAction('copy', currentElement)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded"
            >
              <span>📋</span>
              <span>Copy Element</span>
            </button>
            <button
              onClick={() => handleQuickAction('details', currentElement)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded"
            >
              <span>🔍</span>
              <span>Element Details</span>
            </button>
            <button
              onClick={() => handleQuickAction('debug', currentElement)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-yellow-400 hover:bg-yellow-500/10 rounded"
            >
              <span>🤖</span>
              <span>AI Debug</span>
            </button>
            <button
              onClick={() => handleQuickAction('screenshot', currentElement)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-green-400 hover:bg-green-500/10 rounded"
            >
              <span>📸</span>
              <span>Screenshot</span>
            </button>
            <button
              onClick={() => handleQuickAction('context', currentElement)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-purple-400 hover:bg-purple-500/10 rounded"
            >
              <span>🧠</span>
              <span>Context Analysis</span>
            </button>
            <button
              onClick={() => {
                setShowQuickActions(false);
                resumeHoverOverlay();
              }}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded border-t border-gray-600 mt-1"
            >
              <span>❌</span>
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      <SettingsDrawer
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
      />
      
      <ExtensionMouseOverlay
        isActive={isActive}
        currentElement={isHoverPaused && pausedElement ? pausedElement : currentElement}
        mousePosition={isHoverPaused && pausedPosition ? pausedPosition : mousePosition}
        showElementInspector={showElementInspector}
        overlayRef={overlayRef}
        onPin={handleOverlayPin}
        onQuickAction={handleQuickAction}
        onElementClick={handleOverlayElementClick}
        onRightClick={handleRightClick}
        isHoverPaused={isHoverPaused}
      />
      
      <ElementInspector
        isVisible={showElementInspector}
        currentElement={isHoverPaused && pausedElement ? pausedElement : currentElement}
        mousePosition={isHoverPaused && pausedPosition ? pausedPosition : mousePosition}
        onDebug={() => {
          handleQuickAction('debug', currentElement);
        }}
        onClose={() => {
          setShowElementInspector(false);
          resumeHoverOverlay();
        }}
        panelRef={elementInspectorRef}
        isExtensionMode={true}
        isDraggable={true}
        isPinned={false}
        onPin={handleOverlayPin}
        onShowMoreDetails={() => {}}
        currentDebugCount={guestDebugCount}
        maxDebugCount={5}
        onMouseEnter={handleInspectorMouseEnter}
        onMouseLeave={handleInspectorMouseLeave}
      />
      
      <PinnedDetails pins={pinnedDetails} onRemove={removePin} />
      
      <ExtensionTerminalWrapper
        showTerminal={showTerminal}
        onToggleTerminal={() => setShowTerminal(v => !v)}
        events={events}
        onExportEvents={handleExportEvents}
        onClearEvents={handleClearEvents}
        debugResponses={debugResponses}
        onClearDebugResponses={handleClearDebugResponses}
        consoleLogs={consoleLogs}
        activeTab={activeTerminalTab}
        setActiveTab={setActiveTerminalTab}
      />
      
      {showAuthModal && (
        <ExtensionAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onGitHubSignIn={handleSignInWithGitHub}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLoading={isLoading}
          toast={toast}
        />
      )}
    </>
  );
};
