
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, Github, MessageSquare, Target } from 'lucide-react';

const IframeDemoBar: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const popularSites = [
    { name: 'example.com', url: 'https://example.com' },
    { name: 'httpbin.org', url: 'https://httpbin.org' },
    { name: 'jsonplaceholder.typicode.com', url: 'https://jsonplaceholder.typicode.com' },
    { name: 'httpstat.us', url: 'https://httpstat.us' },
    { name: 'postman-echo.com', url: 'https://postman-echo.com' },
  ];

  const handleAnalyze = () => {
    if (url.trim()) {
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }
      const encodedUrl = encodeURIComponent(formattedUrl);
      navigate(`/interactive-demo?site=${encodedUrl}`);
    }
  };

  const handlePopularSite = (siteUrl: string) => {
    const encodedUrl = encodeURIComponent(siteUrl);
    navigate(`/interactive-demo?site=${encodedUrl}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-3 rounded-xl">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            LogTrace
          </h1>
        </div>
        
        {/* Tagline */}
        <h2 className="text-xl text-slate-300 mb-8">
          Debug any website with AI-powered inspection
        </h2>
        
        {/* Instruction */}
        <p className="text-slate-400 mb-8">
          Enter any URL below to start debugging with LogTrace
        </p>
        
        {/* URL Input */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="url"
              placeholder="example.com, httpbin.org, postman-echo.com..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-12 py-6 text-lg bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-green-400 focus:ring-green-400/20"
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!url.trim()}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-6 text-lg"
          >
            Analyze
          </Button>
        </div>

        {/* Popular Examples */}
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">iframe-friendly examples:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {popularSites.map((site) => (
              <Button
                key={site.name}
                variant="outline"
                onClick={() => handlePopularSite(site.url)}
                className="bg-slate-800/30 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 px-6 py-2"
              >
                {site.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Note about iframe compatibility */}
        <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-600/30">
          <p className="text-slate-400 text-sm">
            <strong className="text-slate-300">Note:</strong> These websites are specifically chosen for iframe compatibility. 
            The examples above are verified to work well with LogTrace.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IframeDemoBar;
