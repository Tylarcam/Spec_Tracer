import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, User, Crown, Zap, LogOut, LogIn, Github, Mail, Activity, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NavBarProps {
  tracingActive?: boolean;
  onTracingToggle?: (active: boolean) => void;
  isHoverEnabled?: boolean;
  onToggleHover?: (enabled: boolean) => void;
  eventCount?: number;
  onOpenSettings?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ 
  tracingActive = false, 
  onTracingToggle,
  isHoverEnabled = true,
  onToggleHover,
  eventCount = 0,
  onOpenSettings
}) => {
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
  const bonusCredits = user ? 25 : 0;
  const showBonus = user && bonusCredits > 0;

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
      toast({ title: 'Sign Out Error', description: 'An unexpected error occurred during sign out.', variant: 'destructive' });
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
    setShowAuthModal(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-1.5 md:p-2 rounded-lg">
                <Target className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold text-white">LogTrace</span>
            </Link>

            {/* Center - Trace Controls (only show when tracing props are provided) */}
            {onTracingToggle && (
              <div className="flex items-center gap-6">
                {/* Status Indicator */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      tracingActive 
                        ? "bg-green-400 shadow-sm shadow-green-400/50" 
                        : "bg-slate-500"
                    )} />
                    <span className={cn(
                      "text-sm font-medium transition-all duration-300",
                      tracingActive ? "text-green-400" : "text-slate-400"
                    )}>
                      {tracingActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Trace Toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-300 font-medium">Trace</span>
                  <Switch
                    checked={tracingActive}
                    onCheckedChange={onTracingToggle}
                    className={cn(
                      "transition-all duration-300",
                      tracingActive ? "bg-green-500" : "bg-slate-600"
                    )}
                  />
                </div>

                {/* Hover Toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-300 font-medium">Hover</span>
                  <Switch
                    checked={isHoverEnabled}
                    onCheckedChange={onToggleHover}
                    disabled={!tracingActive}
                    className={cn(
                      "transition-all duration-300",
                      isHoverEnabled ? "bg-blue-500" : "bg-slate-600",
                      !tracingActive && "opacity-40"
                    )}
                  />
                </div>

                {/* Event Counter */}
                {tracingActive && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-lg border border-slate-700/40">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-sm font-mono text-cyan-400 font-medium">
                        {eventCount}
                      </span>
                      <span className="text-sm text-slate-400">events</span>
                    </div>
                  </div>
                )}

                {/* Settings */}
                {onOpenSettings && (
                  <Button
                    onClick={onOpenSettings}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 rounded-lg",
                      "text-slate-400 hover:text-slate-300",
                      "hover:bg-slate-800/60 transition-all duration-300",
                      "border border-transparent hover:border-slate-700/40"
                    )}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Right side actions */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Credits Display */}
              <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-slate-800 border border-green-500/30 rounded-full">
                <Zap className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
                <span className="text-xs text-green-400 font-semibold">
                  {user ? `${remainingUses}/5` : `${remainingUses}/3`}
                </span>
                {showBonus && (
                  <span className="hidden sm:flex items-center gap-1 ml-1 text-yellow-400 font-semibold text-xs">
                    <Crown className="h-3 w-3" /> +{bonusCredits}
                  </span>
                )}
              </div>
              
              {/* Upgrade */}
              <Button
                className="bg-yellow-600 hover:bg-yellow-700 text-black px-2 md:px-3 py-1 rounded-full flex items-center gap-1 text-xs md:text-sm font-semibold h-7 md:h-8"
                onClick={() => navigate('/upgrade')}
              >
                <Crown className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Pro</span>
              </Button>
              
              {/* Auth Button */}
              <Button
                className={`p-1.5 md:p-2 rounded-full flex items-center gap-1 text-xs md:text-sm font-medium transition-colors h-7 md:h-8 ${
                  user 
                    ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-slate-800 border border-red-500/30' 
                    : 'text-green-400 hover:text-green-300 hover:bg-green-500/10 bg-slate-800 border border-green-500/30'
                }`}
                onClick={handleAuthButtonClick}
                variant="ghost"
              >
                {user ? (
                  <>
                    <LogOut className="h-3 w-3 md:h-5 md:w-5" />
                    <span className="hidden sm:inline">Out</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-3 w-3 md:h-5 md:w-5" />
                    <span className="hidden sm:inline">In</span>
                  </>
                )}
              </Button>
              
              {/* Account/Profile (only show when signed in) */}
              {user && (
                <Button
                  className="text-cyan-300 hover:text-cyan-400 p-1.5 md:p-2 rounded-full bg-slate-800 border border-cyan-500/30 h-7 md:h-8"
                  onClick={() => navigate('/settings')}
                  variant="ghost"
                >
                  <User className="h-3 w-3 md:h-5 md:w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal Popup - Dark themed */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 bg-black/70 z-[2147483650] flex items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-white" onClick={handleAuthModalClick}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-400">Welcome to LogTrace</CardTitle>
              <CardDescription className="text-slate-300">
                Sign in to access advanced debugging features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={defaultTab} onValueChange={v => setDefaultTab(v as 'signin' | 'signup')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-700 border-slate-600">
                  <TabsTrigger value="signin" className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-slate-300">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-slate-300">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
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
                      <Label htmlFor="signup-email" className="text-slate-300">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-slate-300">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
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
                  className="w-full mt-4 bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
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
                className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600" 
                variant="outline"
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
