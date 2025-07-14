import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Globe } from 'lucide-react';

const IframeDemoBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [url, setUrl] = useState(params.get('site') ?? '');
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleOpen = () => {
    if (!url.trim()) {
      toast({ 
        title: 'Please enter a URL', 
        variant: 'destructive' 
      });
      return;
    }
    try {
      let fullUrl = url.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
      }
      navigate(`/debug?site=${encodeURIComponent(fullUrl)}`);
    } catch {
      toast({ title: 'Invalid URL', variant: 'destructive' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleOpen();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-2xl">
        {/* Hero text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Debug Any Website
          </h1>
          <p className="text-slate-300 text-lg">
            Paste a URL below to start debugging with LogTrace
          </p>
        </div>

        {/* Modern search bar */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Main input container */}
          <div className="relative bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-2 hover:border-cyan-400/50 transition-all duration-300 shadow-2xl">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 pl-3">
                <Globe className="w-6 h-6 text-cyan-400" />
              </div>
              
              {/* Input */}
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-transparent border-none outline-none text-lg text-white placeholder-slate-400 font-medium py-4"
                  placeholder="Enter website URL (e.g. github.com, reddit.com, your-site.com)"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
              
              {/* Button */}
              <div className="flex-shrink-0 pr-2">
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  onClick={handleOpen}
                >
                  <Search className="w-5 h-5" />
                  Debug
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular examples */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm mb-3">Popular examples:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['github.com', 'reddit.com', 'stackoverflow.com', 'stripe.com', 'vercel.com'].map((example) => (
              <button
                key={example}
                onClick={() => setUrl(example)}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-cyan-400/50 rounded-lg text-slate-300 hover:text-white text-sm transition-all duration-200"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IframeDemoBar; 