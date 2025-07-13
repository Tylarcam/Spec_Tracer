
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Chrome, Code, Zap, Target, Monitor, Sparkles, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if Chrome extension is already installed
  const isExtensionInstalled = () => {
    // This would need to be implemented based on your extension's communication
    // For now, we'll assume it's not installed
    return false;
  };

  const handleGetStarted = () => {
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
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-3 sm:p-4 rounded-2xl">
              <Target className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            LogTrace
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed px-4 sm:px-0">
            The AI-powered Chrome extension that transforms web debugging. 
            {isMobile ? 'Tap' : 'Hover'}, click, and get instant AI insights on any element.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 sm:mb-12 px-4 sm:px-0">
            <Button
              onClick={handleGetStarted}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg h-auto"
            >
              <Chrome className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {isMobile ? 'Get Extension' : 'Install Chrome Extension'}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
            </Button>
            
            <Link to="/debug">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg h-auto"
              >
                {isMobile ? 'Try Demo' : 'Try Web Demo'}
              </Button>
            </Link>
          </div>
          
          <div className="text-sm text-slate-400">
            Free to install • 3 AI debugs included • No signup required
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why LogTrace?</h2>
          <p className="text-lg sm:text-xl text-slate-300">
            Debug smarter, not harder with AI-powered insights
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <div className="bg-slate-800/50 p-6 sm:p-8 rounded-xl border border-slate-700">
            <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Instant AI Analysis</h3>
            <p className="text-slate-300 text-sm sm:text-base">
              Get immediate insights on any element with GPT-4o Mini. 
              No more guessing what's wrong.
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-6 sm:p-8 rounded-xl border border-slate-700">
            <div className="bg-cyan-500/20 p-3 rounded-lg w-fit mb-4">
              <Code className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Real-time Inspection</h3>
            <p className="text-slate-300 text-sm sm:text-base">
              {isMobile ? 'Tap' : 'Hover over'} any element to see live CSS properties, 
              dimensions, and computed styles instantly.
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-6 sm:p-8 rounded-xl border border-slate-700 sm:col-span-2 lg:col-span-1">
            <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
              <Monitor className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Debug Terminal</h3>
            <p className="text-slate-300 text-sm sm:text-base">
              Track your debugging session with a built-in terminal 
              that logs all interactions and AI responses.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg sm:text-xl text-slate-300">
            Three simple steps to smarter debugging
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <div className="bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">Install & Activate</h3>
              <p className="text-slate-300 text-base sm:text-lg">
                Install the Chrome extension and press 'S' on any webpage to start tracing.
                {isMobile && ' Or use the web demo on mobile devices.'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">
                {isMobile ? 'Tap & Hold' : 'Hover & Click'}
              </h3>
              <p className="text-slate-300 text-base sm:text-lg">
                {isMobile 
                  ? 'Tap elements to inspect them in real-time, then hold for detailed analysis.'
                  : 'Move your mouse to inspect elements in real-time, then click for detailed analysis.'
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">Get AI Insights</h3>
              <p className="text-slate-300 text-base sm:text-lg">
                Receive instant AI-powered debugging suggestions and solutions
                optimized for your device.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-specific section */}
      {isMobile && (
        <div className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-2xl p-6 text-center">
            <Smartphone className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Mobile-Optimized</h3>
            <p className="text-slate-300 mb-4">
              LogTrace works seamlessly on mobile devices with touch-friendly controls 
              and responsive design.
            </p>
            <Link to="/debug">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Try Mobile Demo
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30 rounded-2xl p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-6">
            <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-green-400" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Debug Smarter?
          </h2>
          
          <p className="text-lg sm:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already debugging faster 
            with AI-powered insights.
          </p>
          
          <Button
            onClick={handleGetStarted}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg h-auto"
          >
            <Chrome className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Get LogTrace for Chrome
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
          </Button>
          
          <div className="text-sm text-slate-400 mt-4">
            Free forever • No account required • Works on any website
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
