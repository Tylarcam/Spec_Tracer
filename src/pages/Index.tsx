
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import LogTrace from '@/components/LogTrace';

const Index: React.FC = () => {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-900 ${isMobile ? 'overflow-x-hidden' : ''}`}>
      {/* Mobile-optimized header spacing */}
      <div className={`${isMobile ? 'pt-20 pb-4' : 'pt-4'}`}>
        {/* Mobile welcome message */}
        {isMobile && (
          <div className="px-4 mb-4">
            <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-400 mb-2">
                Welcome to LogTrace
              </h2>
              <p className="text-sm text-slate-300">
                Tap the floating action button to get started with debugging your web app.
              </p>
            </div>
          </div>
        )}
        
        <LogTrace />
      </div>
    </div>
  );
};

export default Index;
