
import React, { useEffect } from 'react';
import LogTrace from '@/components/LogTrace';
import { useTracingContext } from '@/App';

const Index = () => {
  console.log('Index component rendering...');
  
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

  useEffect(() => {
    console.log('Index component mounted, tracingActive:', tracingActive);
  }, [tracingActive]);
  
  console.log('Index component render complete, about to render LogTrace');
  
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
