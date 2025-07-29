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

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Early Access Demo</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Stop AI from Changing Things You Didn't Ask For
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Give AI the exact context it needs. No more unwanted changes, no more back-and-forth.
              <span className="text-green-400 font-semibold"> Save time and frustration.</span>
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
              <span className="text-green-400">🎯</span>
              <span className="text-green-400 font-medium">Focused Context Only</span>
            </div>
            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1">
              <span className="text-cyan-400">⚡</span>
              <span className="text-cyan-400 font-medium">No Unwanted Changes</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-1">
              <span className="text-blue-400">🔒</span>
              <span className="text-blue-400 font-medium">Private by Design</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section with Video */}
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
              See How It Solves the AI Agent Problem
            </h2>
            
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Hover any element, get focused context. No more AI changing 10 things when you asked for 1.
              <span className="text-green-400 font-semibold"> Everything stays on your machine.</span>
            </p>
            
            {/* Concrete Example */}
            <div className="bg-slate-800/30 border border-slate-600 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Here's What AI Sees When You Click an Element:</h3>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm">
                <div className="text-cyan-400">// Before SpecTracer (you write this manually):</div>
                <div className="text-slate-400 mb-4">"There's a button on the signup page that says 'Join Beta' and it's not working when I click it"</div>
                
                <div className="text-green-400">// With SpecTracer (automatic):</div>
                <div className="text-white">
                  <div>SignUpButton {'{'}</div>
                  <div className="ml-4">label: 'Join Beta',</div>
                  <div className="ml-4">page: 'Landing {'>'} Hero',</div>
                  <div className="ml-4">status: 'active',</div>
                  <div className="ml-4">position: {'{x: 245, y: 180}'},</div>
                  <div className="ml-4">classes: ['btn', 'btn-primary']</div>
                  <div>{'}'}</div>
                </div>
              </div>
              <p className="text-slate-300 text-sm mt-4">
                <span className="text-green-400 font-semibold">Result:</span> AI fixes exactly what you asked for, not 10 other things.
              </p>
            </div>
            
            {/* Demo Video */}
            <div className="mb-8">
              <div className="relative w-full max-w-4xl mx-auto">
                <video 
                  className="w-full rounded-lg shadow-lg"
                  controls
                  preload="metadata"
                  muted
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement;
                    video.playbackRate = 1.5;
                    video.muted = true;
                  }}
                >
                  <source src="/videos/Demo_2025_Video.mp4" type="video/mp4" />
                  <p className="text-slate-400 text-center p-8">
                    Your browser doesn't support video playback. 
                    <a href="/videos/Demo_2025_Video.mp4" className="text-cyan-400 hover:underline ml-1">
                      Download the video
                    </a>
                  </p>
                </video>
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

      {/* What You Get With Pro Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500/5 to-red-500/5">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full">
                <Crown className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/50 rounded-full px-4 py-2 mb-6">
              <span className="text-orange-400 text-sm font-bold">🔥 LAUNCH WEEK ONLY - FIRST 50 USERS</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Get the AI Agent Fix You've Been Waiting For
            </h2>
            
            <p className="text-xl text-slate-300 mb-6 max-w-2xl mx-auto">
              One-time payment. Lifetime access. Stop wasting time on AI back-and-forth forever.
            </p>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-lg font-semibold text-orange-400 mb-2">What You Get</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-400" />
                      Direct download (zip file)
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
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Lifetime Benefits</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Instant Chrome extension download</li>
                    <li>• Installation instructions</li>
                    <li>• Priority email support</li>
                    <li>• Feature request influence</li>
                    <li>• Founding user badge</li>
                    <li>• All future updates included</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">$14.99</div>
                <div className="text-slate-400 text-sm">One-time payment • Save $120+ annually vs. other AI tools</div>
              </div>
              
              <PaymentButton 
                email={email}
                price={1499}
                productName="SpecTracer - Dev Tool Extension"
                description="Direct extension download with lifetime access and priority support"
                disabled={!email.trim()}
              />
            </div>
            
            <div className="text-sm text-slate-400 text-center">
              <span className="text-orange-400 font-medium">⚡ Instant access</span>
              <span className="mx-2">•</span>
              <span>👨‍💻 Built for devs. Backed by humans.</span>
              <span className="mx-2">•</span>
              <span>🚀 Try it free. Upgrade anytime.</span>
            </div>
            
            {/* Support Reassurance */}
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-green-400 font-medium">
                <span>🛡️</span>
                <span>Ongoing support + upgrades included — you're not on your own.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support + Delivery Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30 rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-4 rounded-full">
                <Users className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Support & Delivery
            </h2>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Get immediate access to the extension with priority support. Direct download, no waiting.
            </p>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Instant Delivery</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-400" />
                      Immediate download link
                    </li>
                    <li className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-green-400" />
                      Step-by-step installation guide
                    </li>
                    <li className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-green-400" />
                      Priority email support
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">🛡️</span>
                      Built for devs. Backed by humans.
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2">Support Included</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Direct email support</li>
                    <li>• Installation troubleshooting</li>
                    <li>• Feature requests</li>
                    <li>• Bug reporting priority</li>
                    <li>• Usage guidance</li>
                    <li>• Community access</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="you@devmail.com"
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
                  {isJoiningWaitlist ? 'Processing...' : 'Get Lifetime Access'}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-slate-400 mt-6 text-center">
              <span className="text-green-400 font-medium">🎯 Free demo available now</span>
              <span className="mx-2">•</span>
              <span>⚡ No more AI back-and-forth</span>
              <span className="mx-2">•</span>
              <span>🔒 Private by design</span>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy FAQ Section */}
      <PrivacyFAQ />

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-slate-700 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">SpecTracer</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                The AI agent fix that gives you focused context without unwanted changes. Built for developers who value precision.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Focused Context Only
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  No Unwanted Changes
                </div>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wide">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/debug" className="text-slate-400 hover:text-white text-sm transition-colors">
                    Interactive Demo
                  </Link>
                </li>
                <li>
                  <Link to="/debug?onboarding=true" className="text-slate-400 hover:text-white text-sm transition-colors">
                    Try Demo
                  </Link>
                </li>
                <li>
                  <a href="#features" className="text-slate-400 hover:text-white text-sm transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-slate-400 hover:text-white text-sm transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wide">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:tylar@nobrainerco.com" className="text-slate-400 hover:text-white text-sm transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <Link to="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-slate-400 hover:text-white text-sm transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="text-slate-400 hover:text-white text-sm transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wide">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:tylar@nobrainerco.com" className="text-slate-400 hover:text-white text-sm transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <span className="text-slate-400 text-sm">Built by Nobrainerco</span>
                </li>
                <li>
                  <span className="text-slate-400 text-sm">© 2025 All rights reserved</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span>Focused AI Context</span>
                <span>•</span>
                <span>No Unwanted Changes</span>
                <span>•</span>
                <span>Private by Design</span>
              </div>
              
              <div className="flex items-center gap-4">
                <a 
                  href="mailto:tylar@nobrainerco.com" 
                  className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Get Support
                </a>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-slate-400 text-xs">Lifetime updates included</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PreLaunchLanding; 