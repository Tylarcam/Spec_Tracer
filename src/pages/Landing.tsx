import React, { useState, useEffect, useRef } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-4xl mx-auto text-center">
          
          {/* Logo and title */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-3 rounded-2xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                LogTrace
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Debug any website with AI-powered inspection
            </p>
            
            <p className="text-lg text-slate-400 mb-16 max-w-xl mx-auto">
              Enter any URL below to start debugging with LogTrace
            </p>
          </div>

          {/* Main input section */}
          <div className="mb-12">
            <div className="relative max-w-3xl mx-auto mb-8">
              <div className="relative flex items-center bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-2 shadow-2xl hover:border-slate-500/50 transition-all duration-300 focus-within:border-cyan-400/50 focus-within:shadow-cyan-400/20 focus-within:shadow-lg">
                <div className="flex items-center pl-4 pr-3">
                  <Globe className="h-6 w-6 text-slate-400" />
                </div>
                
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="github.com, reddit.com, your-website.com..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent text-white placeholder-slate-400 text-lg py-4 px-2 focus:outline-none min-w-0"
                />
                
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Popular examples */}
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-4">Popular examples:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {popularExamples.map((example) => (
                  <button
                    key={example}
                    onClick={() => handleExampleClick(example)}
                    className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 hover:border-slate-500/50 rounded-xl text-slate-300 hover:text-white transition-all duration-200 text-sm font-medium"
                  >
                    {example}
                  </button>
                ))}
              </div>
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
      </div>
    </div>
  );
};

export default Landing;