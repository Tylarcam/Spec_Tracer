
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LogTrace from '@/components/LogTrace';
import InstructionsCard from '@/components/LogTrace/InstructionsCard';
import { useCaptureContext } from '@/App';

const Index: React.FC = () => {
  const [searchParams] = useSearchParams();
  const showOnboarding = searchParams.get('onboarding') === 'true';
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const { captureActive, setCaptureActive } = useCaptureContext();

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
    // Remove onboarding param from URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('onboarding');
    const newUrl = `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
    window.history.replaceState(null, '', newUrl);
  };

  return (
    <div className="min-h-screen pt-14 md:pt-16">
      {!captureActive && (
        <div className="container mx-auto px-4 py-8">
          <InstructionsCard />
        </div>
      )}
      <LogTrace />
    </div>
  );
};

export default Index;
