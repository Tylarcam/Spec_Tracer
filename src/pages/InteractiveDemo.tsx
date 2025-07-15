
import React from 'react';
import IframeDemoBar from '@/components/IframeDemoBar';
import { ArrowRight, Target, Zap, Code, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const InteractiveDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <IframeDemoBar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-3 rounded-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold">LogTrace Interactive Demo</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Debug Any Website with{" "}
              <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AI Precision
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Enter any website URL above to start debugging with LogTrace. 
              Hover over elements, click to inspect, and get instant AI-powered insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
              <div className="bg-green-500/20 p-4 rounded-lg w-fit mx-auto mb-4">
                <Eye className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Hover & Inspect</h3>
              <p className="text-slate-300">
                Hover over any element to see real-time inspection details and styling information.
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
              <div className="bg-cyan-500/20 p-4 rounded-lg w-fit mx-auto mb-4">
                <Zap className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
              <p className="text-slate-300">
                Click elements for instant AI-powered debugging suggestions and solutions.
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
              <div className="bg-purple-500/20 p-4 rounded-lg w-fit mx-auto mb-4">
                <Code className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Perfect Context</h3>
              <p className="text-slate-300">
                Generate optimized prompts for ChatGPT, Claude, or any AI assistant.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-green-500/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">How to Use LogTrace</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-left">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">1</div>
                <h4 className="font-semibold mb-2">Enter URL</h4>
                <p className="text-slate-300 text-sm">Type any website URL in the input above and click "Analyze"</p>
              </div>
              <div className="text-left">
                <div className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">2</div>
                <h4 className="font-semibold mb-2">Start Debugging</h4>
                <p className="text-slate-300 text-sm">Press 'S' to activate LogTrace, then hover and click elements</p>
              </div>
              <div className="text-left">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">3</div>
                <h4 className="font-semibold mb-2">Get AI Insights</h4>
                <p className="text-slate-300 text-sm">Use Ctrl+D or click elements for instant AI debugging help</p>
              </div>
            </div>
            
            <Link to="/">
              <Button
                variant="outline"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
              >
                Learn More About LogTrace
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;
