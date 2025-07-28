
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import SpecTrace from '@/components/LogTrace';
import NavBar from '@/components/NavBar';

const Debug: React.FC = () => {
  const isMobile = useIsMobile();
  const [isTracing, setIsTracing] = useState(false);

  const handleCaptureToggle = (active: boolean) => {
    setIsTracing(active);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar 
        isTracing={isTracing}
        isHoverEnabled={true}
        onToggleTracing={() => handleCaptureToggle(!isTracing)}
        onToggleHover={() => {}}
        onOpenSettings={() => {}}
        onToggleTerminal={() => {}}
        eventCount={0}
        showTerminal={false}
      />
      <SpecTrace 
        captureActive={isTracing}
        onCaptureToggle={handleCaptureToggle}
      />
    </div>
  );
};

export default Debug;
