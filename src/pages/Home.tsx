
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo and main heading */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-3 rounded-2xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                LogTrace
              </h1>
            </div>
            
            <p className="text-2xl md:text-3xl text-slate-300 mb-8 max-w-3xl mx-auto">
              AI-Powered Website Debugging & Inspection
            </p>
            
            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
              Debug any website with intelligent AI analysis, real-time inspection tools, and comprehensive debugging capabilities.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-16">
            <Button
              onClick={() => navigate('/interactive-demo')}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold px-8 py-6 text-xl rounded-xl transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              Try Interactive Demo
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Features preview */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-green-400 mb-3">AI Analysis</h3>
              <p className="text-slate-300">Intelligent debugging with AI-powered insights and recommendations</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">Real-time Inspection</h3>
              <p className="text-slate-300">Live website analysis with interactive debugging tools</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Comprehensive Reports</h3>
              <p className="text-slate-300">Detailed analysis reports with actionable debugging steps</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
