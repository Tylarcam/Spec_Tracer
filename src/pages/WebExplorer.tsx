import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import LogTrace from '@/components/LogTrace';
import { Globe, Target, ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';

const WebExplorer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const siteUrl = params.get('site');
  
  const [url, setUrl] = useState('');
  const [iframeError, setIframeError] = useState(false);
  const [captureActive, setCaptureActive] = useState(false);
  const { toast } = useToast();

  const popularSites = [
    { name: 'example.com', url: 'https://example.com' },
    { name: 'httpbin.org', url: 'https://httpbin.org' },
    { name: 'jsonplaceholder.typicode.com', url: 'https://jsonplaceholder.typicode.com' },
    { name: 'httpstat.us', url: 'https://httpstat.us/200' },
    { name: 'postman-echo.com', url: 'https://postman-echo.com' },
  ];

  useEffect(() => {
    if (siteUrl && iframeError) {
      toast({
        title: 'Site Blocked Embedding',
        description: 'This website prevents embedding in iframes. Try another URL.',
        variant: 'destructive',
      });
    }
  }, [siteUrl, iframeError, toast]);

  const handleAnalyze = () => {
    if (url.trim()) {
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }
      setIframeError(false);
      const encodedUrl = encodeURIComponent(formattedUrl);
      navigate(`/explore?site=${encodedUrl}`);
    }
  };

  const handlePopularSite = (siteUrl: string) => {
    setIframeError(false);
    const encodedUrl = encodeURIComponent(siteUrl);
    navigate(`/explore?site=${encodedUrl}`);
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  const handleIframeLoad = () => {
    setIframeError(false);
  };

  const handleBack = () => {
    navigate('/explore');
  };

  // If no site URL, show the input page
  if (!siteUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-foreground px-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-3 rounded-xl">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              SpecTrace
            </h1>
          </div>
          
          {/* Tagline */}
          <h2 className="text-xl text-muted-foreground mb-8">
            Explore any website with AI-powered inspection
          </h2>
          
          {/* Instruction */}
          <p className="text-muted-foreground mb-8">
            Enter any URL below to start exploring with SpecTrace tools
          </p>
          
          {/* URL Input */}
          <div className="flex gap-3 mb-8">
            <div className="flex-1 relative">
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="url"
                placeholder="example.com, httpbin.org, jsonplaceholder.typicode.com..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-12 py-6 text-lg bg-slate-800/50 border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20"
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!url.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg"
            >
              Explore
            </Button>
          </div>

          {/* Popular Examples */}
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">Try these iframe-friendly examples:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {popularSites.map((site) => (
                <Button
                  key={site.name}
                  variant="outline"
                  onClick={() => handlePopularSite(site.url)}
                  className="bg-slate-800/30 border-border text-muted-foreground hover:bg-slate-700/50 hover:border-muted px-6 py-2"
                >
                  {site.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Note about iframe compatibility */}
          <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-border/30">
            <p className="text-muted-foreground text-sm">
              <strong className="text-foreground">Note:</strong> These websites are specifically chosen for iframe compatibility. 
              Many popular sites like GitHub, Facebook, and Google block iframe embedding for security reasons.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show iframe with LogTrace overlay
  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-border px-4 py-2">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg border border-border">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground truncate max-w-[300px] md:max-w-[500px]">
                {decodeURIComponent(siteUrl)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(decodeURIComponent(siteUrl), '_blank')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open in Tab
          </Button>
        </div>
      </div>

      {/* Iframe Content */}
      <div className="pt-14 h-screen">
        {iframeError ? (
          <div className="flex items-center justify-center h-full bg-slate-800">
            <div className="text-center p-8 max-w-md">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Unable to Load Website</h3>
              <p className="text-muted-foreground mb-6">
                This website blocks iframe embedding for security reasons. Try one of our recommended sites instead.
              </p>
              <Button onClick={handleBack} className="bg-primary hover:bg-primary/90">
                Try Another Site
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            src={decodeURIComponent(siteUrl)}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            onError={handleIframeError}
            onLoad={handleIframeLoad}
            title="Explored Website"
          />
        )}
      </div>

      {/* LogTrace Overlay */}
      <LogTrace 
        captureActive={captureActive}
        onCaptureToggle={setCaptureActive}
      />
    </div>
  );
};

export default WebExplorer;
