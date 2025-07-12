
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Target, MousePointer, Zap, Shield, Code, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/debug');
    } else {
      navigate('/auth');
    }
  };

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-green-400">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-green-400" />
            <h1 className="text-2xl font-bold">LogTrace</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-slate-300">
                Welcome, {user.email}
              </span>
            )}
            <Button
              variant="outline"
              onClick={handleAuthAction}
              className="border-green-400 text-green-400 hover:bg-green-400 hover:text-slate-900"
            >
              {user ? 'Sign Out' : 'Sign In'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Stop Describing Bugs. Start Showing Them.
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
            LogTracer captures pixel-perfect UI context so you get precise, actionable fixes—no more writing essays or pasting screenshots. Instantly show what’s broken, not just what you think is broken.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
            >
              Start Debugging
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/debug')}
              className="border-green-400 text-green-400 hover:bg-green-400 hover:text-slate-900 px-8 py-4 text-lg"
            >
              <Terminal className="mr-2 h-5 w-5" />
              Try Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Hero Feature - LogTrace Halo */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-green-400/30 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-green-400/20 rounded-full flex items-center justify-center">
                    <MousePointer className="h-10 w-10 text-green-400" />
                  </div>
                  <div className="absolute -inset-4 bg-green-400/10 rounded-full animate-pulse"></div>
                  <div className="absolute -inset-8 bg-green-400/5 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl text-green-400 mb-4">
                The Context Engine for Modern Developers
              </CardTitle>
              <CardDescription className="text-xl text-slate-300 max-w-3xl mx-auto">
                LogTrace bridges the gap between your workflow and the tools that help you build, debug, and learn faster. One-click context capture for agentic developers and learning builders.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Precision Tracking</h3>
                    <p className="text-slate-300">Track every mouse movement with pixel-perfect accuracy and see element boundaries in real-time.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Code className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Element Intelligence</h3>
                    <p className="text-slate-300">Instantly see element properties, CSS classes, and DOM structure without opening DevTools.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2">AI-Powered Analysis</h3>
                    <p className="text-slate-300">Get intelligent suggestions and debugging insights powered by advanced AI analysis.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Privacy First</h3>
                    <p className="text-slate-300">All tracking stays local to your session. No data leaves your browser without permission.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-green-400 mb-12">
            How Context Engineering Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-green-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-green-400">Activate</h3>
              <p className="text-slate-300">Press 'S' to start LogTrace and watch the halo appear around your cursor.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-green-400">Explore</h3>
              <p className="text-slate-300">Move your mouse to inspect elements. Click to pin details and press 'D' to debug.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-green-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-green-400">Debug</h3>
              <p className="text-slate-300">Access the terminal with 'T' to see your complete interaction history and analysis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-green-400 mb-6">
            Ready to Transform Your Debugging?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join developers who've already discovered the power of visual debugging with LogTrace.
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-xl"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-6 text-center text-slate-400">
          <p>&copy; 2024 LogTrace. Built for developers, by developers.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
