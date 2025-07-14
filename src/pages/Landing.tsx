
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Zap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Landing = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const popularExamples = [
    'github.com',
    'reddit.com', 
    'stackoverflow.com',
    'stripe.com',
    'vercel.com'
  ];

  // Auto-focus on page load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleAnalyze = () => {
    if (!url.trim()) {
      toast({
        title: 'Please enter a URL',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Add https:// if no protocol specified
      let fullUrl = url.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
      }

      const parsed = new URL(fullUrl);
      setIsAnalyzing(true);
      
      // Add a brief delay for the pulsing animation
      setTimeout(() => {
        navigate(`/debug?site=${encodeURIComponent(parsed.href)}`);
      }, 500);
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid website URL',
        variant: 'destructive'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  const handleExampleClick = (example: string) => {
    setUrl(example);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            LogTrace
          </span>
        </div>
        <div className="text-xl text-white font-medium mb-1">
          Debug any website with AI-powered inspection
        </div>
        <div className="text-slate-400 text-base mb-6">
          Enter any URL below to start debugging with LogTrace
        </div>
      </div>

      {/* Input Card */}
      <div className="w-full max-w-2xl flex items-center bg-slate-800/80 border border-cyan-400/20 rounded-2xl shadow-lg px-6 py-4 mb-8 backdrop-blur-md">
        <Globe className="w-6 h-6 text-cyan-400 mr-3" />
        <input
          ref={inputRef}
          className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-slate-400 font-medium"
          placeholder="github.com, reddit.com, your-website.com..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="ml-4 flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-green-400 to-cyan-400 text-white font-semibold shadow hover:from-green-500 hover:to-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Analyze
            </>
          )}
        </button>
      </div>

      {/* Popular Examples */}
      <div className="w-full max-w-2xl flex flex-col items-center">
        <div className="text-slate-400 mb-2">Popular examples:</div>
        <div className="flex flex-wrap gap-3 justify-center">
          {popularExamples.map((site) => (
            <button
              key={site}
              onClick={() => handleExampleClick(site)}
              className="px-5 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white transition"
            >
              {site}
            </button>
          ))}
        </div>
      </div>

      {/* Analyzing state overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full animate-ping"></div>
            </div>
            <p className="text-xl text-white font-medium">Analyzing website...</p>
            <p className="text-slate-400 mt-2">Preparing AI-powered inspection</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
