
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Crown, Zap, Play, Square, Terminal, User, LogOut } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HeaderProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  remainingUses: number;
  onSettingsClick: () => void;
  onUpgradeClick: () => void;
  contextCaptureEnabled: boolean;
  onContextCaptureChange: (enabled: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  isActive,
  setIsActive,
  showTerminal,
  setShowTerminal,
  remainingUses,
  onSettingsClick,
  onUpgradeClick,
  contextCaptureEnabled,
  onContextCaptureChange,
}) => {
  const { subscribed, subscription_tier, openCustomerPortal, isPremium } = useSubscription();
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
    });
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {/* User info moved to left */}
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

        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            LogTrace: Context Editing
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Label htmlFor="context-capture" className="text-sm text-gray-300">
              Context Capture
            </Label>
            <Switch
              id="context-capture"
              checked={contextCaptureEnabled}
              onCheckedChange={onContextCaptureChange}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <Button
            onClick={() => setIsActive(!isActive)}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-2 ${
              isActive 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "border-green-500/30 text-green-400 hover:bg-green-500/10"
            }`}
          >
            {isActive ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isActive ? "Stop" : "Start"}
          </Button>

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
      </div>

      {/* Right side - Credits, Pro badge, Settings, Theme moved here */}
      <div className="flex items-center gap-4">
        {!isPremium && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-orange-500/30 text-orange-400">
              <Zap className="h-3 w-3 mr-1" />
              {remainingUses}/5 Free
            </Badge>
            <Button
              onClick={onUpgradeClick}
              size="sm"
              className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          </div>
        )}

        {isPremium && (
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
              Manage Subscription
            </Button>
          </div>
        )}

        <Button
          onClick={onSettingsClick}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <Settings className="h-4 w-4" />
        </Button>

        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header;
