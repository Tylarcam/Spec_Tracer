
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import IframeDemoBar from '@/components/IframeDemoBar';
import LogTrace from '@/components/LogTrace';
import { useToast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const siteUrl = params.get('site');
  const [iframeError, setIframeError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (siteUrl && iframeError) {
      toast({
        title: 'Site Blocked Embedding',
        description: 'This website prevents embedding in iframes. Try another URL.',
        variant: 'destructive',
      });
    }
  }, [siteUrl, iframeError, toast]);

  const handleIframeError = () => {
    setIframeError(true);
  };

  const handleIframeLoad = () => {
    setIframeError(false);
  };

  // If no site URL, show the search interface
  if (!siteUrl) {
    return <IframeDemoBar />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Main content area with iframe */}
      <div className="relative">
        <iframe
          src={siteUrl}
          className="w-full h-screen border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onError={handleIframeError}
          onLoad={handleIframeLoad}
          title="Demo Website"
        />
        {iframeError && (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <div className="text-center text-slate-300">
              <h3 className="text-lg font-semibold mb-2">Unable to load website</h3>
              <p className="text-sm">This site may block embedding. Try a different URL.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* LogTrace overlay - this handles everything */}
      <div className="absolute inset-0 pointer-events-none">
        <LogTrace />
      </div>
    </div>
  );
};

export default Index;
