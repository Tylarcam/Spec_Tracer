
import React, { Suspense, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
const LogTrace = React.lazy(() => import('@/components/LogTrace'));
import Spinner from '@/components/ui/spinner';
import IframeDemoBar from '@/components/IframeDemoBar';
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

  return (
    <div className="min-h-screen">
      <IframeDemoBar />
      
      {siteUrl && (
        <div className="relative">
          <iframe
            src={siteUrl}
            className="w-full h-[calc(100vh-60px)] border-none"
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
      )}
      
      {/* Show modern search interface when no URL */}
      {!siteUrl && (
        <div className="flex items-center justify-center min-h-[calc(100vh-60px)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="text-center text-white max-w-4xl px-4">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-3 rounded-2xl">
                  <div className="w-8 h-8 flex items-center justify-center">⚡</div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  LogTrace
                </h1>
              </div>
              <p className="text-xl text-slate-300 mb-4">Debug any website with AI-powered inspection</p>
              <p className="text-slate-400">Enter a URL above to start debugging, or press 'S' to activate on any loaded page</p>
            </div>
          </div>
        </div>
      )}
      
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner size={48} /></div>}>
        <LogTrace />
      </Suspense>
    </div>
  );
};

export default Index;
