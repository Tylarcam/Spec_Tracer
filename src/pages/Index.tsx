
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LogTrace from '@/components/LogTrace';

const Index = () => {
  const [searchParams] = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user came from landing page wanting onboarding
    if (searchParams.get('onboarding') === 'true') {
      setShowOnboarding(true);
    }
  }, [searchParams]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <LogTrace 
        showOnboarding={showOnboarding}
        onOnboardingComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default Index;
