import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Sparkles, Play, Users, Mail, Zap, Crown, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { enhancedValidation } from '@/utils/enhancedSanitization';
import PrivacyFAQ from '@/components/PrivacyFAQ';
import PaymentButton from '@/components/PaymentButton';

const PreLaunchLanding = () => {
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

  const handleJoinWaitlist = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!enhancedValidation.validateEmail(trimmedEmail)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsJoiningWaitlist(true);
    
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('waitlist')
        .select('id, email')
        .eq('email', trimmedEmail)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (existing) {
        toast({
          title: 'Already Signed Up',
          description: 'This email is already on the waitlist.',
          variant: 'default',
        });
        return;
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('waitlist')
        .insert([{ email: trimmedEmail }])
        .select();
      
      if (insertError) throw insertError;
      
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleEmailKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJoinWaitlist();
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
            <span className="text-xl font-bold">SpecTracer</span>
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

      {/* Hero Section - Simplified */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Privacy-First Beta Access</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Stop Writing Essays to ChatGPT
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Capture UI context instantly. Copy to AI. Fix your bugs fast.
              <span className="text-green-400 font-semibold"> Zero data collection, client-side only.</span>
            </p>
          </div>

          {/* Primary CTA */}
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
          </div>
          
          {/* Privacy Badge */}
          <div className="flex items-center justify-center gap-4 mb-6 text-sm text-slate-400">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
              <span className="text-green-400">🛡️</span>
              <span className="text-green-400 font-medium">Zero Data Collection</span>
            </div>
            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1">
              <span className="text-cyan-400">⚡</span>
              <span className="text-cyan-400 font-medium">Client-Side Only</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-1">
              <span className="text-blue-400">🔒</span>
              <span className="text-blue-400 font-medium">Privacy-First</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo → Waitlist Flow Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-slate-800/50 border border-green-500/20 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Play className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-medium">See It In Action</span>
            </div>
            
            {/* Privacy Notice */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
                <span className="text-green-400 text-sm font-medium">🛡️ Privacy-First Demo</span>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              Watch How It Works
            </h2>
            
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Hover, click, copy context. That's it. No more writing long descriptions to ChatGPT.
              <span className="text-green-400 font-semibold"> All processing happens locally in your browser.</span>
            </p>
            
            {/* Placeholder for Demo Video/GIF */}
            <div className="bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg p-12 mb-8">
              <div className="text-center">
                <Play className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 text-lg font-medium">Demo Video Placeholder</p>
                <p className="text-slate-500 text-sm">Animated GIF or Loom demo showing hover → click → copy flow</p>
              </div>
            </div>
            
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

      {/* Benefits + Proof Section */}
      <section className="py-16 px-4 bg-slate-800/20">
        <div className="container mx-auto max-w-4xl">
                      <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Why Developers Love SpecTracer</h2>
              <p className="text-xl text-slate-300 mb-6">
                Privacy-first debugging that works entirely in your browser
              </p>
            </div>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Capture Context</h3>
                <p className="text-slate-300 text-lg">
                  Hover over any element to instantly capture its complete technical context - styles, events, computed properties.
                  <span className="text-green-400 font-semibold"> All processed locally, no data sent anywhere.</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Get AI Debugging Help</h3>
                <p className="text-slate-300 text-lg">
                  Copy the optimized context to ChatGPT, Claude, or any AI assistant for pixel-perfect debugging solutions.
                  <span className="text-cyan-400 font-semibold"> You control what gets shared with AI.</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Save Time</h3>
                <p className="text-slate-300 text-lg">
                  Skip the essay writing. Get from bug to fix in seconds, not minutes.
                  <span className="text-blue-400 font-semibold"> Immediate cleanup when debugging ends.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial Placeholder */}
          <div className="mt-16 bg-slate-800/50 border border-slate-700 rounded-xl p-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-500/20 p-3 rounded-full">
                  <Users className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <blockquote className="text-lg text-slate-300 mb-4 italic">
                "SpecTracer saved me hours of debugging. Instead of writing paragraphs to ChatGPT, I just hover and click. The context it captures is perfect."
              </blockquote>
              <p className="text-slate-400 text-sm">
                — Early Access User (placeholder for real testimonial)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founding User Access Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500/5 to-red-500/5">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full">
                <Crown className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/50 rounded-full px-4 py-2 mb-6">
              <span className="text-orange-400 text-sm font-bold">🔥 LIMITED TIME - FIRST 50 USERS</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Founding User Access
            </h2>
            
            <p className="text-xl text-slate-300 mb-6 max-w-2xl mx-auto">
              Get immediate access to the Chrome extension with priority support. Direct download, no waiting.
            </p>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-lg font-semibold text-orange-400 mb-2">Founding User Benefits</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-400" />
                      Instant Chrome extension download
                    </li>
                    <li className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-orange-400" />
                      Priority support & bug fixes
                    </li>
                    <li className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-orange-400" />
                      Direct line to development team
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-orange-400">🎯</span>
                      Shape the product roadmap
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-2">What You Get</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Complete Chrome extension (.crx file)</li>
                    <li>• Installation instructions</li>
                    <li>• Priority email support</li>
                    <li>• Feature request influence</li>
                    <li>• Founding user badge</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">$14.99</div>
                <div className="text-slate-400 text-sm">One-time payment • First 50 users only</div>
              </div>
              
              <PaymentButton 
                email={email}
                price={1499}
                productName="SpecTracer - Founding User Access"
                description="Direct Chrome extension download with priority support for first 50 users"
                disabled={!email.trim()}
              />
            </div>
            
            <div className="text-sm text-slate-400 text-center">
              <span className="text-orange-400 font-medium">⚡ Instant access</span>
              <span className="mx-2">•</span>
              <span>🛡️ Privacy-first guarantee</span>
              <span className="mx-2">•</span>
              <span>💰 30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Access CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30 rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-4 rounded-full">
                <Crown className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Join the Privacy-First Beta
            </h2>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Get early access to SpecTracer and help shape the future of privacy-first AI-powered debugging.
            </p>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Beta Benefits</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-400" />
                      Early access to Chrome extension
                    </li>
                    <li className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-green-400" />
                      Direct feedback to the team
                    </li>
                    <li className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-green-400" />
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">🛡️</span>
                      Privacy-first guarantee
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2">What's Coming</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Direct Chrome extension download</li>
                    <li>• Advanced debugging tools</li>
                    <li>• Team collaboration features</li>
                    <li>• AI-powered suggestions</li>
                    <li>• Enhanced privacy controls</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyPress={handleEmailKeyPress}
                  className="px-4 py-4 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 flex-1 min-w-0"
                  disabled={isJoiningWaitlist}
                />
                <Button
                  onClick={handleJoinWaitlist}
                  disabled={!email.trim() || isJoiningWaitlist}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-4 text-lg h-auto whitespace-nowrap disabled:opacity-50"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  {isJoiningWaitlist ? 'Joining...' : 'Join Beta'}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-slate-400 mt-6 text-center">
              <span className="text-green-400 font-medium">🎯 Early access to Chrome extension</span>
              <span className="mx-2">•</span>
              <span>🛡️ Zero data collection</span>
              <span className="mx-2">•</span>
              <span>Demo available now</span>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy FAQ Section */}
      <PrivacyFAQ />

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <Sparkles className="h-16 w-16 text-green-400" />
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Ready to Try SpecTracer?
            </h2>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Experience the future of privacy-first AI-powered debugging. Try the demo and join the beta to get early access.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                onClick={handleTryDemo}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 text-lg h-auto w-full sm:w-auto"
              >
                <Play className="h-5 w-5 mr-2" />
                Try Demo First
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyPress={handleEmailKeyPress}
                  className="px-4 py-4 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 flex-1 min-w-0"
                  disabled={isJoiningWaitlist}
                />
                <Button
                  onClick={handleJoinWaitlist}
                  disabled={!email.trim() || isJoiningWaitlist}
                  variant="outline"
                  size="lg"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-6 py-4 text-lg h-auto whitespace-nowrap disabled:opacity-50"
                >
                  <Users className="h-5 w-5 mr-2" />
                  {isJoiningWaitlist ? 'Joining...' : 'Join Beta'}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-slate-400 mt-6 text-center">
              <span className="text-green-400 font-medium">✨ Beta access available</span>
              <span className="mx-2">•</span>
              <span>🛡️ Privacy-first guarantee</span>
              <span className="mx-2">•</span>
              <span>Priority support included</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PreLaunchLanding; 