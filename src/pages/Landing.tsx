
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Chrome, Code, Zap, Target, Sparkles, Play, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if Chrome extension is already installed
  const isExtensionInstalled = () => {
    // This would need to be implemented based on your extension's communication
    // For now, we'll assume it's not installed
    return false;
  };

  const handleGetExtension = () => {
    if (isExtensionInstalled()) {
      // Extension is installed, go to demo
      window.location.href = '/debug';
    } else {
      // Extension not installed, go to Chrome Web Store
      // Replace with your actual Chrome Web Store URL
      window.open('https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID', '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-900/95 backdrop-blur-sm border-b border-green-500/30' : ''
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-2 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">LogTrace</span>
          </div>
          
          <Button
            onClick={handleGetExtension}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2"
          >
            <Chrome className="h-4 w-4 mr-2" />
            Get Extension
          </Button>
        </div>
      </header>

      {/* Hero Section - Above the fold */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          {/* 5-second value prop */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-6">
              <Chrome className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Chrome Extension</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Stop Writing Essays to ChatGPT
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              LogTrace captures pixel-perfect UI context so AI tools give you pixel-perfect fixes. 
              <span className="text-green-400 font-semibold"> Hover, click, get instant AI insights.</span>
            </p>
          </div>

          {/* Two CTAs: Primary + Secondary */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button
              onClick={handleGetExtension}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 text-lg h-auto"
            >
              <Chrome className="h-5 w-5 mr-2" />
              Install Chrome Extension
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <Link to="/debug">
              <Button
                variant="outline"
                size="lg"
                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-4 text-lg h-auto w-full sm:w-auto"
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </Link>
          </div>
          
          <div className="text-sm text-slate-400 flex items-center justify-center gap-4">
            <span>✓ Free to install</span>
            <span>✓ Works on any website</span>
            <span>✓ 3 AI debugs included</span>
          </div>
        </div>
      </section>

      {/* Interactive Demo Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-slate-800/50 border border-green-500/20 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Eye className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-medium">See It In Action</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              From Bug Description to AI Solution in Seconds
            </h2>
            
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Instead of writing long descriptions of what's broken, LogTrace captures the exact context 
              your AI assistant needs to provide perfect solutions.
            </p>
            
            <Link to="/debug">
              <Button
                size="lg"
                variant="outline"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4"
              >
                Try Interactive Demo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Developers Love LogTrace</h2>
            <p className="text-xl text-slate-300">
              The missing link between you and AI-powered debugging
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 text-center">
              <div className="bg-green-500/20 p-4 rounded-lg w-fit mx-auto mb-6">
                <Zap className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Context Engineering</h3>
              <p className="text-slate-300">
                Stop describing bugs. Start showing them. One-click context capture 
                that AI understands perfectly.
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 text-center">
              <div className="bg-cyan-500/20 p-4 rounded-lg w-fit mx-auto mb-6">
                <Code className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Works Everywhere</h3>
              <p className="text-slate-300">
                Install once, debug everywhere. Works on any website, 
                integrates with your existing AI workflow.
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 text-center">
              <div className="bg-purple-500/20 p-4 rounded-lg w-fit mx-auto mb-6">
                <Target className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Instant Insights</h3>
              <p className="text-slate-300">
                Get immediate AI-powered debugging suggestions. 
                No more guessing what's wrong.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-slate-800/20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Three Steps to Smarter Debugging</h2>
          </div>
          
          <div className="space-y-12">
            <div className="flex items-start gap-8">
              <div className="bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Install & Activate</h3>
                <p className="text-slate-300 text-lg">
                  Add LogTrace to Chrome and press 'S' on any webpage to start debugging. 
                  It's that simple.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-8">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Hover & Click</h3>
                <p className="text-slate-300 text-lg">
                  Hover over any element to inspect it in real-time, then click for 
                  detailed AI analysis and debugging suggestions.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Get Perfect Context</h3>
                <p className="text-slate-300 text-lg">
                  Copy the generated context to ChatGPT, Claude, or any AI assistant 
                  for pixel-perfect debugging solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30 rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <Sparkles className="h-16 w-16 text-green-400" />
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Ready to Debug Smarter?
            </h2>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who stopped writing essays to AI 
              and started showing their bugs instead.
            </p>
            
            <Button
              onClick={handleGetExtension}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 text-lg h-auto"
            >
              <Chrome className="h-5 w-5 mr-2" />
              Install LogTrace for Chrome
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <div className="text-sm text-slate-400 mt-6">
              Free forever • Works on any website • No account required
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
