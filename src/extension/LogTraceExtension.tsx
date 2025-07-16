
import React, { useState, useEffect, useCallback } from 'react';
import ExtensionMouseOverlay from './components/ExtensionMouseOverlay';
import PinnedDetails from './components/PinnedDetails';
import { usePinnedDetails } from '@/shared/hooks/usePinnedDetails';
import { ElementInfo } from '@/shared/types';
import ExtensionAuthModal from './components/ExtensionAuthModal';
import { useExtensionAuth } from './hooks/useExtensionAuth';

export const LogTraceExtension: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [currentElement, setCurrentElement] = useState<ElementInfo | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showElementInspector, setShowElementInspector] = useState(false);
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
      />
      <PinnedDetails pins={pinnedDetails} onRemove={removePin} />
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
