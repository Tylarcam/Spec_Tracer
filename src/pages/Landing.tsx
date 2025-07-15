
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Code, Zap, Target, Sparkles, Play, Eye, Mail, Users, Download, Chrome, Shield, MousePointer, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

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
            <Link to="/debug">
              <Button
                variant="outline"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-4 py-2"
              >
                <Play className="h-4 w-4 mr-2" />
                Try Interactive Demo
              </Button>
            </Link>
            <Button
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2"
              onClick={() => document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Chrome className="h-4 w-4 mr-2" />
              Get Extension
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-6">
              <Chrome className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Chrome Extension Coming Soon</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Stop Writing Essays to{" "}
              <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                ChatGPT
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              LogTrace captures pixel-perfect UI context so AI tools know exactly what you want - 
              perfect focus, hover, click, get instant AI insights.
            </p>
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 text-lg h-auto"
                onClick={() => document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Upgrade to Pro
              </Button>
              
              <Link to="/debug">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 text-lg h-auto w-full sm:w-auto"
                >
                  Try Interactive Demo
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Fully online and optimized
              </span>
              <span>•</span>
              <span>No spam, unsubscribe anytime</span>
              <span>•</span>
              <span>It's 100% reliable</span>
            </div>
          </div>
        </div>
      </section>

      {/* From Bug Description Section */}
      <section className="py-16 px-4 bg-slate-800/20">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-slate-800/50 border-green-400/30">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-green-500/20 p-4 rounded-lg">
                  <Target className="h-12 w-12 text-green-400" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4 text-white">
                From Bug Description to AI Solution in Seconds
              </h2>
              
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Instead of writing long descriptions of bugs, context, websites or ideas, just point and click to get instant AI 
                analysis and debugging suggestions.
              </p>
              
              <Link to="/debug">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4"
                >
                  Try Interactive Demo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Developers Love LogTrace */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Developers Love LogTrace</h2>
            <p className="text-xl text-slate-300">The missing link between you and AI-powered debugging</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="bg-green-500/20 p-4 rounded-lg w-fit mx-auto mb-4">
                  <Code className="h-8 w-8 text-green-400" />
                </div>
                <CardTitle className="text-white">Context Debugging</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300 text-center">
                  Stop writing detailed issue descriptions. One click captures all technical context with visual highlighting.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="bg-cyan-500/20 p-4 rounded-lg w-fit mx-auto mb-4">
                  <Eye className="h-8 w-8 text-cyan-400" />
                </div>
                <CardTitle className="text-white">Whole Ecosystems</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300 text-center">
                  See into the styling, events and computed styles. Equivalent with optimizing at the professional level.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="bg-purple-500/20 p-4 rounded-lg w-fit mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-purple-400" />
                </div>
                <CardTitle className="text-white">ChatGPT + Claude</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300 text-center">
                  Get context optimized for ChatGPT and Claude with minimal prompting for more debugging success.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Three Steps Section */}
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
                <h3 className="text-2xl font-semibold mb-3 text-white">Try the Demo</h3>
                <p className="text-slate-300 text-lg">
                  Experience LogTrace on our interactive demo. Press "S" to start debugging any element on the 
                  demo page.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-8">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3 text-white">Hover & Click</h3>
                <p className="text-slate-300 text-lg">
                  Hover over any element to get instant details. Then click for detailed analysis and 
                  debugging suggestions.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3 text-white">Get Perfect Context</h3>
                <p className="text-slate-300 text-lg">
                  Copy the optimized context to ChatGPT, Claude, or any AI assistant for pixel-perfect debugging solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Chrome Extension Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why a Chrome Extension?</h2>
            <p className="text-xl text-slate-300">
              Direct access to any website without iframe limitations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="bg-green-500/20 p-4 rounded-lg w-fit mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-400" />
                </div>
                <CardTitle className="text-white">No Website Restrictions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300 text-center">
                  Work with any website including those that block embedding. 
                  Full access to protected sites and web apps.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="bg-cyan-500/20 p-4 rounded-lg w-fit mx-auto mb-4">
                  <MousePointer className="h-8 w-8 text-cyan-400" />
                </div>
                <CardTitle className="text-white">Native Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300 text-center">
                  Direct DOM access means perfect element highlighting, 
                  accurate positioning, and zero cross-origin issues.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="bg-purple-500/20 p-4 rounded-lg w-fit mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-400" />
                </div>
                <CardTitle className="text-white">Always Available</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300 text-center">
                  One-click activation on any tab. Debug production sites, 
                  private dashboards, and local development environments.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="waitlist-section" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-400/30">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-4 rounded-full">
                  <Chrome className="h-16 w-16 text-white" />
                </div>
              </div>
              
              <h2 className="text-4xl font-bold mb-4 text-white">
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
                
                <Link to="/debug">
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
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;
