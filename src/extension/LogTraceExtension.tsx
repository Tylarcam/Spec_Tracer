
import React, { useState, useEffect, useCallback } from 'react';
import LogTrace from '@/components/LogTrace';
import ExtensionAuthModal from './components/ExtensionAuthModal';
import { useExtensionAuth } from './hooks/useExtensionAuth';

export const LogTraceExtension: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
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
      <LogTrace
        showOnboarding={showOnboarding}
        onOnboardingComplete={handleOnboardingComplete}
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
