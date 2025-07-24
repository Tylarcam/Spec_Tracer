import React, { useState, useEffect } from 'react';
import IframeDemoBar from '@/components/IframeDemoBar';
import LogTrace from '@/components/LogTrace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, X, AlertCircle, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const InteractiveDemo: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [currentUrl, setCurrentUrl] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tracingActive, setTracingActive] = useState(false);

  // Check if URL was passed from the demo bar
  useEffect(() => {
    const siteParam = searchParams.get('site');
    if (siteParam) {
      const decodedUrl = decodeURIComponent(siteParam);
      setCurrentUrl(decodedUrl);
      setShowIframe(true);
      setIsLoading(true);
    }
  }, [searchParams]);

  const handleUrlChange = () => {
    if (newUrl.trim()) {
      let formattedUrl = newUrl.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }
      setCurrentUrl(formattedUrl);
      setShowIframe(true);
      setIsEditingUrl(false);
      setNewUrl('');
      setIframeError(false);
      setIsLoading(true);
    }
  };

  const handleCloseIframe = () => {
    setShowIframe(false);
    setCurrentUrl('');
    setIframeError(false);
    setIsLoading(false);
  };

  const handleEditUrl = () => {
    setNewUrl(currentUrl);
    setIsEditingUrl(true);
  };

  const handleCancelEdit = () => {
    setIsEditingUrl(false);
    setNewUrl('');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setIframeError(true);
  };

  const handleRetry = () => {
    setIframeError(false);
    setIsLoading(true);
    // Force iframe reload by changing key
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  if (!showIframe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <IframeDemoBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* URL Bar and Controls */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-green-500/30 p-4">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-2 rounded-lg">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-green-400 font-semibold">LogTrace Demo</span>
          </div>
          
          {isEditingUrl ? (
            <div className="flex-1 flex items-center gap-2">
              <Input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Enter website URL..."
                className="flex-1 bg-slate-800 border-slate-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleUrlChange()}
                autoFocus
              />
              <Button onClick={handleUrlChange} size="sm" className="bg-green-500 hover:bg-green-600 text-black">
                Go
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 bg-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-300 truncate">
                {currentUrl}
              </div>
              <Button onClick={handleEditUrl} variant="outline" size="sm">
                Change URL
              </Button>
            </div>
          )}
          
          <Button onClick={handleCloseIframe} variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* LogTrace Status Indicator */}
        <div className="flex items-center justify-center mt-2">
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">LogTrace Active</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute top-24 left-4 right-4 z-40 bg-blue-900/90 border border-blue-500/50 rounded-lg p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />
            <div>
              <h3 className="text-blue-300 font-medium">Loading Website</h3>
              <p className="text-blue-200 text-sm">Please wait while the website loads...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {iframeError && (
        <div className="absolute top-24 left-4 right-4 z-40 bg-red-900/90 border border-red-500/50 rounded-lg p-4 max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-red-300 font-medium mb-1">Cannot Load Website</h3>
              <p className="text-red-200 text-sm mb-3">
                This website cannot be displayed in an iframe due to security restrictions. 
                Try these iframe-friendly alternatives:
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {['example.com', 'httpbin.org', 'jsonplaceholder.typicode.com', 'httpstat.us', 'postman-echo.com'].map((site) => (
                  <span key={site} className="text-xs bg-red-800/50 text-red-200 px-2 py-1 rounded">
                    {site}
                  </span>
                ))}
              </div>
              <Button onClick={handleRetry} size="sm" variant="outline" className="border-red-500/50 text-red-300 hover:bg-red-900/50">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Iframe Container */}
      <div className="absolute inset-0 pt-20">
        <iframe
          key={currentUrl} // Force remount on URL change
          src={currentUrl}
          className="w-full h-full border-0"
          title="Website Demo"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-navigation"
        />
      </div>

      {/* LogTrace Overlay */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="pointer-events-auto">
          <LogTrace 
            captureActive={tracingActive}
            onCaptureToggle={setTracingActive}
          />
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;
