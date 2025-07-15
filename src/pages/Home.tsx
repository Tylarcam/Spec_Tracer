
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-3 rounded-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold">LogTrace</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              LogTrace
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            The future of AI-powered debugging. Stop writing essays to ChatGPT and start getting pixel-perfect solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/interactive-demo">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 text-lg h-auto w-full sm:w-auto"
              >
                Try Interactive Demo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            
            <Link to="/debug">
              <Button
                size="lg"
                variant="outline"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 text-lg h-auto w-full sm:w-auto"
              >
                Debug Tool
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
