
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LogTrace from '@/components/LogTrace';
import OnboardingWalkthrough from '@/components/LogTrace/OnboardingWalkthrough';
import InstructionsCard from '@/components/LogTrace/InstructionsCard';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [captureActive, setCaptureActive] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Check if onboarding should be shown
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding');
    if (onboardingParam === 'true') {
      setShowOnboarding(true);
    }
  }, [searchParams]);

  const handleOnboardingNext = () => {
    setOnboardingStep(prev => prev + 1);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Main Content Area */}
      <div className="relative h-screen">
        {/* Welcome Header */}
        <div className="pt-24 pb-8 px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to LogTrace Debug Mode
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            This is a demo page to learn how to use LogTrace. Try hovering over elements, clicking them, and using the debug features.
          </p>
        </div>

        {/* Instructions Card */}
        {!showOnboarding && (
          <div className="flex justify-center px-4 mb-8">
            <InstructionsCard />
          </div>
        )}

        {/* LogTrace Overlay */}
        <div className="absolute inset-0 pointer-events-none z-30">
          <div className="pointer-events-auto">
            <LogTrace 
              captureActive={captureActive}
              onCaptureToggle={setCaptureActive}
            />
          </div>
        </div>
      </div>

      {/* Onboarding Walkthrough */}
      {showOnboarding && (
        <OnboardingWalkthrough
          step={onboardingStep}
          onNext={handleOnboardingNext}
          onSkip={handleOnboardingSkip}
          onComplete={handleOnboardingComplete}
          isActive={captureActive}
        />
      )}
    </div>
  );
};

export default Index;
