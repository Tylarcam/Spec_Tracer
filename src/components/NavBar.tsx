import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, User, Crown, Zap, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Github, Mail, ArrowLeft, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, signUp, signIn, signInWithGitHub, signOut } = useAuth();
  const {
    aiDebugCount,
    remainingUses,
    isPremium,
    waitlistBonusRemaining,
    incrementAiDebugUsage,
  } = useUsageTracking();
  const { toast } = useToast();

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'signin' | 'signup'>('signin');

  // Placeholder for bonus/stacking logic
  // In a real app, you would fetch bonus/stacking state from backend or localStorage
  const bonusCredits = user ? 25 : 0; // Example: 25 bonus on signup
  const dailyLimit = user ? 5 : 3;
  const stackingDays = user ? 30 : 0;
  const stackedCredits = user ? Math.min(5 * stackingDays, 150) : 0;
  // For demo: show bonus if user just signed up
  const showBonus = user && bonusCredits > 0;

  const handleShare = () => {
    alert('Share with a friend to get 5 extra credits! (Demo only)');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        toast({ title: 'Sign Up Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Check your email', description: 'We sent you a confirmation link.' });
        setShowAuthModal(false);
        setEmail('');
        setPassword('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Sign In Error', description: error.message, variant: 'destructive' });
      } else {
        setShowAuthModal(false);
        setEmail('');
        setPassword('');
        toast({ title: 'Welcome back!', description: 'You have been signed in successfully.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGitHub();
      if (error) {
        toast({ title: 'GitHub Sign In Error', description: error.message, variant: 'destructive' });
      } else {
        setShowAuthModal(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({ title: 'Sign Out Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Signed out', description: 'You have been signed out successfully.' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to sign out', variant: 'destructive' });
    }
  };

  const handleAuthModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleOverlayClick = () => {
    setShowAuthModal(false);
    setEmail('');
    setPassword('');
  };

  const handleAuthButtonClick = () => {
    if (user) {
      handleSignOut();
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-green-500/30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo/Home */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-2 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">LogTrace</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            <Link to="/interactive-demo">
              <button
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow transition-colors text-base focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
                style={{ minWidth: 80 }}
              >
                Demo
              </button>
            </Link>
          </div>

          {/* Rate/Credit Counter & Actions */}
          <div className="flex items-center gap-3">
            {/* Rate/Credit Counter */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 border border-green-500/30 rounded-full">
              <Zap className="h-4 w-4 text-green-400" />
              <span className="text-xs text-green-400 font-semibold">
                {user ? `${remainingUses}/5` : `${remainingUses}/3`} credits
              </span>
              {showBonus && (
                <span className="flex items-center gap-1 ml-2 text-yellow-400 font-semibold text-xs">
                  <Crown className="h-4 w-4" /> +{bonusCredits} bonus
                </span>
              )}
            </div>
            
            {/* Upgrade */}
            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold"
              title="Upgrade to Pro"
              onClick={() => navigate('/upgrade')}
            >
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Pro</span>
            </button>
            
            {/* Quick Sign In/Out */}
            <button
              className={`p-2 rounded-full flex items-center gap-1 text-sm font-medium transition-colors ${
                user 
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' 
                  : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
              }`}
              title={user ? "Sign Out" : "Sign In"}
              onClick={handleAuthButtonClick}
            >
              {user ? (
                <>
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Out</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span className="hidden sm:inline">In</span>
                </>
              )}
            </button>
            
            {/* Account/Profile (only show when signed in) */}
            {user && (
              <button
                className="text-cyan-300 hover:text-cyan-400 p-2 rounded-full"
                title="Account"
                onClick={() => navigate('/settings')}
              >
                <User className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal Popup */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 bg-black/70 z-[2147483650] flex items-center justify-center"
          onClick={handleOverlayClick}
        >
          <Card className="w-full max-w-md p-0" onClick={handleAuthModalClick}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-400">Welcome to LogTrace</CardTitle>
              <CardDescription className="text-slate-300">
                Sign in to access advanced debugging features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={defaultTab} onValueChange={v => setDefaultTab(v as 'signin' | 'signup')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleGitHubSignIn}
                  className="w-full mt-4 bg-slate-700 border-slate-600 hover:bg-slate-600"
                  disabled={isLoading}
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
              <Button 
                onClick={() => {
                  setShowAuthModal(false);
                  setEmail('');
                  setPassword('');
                }} 
                className="mt-6 w-full" 
                variant="ghost"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default NavBar;
