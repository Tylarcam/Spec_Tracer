
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

  // If no site URL, show the search interface
  if (!siteUrl) {
    return <IframeDemoBar />;
  }

  return (
    <div className="min-h-screen">
      {/* Compact header when site is loaded */}
      <div className="w-full bg-slate-900 border-b border-slate-700 p-3 flex gap-2 z-40 sticky top-0">
        <div className="flex-1 flex items-center gap-3">
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            LogTrace: Context Editing
          </h2>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium text-sm">Analyzing:</span>
          <span className="text-white font-mono text-sm truncate">{siteUrl}</span>
        </div>
        <button 
          onClick={() => window.location.href = '/debug'}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-cyan-400 rounded-lg text-slate-300 hover:text-white text-sm transition-all duration-200"
        >
          Change URL
        </button>
      </div>
      
      {/* Iframe */}
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
      
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner size={48} /></div>}>
        <LogTrace />
      </Suspense>
    </div>
  );
};

export default Index;
