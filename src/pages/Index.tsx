
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LogTrace from '@/components/LogTrace';
<<<<<<< HEAD
import { useTracingContext } from '@/App';

const Index: React.FC = () => {
  const [searchParams] = useSearchParams();
  const showOnboarding = searchParams.get('onboarding') === 'true';
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const { tracingActive, setTracingActive } = useTracingContext();
=======

const Index: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding');
    if (onboardingParam === 'true') {
      setShowOnboarding(true);
    }
  }, [searchParams]);
>>>>>>> d809fe1e9841dfd5cf65b240712338be274da7bf

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen pt-14 md:pt-16">
<<<<<<< HEAD
      <LogTrace 
        tracingActive={tracingActive}
        onTracingToggle={setTracingActive}
      />
=======
      <LogTrace />
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-4">Welcome to LogTrace!</h2>
            <p className="text-gray-600 mb-4">
              Click "Start Trace" to begin debugging your web application.
            </p>
            <button
              onClick={handleOnboardingComplete}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
>>>>>>> d809fe1e9841dfd5cf65b240712338be274da7bf
    </div>
  );
};

export default Index;
