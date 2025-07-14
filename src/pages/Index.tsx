
import React, { Suspense, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
const LogTrace = React.lazy(() => import('@/components/LogTrace'));
import Spinner from '@/components/ui/spinner';
import IframeDemoBar from '@/components/IframeDemoBar';
import UpgradeNotificationBanner from '@/components/LogTrace/UpgradeNotificationBanner';
import { useToast } from '@/hooks/use-toast';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Terminal, Settings, Crown, Zap, User, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

const Index: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const siteUrl = params.get('site');
  const [iframeError, setIframeError] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [contextCaptureEnabled, setContextCaptureEnabled] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { creditsStatus, loading } = useCreditsSystem();
  const { subscribed, subscription_tier, openCustomerPortal, isPremium } = useSubscription();

  useEffect(() => {
    if (siteUrl && iframeError) {
      toast({
        title: 'Site Blocked Embedding',
        description: 'This website prevents embedding in iframes. Try another URL.',
        variant: 'destructive',
      });
    }
  }, [siteUrl, iframeError, toast]);

  const handleIframeError = () => {
    setIframeError(true);
  };

  const handleIframeLoad = () => {
    setIframeError(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
    });
  };

  const handleUpgrade = () => {
    setBannerDismissed(true);
  };

  // If no site URL, show the search interface
  if (!siteUrl) {
    return <IframeDemoBar />;
  }

  const remainingCredits = creditsStatus?.creditsRemaining || 0;
  const totalCredits = creditsStatus?.creditsLimit || 5;
  const isPremiumUser = creditsStatus?.isPremium || false;

  return (
    <div className="min-h-screen relative">
      {/* Upgrade Notification Banner - only show for authenticated users with low credits */}
      {!bannerDismissed && !loading && creditsStatus && user && (remainingCredits <= 2 && !isPremiumUser) && (
        <UpgradeNotificationBanner
          remainingCredits={remainingCredits}
          totalCredits={totalCredits}
          onUpgrade={handleUpgrade}
          onDismiss={() => setBannerDismissed(true)}
          isPremium={isPremiumUser}
        />
      )}

      {/* Enhanced header with integrated LogTrace controls */}
      <div className={`w-full bg-slate-900 border-b border-slate-700 p-3 flex items-center justify-between z-40 sticky ${!bannerDismissed && !loading && creditsStatus && user && (remainingCredits <= 2 && !isPremiumUser) ? 'top-12' : 'top-0'}`}>
        {/* Left side - Logo and URL info */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            LogTrace
          </h2>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium text-sm">Analyzing:</span>
          <span className="text-white font-mono text-sm truncate max-w-md">{siteUrl}</span>
        </div>

        {/* Center - LogTrace Controls */}
        <div className="flex items-center gap-4">
          {/* Context Capture Toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="context-capture" className="text-sm text-gray-300">
              Context Capture
            </Label>
            <Switch
              id="context-capture"
              checked={contextCaptureEnabled}
              onCheckedChange={setContextCaptureEnabled}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          {/* Terminal Toggle */}
          <Button
            onClick={() => setShowTerminal(!showTerminal)}
            variant="outline"
            size="sm"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Terminal className="h-4 w-4 mr-2" />
            Terminal
          </Button>
        </div>

        {/* Right side - User info, Credits, and Actions */}
        <div className="flex items-center gap-3">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">{user.email}</span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Credits and Upgrade */}
          {!isPremiumUser && !loading && creditsStatus && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                <Zap className="h-3 w-3 mr-1" />
                {remainingCredits}/{totalCredits} Free
              </Badge>
              <Button
                onClick={handleUpgrade}
                size="sm"
                className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </div>
          )}

          {/* Pro Badge */}
          {isPremiumUser && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
              <Button
                onClick={openCustomerPortal}
                variant="outline"
                size="sm"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                Manage
              </Button>
            </div>
          )}

          {/* Change URL Button */}
          <Button 
            onClick={() => window.location.href = '/debug'}
            variant="outline"
            size="sm"
            className="border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-white"
          >
            Change URL
          </Button>
        </div>
      </div>
      
      {/* Iframe */}
      <div className="relative">
        <iframe
          src={siteUrl}
          className={`w-full border-none ${!bannerDismissed && !loading && creditsStatus && user && (remainingCredits <= 2 && !isPremiumUser) ? 'h-[calc(100vh-108px)]' : 'h-[calc(100vh-60px)]'}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onError={handleIframeError}
          onLoad={handleIframeLoad}
          title="Demo Website"
        />
        {iframeError && (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <div className="text-center text-slate-300">
              <h3 className="text-lg font-semibold mb-2">Unable to load website</h3>
              <p className="text-sm">This site may block embedding. Try a different URL.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* LogTrace Component - Pass down the states we're managing */}
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner size={48} /></div>}>
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="pointer-events-auto">
            <LogTrace 
              contextCaptureEnabled={contextCaptureEnabled}
              onContextCaptureChange={setContextCaptureEnabled}
              showTerminal={showTerminal}
              onShowTerminalChange={setShowTerminal}
              hideHeader={true}
            />
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default Index;
