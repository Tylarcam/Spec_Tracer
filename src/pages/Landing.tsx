import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Zap, Target, Sparkles, Play, Eye, Mail, Users, Download, Chrome, Shield, MousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleJoinWaitlist = async () => {
    if (!email.trim()) return;
    setIsJoiningWaitlist(true);
    try {
      // Check for duplicate
      const { data: existing, error: fetchError } = await supabase
        .from('waitlist')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (existing) {
        toast({
          title: 'Already Signed Up',
          description: 'This email is already on the waitlist.',
          variant: 'default',
        });
        setIsJoiningWaitlist(false);
        return;
      }
      // Insert new
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email: email.trim().toLowerCase() }]);
      if (error) throw error;
      toast({
        title: 'Success!',
        description: 'You have joined the waitlist. Check your email for confirmation.',
        variant: 'default',
      });
      setEmail('');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Could not join waitlist. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsJoiningWaitlist(false);
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
          
          <div className="flex items-center gap-3">
            <Link to="/interactive-demo">
              <Button
                variant="outline"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-4 py-2"
              >
                <Play className="h-4 w-4 mr-2" />
                Try Web Demo
              </Button>
            </Link>
            <Button
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2"
              disabled
            >
              <Chrome className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Chrome Extension Focus */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          {/* Extension Coming Soon Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-6">
              <Chrome className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Chrome Extension Coming Soon</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Debug Any Website with AI
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The Chrome extension that captures pixel-perfect UI context for AI debugging. 
              <span className="text-green-400 font-semibold"> Hover, click, get instant AI insights.</span>
            </p>
          </div>

          {/* Primary CTA: Extension Waitlist + Demo */}
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email for early access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-4 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-green-400 flex-1 min-w-[280px]"
                />
                <Button
                  onClick={handleJoinWaitlist}
                  disabled={!email.trim() || isJoiningWaitlist}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-4 text-lg h-auto whitespace-nowrap"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {isJoiningWaitlist ? 'Joining...' : 'Get Early Access'}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/interactive-demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 text-lg h-auto w-full sm:w-auto"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Try Web Preview
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Benefits Row */}
          <div className="text-sm text-slate-400 mb-6 text-center">
            <span className="text-green-400 font-medium">🎯 Early access to Chrome extension</span>
            <span className="mx-2">•</span>
            <span>No spam, unsubscribe anytime</span>
            <span className="mx-2">•</span>
            <span>Works on any website</span>
          </div>
        </div>
      </section>

      {/* Why Chrome Extension Section */}
      <section className="py-16 px-4 bg-slate-800/20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why a Chrome Extension?</h2>
            <p className="text-xl text-slate-300">
              Direct access to any website without iframe limitations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 text-center">
              <div className="bg-green-500/20 p-4 rounded-lg w-fit mx-auto mb-6">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">No Website Restrictions</h3>
              <p className="text-slate-300">
                Work with any website including those that block embedding. 
                Full access to protected sites and web apps.
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 text-center">
              <div className="bg-cyan-500/20 p-4 rounded-lg w-fit mx-auto mb-6">
                <MousePointer className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Native Performance</h3>
              <p className="text-slate-300">
                Direct DOM access means perfect element highlighting, 
                accurate positioning, and zero cross-origin issues.
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 text-center">
              <div className="bg-purple-500/20 p-4 rounded-lg w-fit mx-auto mb-6">
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Always Available</h3>
              <p className="text-slate-300">
                One-click activation on any tab. Debug production sites, 
                private dashboards, and local development environments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Web Demo Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Eye className="h-5 w-5 text-cyan-400" />
              <span className="text-cyan-400 font-medium">Preview the Experience</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              Try LogTrace in Your Browser
            </h2>
            
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              While you wait for the Chrome extension, experience LogTrace's core functionality 
              with our web demo. Limited to iframe-compatible sites, but showcases the full AI debugging power.
            </p>
            
            <Link to="/interactive-demo">
              <Button
                size="lg"
                variant="outline"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4"
              >
                Launch Web Demo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            
            <p className="text-xs text-slate-500 mt-4">
              Web demo works best with embedding-friendly sites. 
              Full functionality coming with the Chrome extension.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Extension Focus */}
      <section className="py-16 px-4 bg-slate-800/20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How LogTrace Extension Works</h2>
          </div>
          
          <div className="space-y-12">
            <div className="flex items-start gap-8">
              <div className="bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Install & Activate</h3>
                <p className="text-slate-300 text-lg">
                  One-click install from Chrome Web Store. Activate LogTrace on any website 
                  with a simple keyboard shortcut or toolbar click.
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
                  detailed AI analysis. Works on any website without restrictions.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Get AI Solutions</h3>
                <p className="text-slate-300 text-lg">
                  Copy the generated context to ChatGPT, Claude, or any AI assistant 
                  for pixel-perfect debugging solutions. Or use built-in AI features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Extension Focus */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30 rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <Chrome className="h-16 w-16 text-green-400" />
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Ready for the Ultimate Debugging Experience?
            </h2>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join the waitlist for early access to the LogTrace Chrome Extension. 
              Debug any website without limitations.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-4 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-green-400 flex-1 min-w-0"
                />
                <Button
                  onClick={handleJoinWaitlist}
                  disabled={!email.trim() || isJoiningWaitlist}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-4 text-lg h-auto whitespace-nowrap"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Join Waitlist
                </Button>
              </div>
              
              <Link to="/interactive-demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 text-lg h-auto w-full sm:w-auto"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Try Web Preview
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="text-sm text-slate-400 text-center">
              <span className="text-green-400 font-medium">🎯 Early access to Chrome extension</span>
              <span className="mx-2">•</span>
              <span>No spam, unsubscribe anytime</span>
              <span className="mx-2">•</span>
              <span>Web preview available now</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
