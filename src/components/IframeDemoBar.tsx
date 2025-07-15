
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, Github, MessageSquare } from 'lucide-react';

const IframeDemoBar: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const popularSites = [
    { name: 'GitHub', url: 'https://github.com', icon: Github },
    { name: 'Reddit', url: 'https://reddit.com', icon: MessageSquare },
    { name: 'Example Site', url: 'https://example.com', icon: Globe },
  ];

  const handleAnalyze = () => {
    if (url.trim()) {
      const encodedUrl = encodeURIComponent(url.trim());
      navigate(`/debug?site=${encodedUrl}`);
    }
  };

  const handlePopularSite = (siteUrl: string) => {
    setUrl(siteUrl);
  };

  return (
    <div className="bg-slate-800 border-b border-green-500/30 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-400 mb-2">LogTrace Interactive Demo</h1>
          <p className="text-slate-300">Enter any website URL to start debugging with AI-powered insights</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            type="url"
            placeholder="Enter website URL (e.g., https://github.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <Button
            onClick={handleAnalyze}
            disabled={!url.trim()}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6"
          >
            Analyze
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="text-center">
          <p className="text-slate-400 text-sm mb-3">Try these popular sites:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularSites.map((site) => (
              <Button
                key={site.name}
                variant="outline"
                size="sm"
                onClick={() => handlePopularSite(site.url)}
                className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
              >
                <site.icon className="h-4 w-4 mr-2" />
                {site.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IframeDemoBar;
