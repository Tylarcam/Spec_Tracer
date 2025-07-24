
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Code, Zap, Target, Sparkles, Play, Eye, Mail, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PricingSection from '@/components/PricingSection';

const Landing = () => {
  const navigate = useNavigate();
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

  const handleTryDemo = () => {
    navigate('/debug?onboarding=true');
  };

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Error",
        description: "Unable to start upgrade process. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinWaitlist = async () => {
    if (!email.trim()) return;
    setIsJoiningWaitlist(true);
    try {
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
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email: email.trim().toLowerCase() }]);
      if (error) throw error;
      toast({
        title: 'Success!',
        description: 'You have joined the waitlist. Check your email for confirmation.',
        variant: 'success',
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
          
          <Button
            onClick={handleTryDemo}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2"
          >
            <Play className="h-4 w-4 mr-2" />
            Try Demo
          </Button>
        </div>
      </header>

      {/* Hero Section - Above the fold */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          {/* 5-second value prop */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">Early Access Demo</span>
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
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button
              onClick={handleTryDemo}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 text-lg h-auto w-full sm:w-auto"
            >
              <Play className="h-5 w-5 mr-2" />
              Try Interactive Demo
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-4 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 flex-1 min-w-0"
              />
              <Button
                onClick={handleJoinWaitlist}
                disabled={!email.trim() || isJoiningWaitlist}
                variant="outline"
                size="lg"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-6 py-4 text-lg h-auto whitespace-nowrap"
              >
                <Users className="h-5 w-5 mr-2" />
                {isJoiningWaitlist ? 'Joining...' : 'Join Waitlist'}
              </Button>
            </div>
          </div>
          {/* Privacy Assurance & Benefits */}
          <div className="text-sm text-slate-400 mb-6 text-center">
            <span className="text-cyan-400 font-medium">🎯 Early access to Chrome extension</span>
            <span className="mx-2">•</span>
            <span>No spam, unsubscribe anytime</span>
          </div>
          <div className="text-sm text-slate-400 flex items-center justify-center gap-4">
            <span>✓ Free demo available now</span>
            <span>✓ Chrome extension coming soon</span>
            <span>✓ 5 AI debugs included</span>
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
            
            <Button
              onClick={handleTryDemo}
              size="lg"
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4"
            >
              Try Interactive Demo
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
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
                Try the demo now, Chrome extension launching soon. Works on any website, 
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
                <h3 className="text-2xl font-semibold mb-3">Try the Demo</h3>
                <p className="text-slate-300 text-lg">
                  Experience LogTrace in our interactive demo. Press 'S' to start debugging 
                  any element on the demo page.
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

      {/* Pricing Section */}
      <PricingSection onUpgrade={handleUpgrade} />

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30 rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <Sparkles className="h-16 w-16 text-green-400" />
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Ready to Experience the Future of Debugging?
            </h2>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Try our interactive demo now and join the waitlist for early access 
              to the Chrome extension.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                onClick={handleTryDemo}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 text-lg h-auto w-full sm:w-auto"
              >
                <Play className="h-5 w-5 mr-2" />
                Try Interactive Demo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-4 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 flex-1 min-w-0"
                />
                <Button
                  onClick={handleJoinWaitlist}
                  disabled={!email.trim() || isJoiningWaitlist}
                  variant="outline"
                  size="lg"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-6 py-4 text-lg h-auto whitespace-nowrap"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Join Waitlist
                </Button>
              </div>
            </div>
            {/* Privacy Assurance & Benefits */}
            <div className="text-sm text-slate-400 mt-6 text-center">
              <span className="text-cyan-400 font-medium">🎯 Early access to Chrome extension</span>
              <span className="mx-2">•</span>
              <span>No spam, unsubscribe anytime</span>
            </div>
            <div className="text-sm text-slate-400 mt-2">Demo available now • Chrome extension coming soon • Early access signup</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
