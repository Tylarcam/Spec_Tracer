import React, { useState, useEffect, useCallback, useRef } from 'react';
import ExtensionMouseOverlay from './components/ExtensionMouseOverlay';
import PinnedDetails from './components/PinnedDetails';
import ExtensionTerminalWrapper from './components/ExtensionTerminalWrapper';
import { usePinnedDetails } from '@/shared/hooks/usePinnedDetails';
import { ElementInfo, LogEvent } from '@/shared/types';
import ExtensionAuthModal from './components/ExtensionAuthModal';
import { useExtensionAuth } from './hooks/useExtensionAuth';
import { callAIDebugFunction } from '@/shared/api';
import { Settings } from 'lucide-react';
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

  // Event and debug response handlers (placeholder logic)
  const handleExportEvents = () => {
    // Export events as JSON
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

  // Quick Action handler
  const handleQuickAction = async (
    action: 'details' | 'screenshot' | 'context' | 'debug' | { type: 'context', mode: string, input: string },
    element: ElementInfo | null
  ) => {
    const timestamp = new Date().toISOString();

    // If this is a context gen action with user input
    if (typeof action === 'object' && action.type === 'context') {
      // Build a prompt based on mode and input
      const prompt = `Context Action: ${action.mode}\nUser Input: ${action.input}\nElement: ${element ? JSON.stringify(element) : 'none'}`;
      try {
        const aiResponse = await callAIDebugFunction(prompt, element, mousePosition);
        setDebugResponses(prev => [
          ...prev,
          { response: aiResponse, timestamp }
        ]);
        setConsoleLogs(prev => [
          ...prev,
          `[${timestamp}] AI Response: ${aiResponse}`
        ]);
        setShowTerminal(true);
        setActiveTerminalTab('debug');
        setLocalToast({
          title: 'Request sent!',
          description: 'Your AI debug results are now in the terminal.',
          variant: 'success',
        });
      } catch (err) {
        setConsoleLogs(prev => [
          ...prev,
          `[${timestamp}] AI Error: ${err instanceof Error ? err.message : String(err)}`
        ]);
        setLocalToast({
          title: 'AI Generation Failed',
          description: err instanceof Error ? err.message : 'Unknown error occurred',
          variant: 'destructive',
        });
      }
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
    // Simulate AI response for debug/context
    if (action === 'debug' || action === 'context') {
      setTimeout(() => {
        setDebugResponses(prev => [
          ...prev,
          {
            response: `Simulated AI response for ${action} on ${element ? element.tag : 'unknown'}`,
            timestamp,
          },
        ]);
        setConsoleLogs(prev => [
          ...prev,
          `[${timestamp}] AI Response: Simulated response for ${action}`
        ]);
      }, 800);
    }
  };

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
      
      // Ctrl+D for debug/context
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        // You can trigger your debug/context action here if needed
        // e.g., setShowElementInspector(true) or similar
      }
      
      // Ctrl+S for start/stop
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsActive(!isActive);
      }
      
      // Ctrl+P for pause/unpause
      if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsHoverPaused(!isHoverPaused);
        if (!isHoverPaused && currentElement) {
          setPausedElement(currentElement);
          setPausedPosition(mousePosition);
        }
      }
      
      // Ctrl+E for end/escape
      if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsActive(false);
        setShowElementInspector(false);
        setIsHoverPaused(false);
      }
      
      // Ctrl+T for terminal
      if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setShowTerminal(!showTerminal);
      }
      
      // Escape for general close/cancel
      if (e.key === 'Escape') {
        setShowElementInspector(false);
        setIsHoverPaused(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isHoverPaused, currentElement, mousePosition, showTerminal]);

  // Mouse tracking logic
  useEffect(() => {
    if (!isHoverPaused) {
      setPausedElement(null);
      setPausedPosition(null);
    }
  }, [isHoverPaused]);

  // In ExtensionMouseOverlay, add a handler to open the inspector on element click
  const handleOverlayElementClick = () => {
    setShowElementInspector(true);
    setIsHoverPaused(true);
    setPausedElement(currentElement);
    setPausedPosition(mousePosition);
  };

  const handleInspectorMouseEnter = () => {
    setIsInspectorHovered(true);
    setIsHoverPaused(true);
  };
  const handleInspectorMouseLeave = () => {
    setIsInspectorHovered(false);
    setIsHoverPaused(false);
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
      />
      <ElementInspector
        isVisible={showElementInspector}
        currentElement={isHoverPaused && pausedElement ? pausedElement : currentElement}
        mousePosition={isHoverPaused && pausedPosition ? pausedPosition : mousePosition}
        onDebug={() => {
          // You can trigger the debug modal or quick action here
          handleQuickAction('debug', currentElement);
        }}
        onClose={() => {
          setShowElementInspector(false);
          setIsHoverPaused(false);
        }}
        panelRef={elementInspectorRef}
        isExtensionMode={true}
        isDraggable={true}
        isPinned={false}
        onPin={handleOverlayPin}
        onShowMoreDetails={() => {}}
        currentDebugCount={guestDebugCount}
        maxDebugCount={5}
        // Pause hover when mouse is over inspector
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
