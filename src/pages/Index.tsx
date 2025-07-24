
import React from 'react';
import LogTrace from '@/components/LogTrace';
import { useTracingContext } from '@/App';

const Index = () => {
  const { 
    tracingActive, 
    setTracingActive,
    isHoverEnabled,
    setIsHoverEnabled,
    eventCount,
    setEventCount,
    showTerminal,
    setShowTerminal
  } = useTracingContext();
  
  return (
    <div className="pt-16"> {/* Add padding to account for fixed navbar */}
      <LogTrace 
        captureActive={tracingActive}
        onCaptureToggle={setTracingActive}
      />
    </div>
  );
};

export default Index;
