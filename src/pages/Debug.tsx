
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import LogTrace from '@/components/LogTrace';

const Debug: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-slate-900">
      <LogTrace 
        captureActive={false}
        onCaptureToggle={() => {}}
      />
    </div>
  );
};

export default Debug;
