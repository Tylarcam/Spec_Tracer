
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LogTrace from '@/components/LogTrace';
import NavBar from '@/components/NavBar';
import { useTracingContext } from '@/contexts/TracingContext';

const Index = () => {
  const [searchParams] = useSearchParams();
  const showOnboarding = searchParams.get('onboarding') === 'true';
  const [showTerminal, setShowTerminal] = useState(false);
  
  const {
    isTracing,
    setIsTracing,
    isHoverEnabled,
    setIsHoverEnabled,
    eventCount,
    setEventCount,
  } = useTracingContext();

  const handleToggleTracing = () => {
    setIsTracing(!isTracing);
  };

  const handleToggleHover = () => {
    setIsHoverEnabled(!isHoverEnabled);
  };

  const handleToggleTerminal = () => {
    setShowTerminal(!showTerminal);
  };

  const handleEventCountChange = (count: number) => {
    setEventCount(count);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar
        isTracing={isTracing}
        isHoverEnabled={isHoverEnabled}
        onToggleTracing={handleToggleTracing}
        onToggleHover={handleToggleHover}
        onOpenSettings={() => {}}
        onToggleTerminal={handleToggleTerminal}
        eventCount={eventCount}
        showTerminal={showTerminal}
      />
      
      <div className="pt-16">
        <LogTrace
          captureActive={isTracing}
          onCaptureToggle={setIsTracing}
          onEventCountChange={handleEventCountChange}
        />
      </div>
    </div>
  );
};

export default Index;
