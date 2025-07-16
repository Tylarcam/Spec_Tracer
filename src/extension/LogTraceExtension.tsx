
import React, { useState, useEffect, useCallback } from 'react';
import ExtensionMouseOverlay from './components/ExtensionMouseOverlay';
import PinnedDetails from './components/PinnedDetails';
import ExtensionTerminalWrapper from './components/ExtensionTerminalWrapper';
import { usePinnedDetails } from '@/shared/hooks/usePinnedDetails';
import { ElementInfo, LogEvent } from '@/shared/types';
import ExtensionAuthModal from './components/ExtensionAuthModal';
import { useExtensionAuth } from './hooks/useExtensionAuth';

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
  const overlayRef = React.useRef<HTMLDivElement>(null);

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
  const handleQuickAction = (action: 'details' | 'screenshot' | 'context' | 'debug', element: ElementInfo | null) => {
    const timestamp = new Date().toISOString();
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

  return (
    <>
      <ExtensionMouseOverlay
        isActive={isActive}
        currentElement={currentElement}
        mousePosition={mousePosition}
        showElementInspector={showElementInspector}
        overlayRef={overlayRef}
        onPin={handleOverlayPin}
        onQuickAction={handleQuickAction}
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
