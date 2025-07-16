import React, { useState, useEffect, useCallback } from 'react';
import { LogTrace } from '@/components/LogTrace';
import { ExtensionAuthModal } from './components/ExtensionAuthModal';
import { useExtensionAuth } from './hooks/useExtensionAuth';

export const LogTraceExtension: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
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

  const handleSignInClick = () => {
    setShowAuthModal(true);
  };

  return (
    <>
      <LogTrace
        user={user}
        authLoading={authLoading}
        guestDebugCount={guestDebugCount}
        onSignInClick={handleSignInClick}
        incrementGuestDebug={incrementGuestDebug}
        isExtension={true}
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
