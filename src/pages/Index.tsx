
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Main Content Area */}
      <div className="relative h-screen">
        {/* Welcome Header */}
        <div className="pt-24 pb-8 px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to LogTrace Debug Mode
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            This is a demo page to learn how to use LogTrace. Try hovering over elements, clicking them, and using the debug features.
          </p>
        </div>

        {/* Instructions Card */}
        {!showOnboarding && (
          <div className="flex justify-center px-4 mb-8">
            <InstructionsCard />
          </div>
        )}

        {/* Sample Demo Content */}
        <div className="px-8 space-y-6">
          <div className="max-w-4xl mx-auto">
            {/* Sample interactive elements for testing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-3">Interactive Button</h2>
                <button 
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  onClick={() => console.log('Button clicked!')}
                >
                  Click Me to Test
                </button>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-3">Form Elements</h2>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Test input field" 
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                  <select className="w-full px-3 py-2 border rounded-md bg-background">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-3">Navigation Links</h2>
                <div className="space-y-2">
                  <a href="#" className="block text-primary hover:underline">
                    Test Link 1
                  </a>
                  <a href="#" className="block text-primary hover:underline">
                    Test Link 2
                  </a>
                  <a href="#" className="block text-primary hover:underline">
                    Test Link 3
                  </a>
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-3">Complex Element</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="check1" />
                    <label htmlFor="check1">Checkbox option</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="radio1" name="radio" />
                    <label htmlFor="radio1">Radio option</label>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm">
                      This is a nested element with multiple children. Great for testing element detection!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-accent rounded-lg">
              <h2 className="text-xl font-semibold mb-3">How to Use LogTrace</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Toggle "Capture" in the navigation to activate tracing</li>
                <li>{isMobile ? 'Touch' : 'Hover over'} any element to see inspection details</li>
                <li>Click on elements to open the inspector panel</li>
                <li>Use the debug button to analyze elements with AI</li>
                <li>View your debug history in the terminal</li>
              </ol>
            </div>
          </div>
        </div>

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
