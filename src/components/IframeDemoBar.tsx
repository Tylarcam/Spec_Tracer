
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, Search, Zap } from 'lucide-react';

const popularSites = [
  'github.com',
  'reddit.com', 
  'stackoverflow.com',
  'stripe.com',
  'vercel.com',
];

const IframeDemoBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [url, setUrl] = useState(params.get('site') ?? '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAnalyze = () => {
    if (!url.trim()) {
      toast({ 
        title: 'Please enter a URL', 
        variant: 'destructive' 
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      let fullUrl = url.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
      }
      
      // Small delay to show the analyzing state
      setTimeout(() => {
        navigate(`/debug?site=${encodeURIComponent(fullUrl)}`);
        setIsAnalyzing(false);
      }, 800);
      
    } catch {
      toast({ title: 'Invalid URL', variant: 'destructive' });
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAnalyze();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-2xl px-4">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              LogTrace
            </span>
          </div>
          <div className="text-2xl text-white font-semibold mb-2 text-center">
            Debug Any Website
          </div>
          <div className="text-slate-400 text-lg text-center">
            Paste a URL below to start debugging with LogTrace
          </div>
        </div>

        {/* Input Card with Glow Effect */}
        <div className="relative group mb-8">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-green-400/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Main input container */}
          <div className="relative bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 hover:border-cyan-400/50 rounded-2xl p-2 transition-all duration-300 shadow-2xl">
            <div className="flex items-center gap-4">
              {/* Globe Icon */}
              <div className="flex-shrink-0 pl-4">
                <Globe className="w-6 h-6 text-cyan-400" />
              </div>
              
              {/* Input */}
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-transparent border-none outline-none text-lg text-white placeholder-slate-400 font-medium py-4"
                  placeholder="github.com, reddit.com, your-website.com..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  disabled={isAnalyzing}
                />
              </div>
              
              {/* Analyze Button */}
              <div className="flex-shrink-0 pr-2">
                <Button
                  className="bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-500 hover:to-cyan-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Debug
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Examples */}
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-4">Popular examples:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {popularSites.map((site) => (
              <button
                key={site}
                onClick={() => setUrl(site)}
                className="px-5 py-2 bg-slate-700/60 hover:bg-slate-600/80 border border-slate-600/50 hover:border-cyan-400/50 rounded-lg text-slate-300 hover:text-white text-sm transition-all duration-200 disabled:opacity-50"
                disabled={isAnalyzing}
              >
                {site}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IframeDemoBar;
