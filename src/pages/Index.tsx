
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LogTrace from '@/components/LogTrace';
import { useTracingContext } from '@/App';

const Index: React.FC = () => {
  const [searchParams] = useSearchParams();
  const showOnboarding = searchParams.get('onboarding') === 'true';
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const { tracingActive, setTracingActive } = useTracingContext();

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
      <LogTrace 
        tracingActive={tracingActive}
        onTracingToggle={setTracingActive}
      />
    </div>
  );
};

export default Index;
