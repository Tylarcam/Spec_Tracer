
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import IframeDemoBar from '@/components/IframeDemoBar';
import LogTrace from '@/components/LogTrace';
import { useToast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const siteUrl = params.get('site');
  const isDemoMode = params.get('demo') === 'true';
  const [iframeError, setIframeError] = useState(false);
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (siteUrl && iframeError) {
      toast({
        title: 'Site Blocked Embedding',
        description: 'This website prevents embedding in iframes. Try another URL.',
        variant: 'destructive',
      });
    }
  }, [siteUrl, iframeError, toast]);

  // Show demo instructions when in demo mode
  useEffect(() => {
    if (isDemoMode && siteUrl) {
      setTimeout(() => {
        toast({
          title: 'Demo Mode Active',
          description: 'Press S to activate LogTrace and start inspecting elements!',
          duration: 5000,
        });
      }, 1000);
    }
  }, [isDemoMode, siteUrl, toast]);

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
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-cyan-500/20 to-green-500/20 border-b border-cyan-500/30 backdrop-blur-md">
          <div className="flex items-center justify-center py-2 px-4">
            <div className="text-sm text-cyan-200 font-medium">
              🚀 Demo Mode Active • Press <kbd className="bg-slate-700 px-1 rounded mx-1">S</kbd> to start • 
              Move mouse to highlight • Click to inspect • <kbd className="bg-slate-700 px-1 rounded mx-1">Ctrl+D</kbd> to debug with AI
            </div>
          </div>
        </div>
      )}

      {/* Main content area with iframe */}
      <div className="relative" style={{ marginTop: isDemoMode ? '40px' : '0' }}>
        <iframe
          ref={iframeRef}
          src={siteUrl}
          className="w-full border-none"
          style={{ height: isDemoMode ? 'calc(100vh - 40px)' : '100vh' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onError={handleIframeError}
          onLoad={handleIframeLoad}
          title="Demo Website"
        />
        {iframeError && (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <div className="text-center text-slate-300 max-w-md mx-auto p-6">
              <h3 className="text-lg font-semibold mb-2">Unable to load website</h3>
              <p className="text-sm mb-4">This site may block embedding. Try one of our iframe-friendly examples:</p>
              <div className="space-y-2">
                <div className="text-cyan-400 font-mono">example.com</div>
                <div className="text-cyan-400 font-mono">httpbin.org</div>
                <div className="text-cyan-400 font-mono">jsonplaceholder.typicode.com</div>
              </div>
              <button 
                onClick={() => window.location.href = '/'} 
                className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
              >
                Try Another Site
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* LogTrace overlay with iframe integration */}
      <div className="absolute inset-0 pointer-events-none" style={{ top: isDemoMode ? '40px' : '0' }}>
        <LogTrace iframeRef={iframeRef} />
      </div>
    </div>
  );
};

export default Index;
