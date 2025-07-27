
import React, { useState } from 'react';
import { Play, Pause, Crown, Zap, Activity, Infinity, LogIn, LogOut, Settings, Terminal, MousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';
import { useEnhancedCredits } from '@/hooks/useEnhancedCredits';
import { useAuth } from '@/contexts/AuthContext';

interface NavBarProps {
  isTracing: boolean;
  isHoverEnabled: boolean;
  onToggleTracing: () => void;
  onToggleHover: () => void;
  onOpenSettings: () => void;
  onToggleTerminal: () => void;
  eventCount: number;
  showTerminal: boolean;
}

const NavBar: React.FC<NavBarProps> = ({
  isTracing,
  isHoverEnabled,
  onToggleTracing,
  onToggleHover,
  onOpenSettings,
  onToggleTerminal,
  eventCount,
  showTerminal
}) => {
  const { creditStatus, isLoading, error } = useEnhancedCredits();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = () => {
    window.location.href = '/auth';
  };

  // Safe credit display with fallbacks
  const safeCredits = () => {
    if (isLoading) return '...';
    if (error) return '0';
    return creditStatus.isPremium ? <Infinity className="h-4 w-4 inline" /> : `${creditStatus.totalCredits}/40`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-green-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-green-400">LogTrace</h1>
          </div>

          {/* Center Controls - Universal Control Panel */}
          <div className="flex items-center space-x-4">
            {/* Active Indicator */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-green-500/30">
                <div className={`w-2 h-2 rounded-full ${isTracing ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></div>
                <span className={`text-sm font-medium ${isTracing ? 'text-green-400' : 'text-slate-400'}`}>
                  {isTracing ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Trace Toggle */}
            <div className="flex items-center space-x-2">
              <Toggle
                pressed={isTracing}
                onPressedChange={onToggleTracing}
                aria-label="Toggle tracing"
                className={`
                  transition-colors duration-200
                  ${isTracing 
                    ? 'bg-green-600 hover:bg-green-700 text-white data-[state=on]:bg-green-600 data-[state=on]:text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                  }
                `}
              >
                {isTracing ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="ml-2">
                  {isTracing ? 'Pause' : 'Start'} Trace
                </span>
              </Toggle>
            </div>

            {/* Hover Toggle */}
            <div className="flex items-center space-x-2">
              <Toggle
                pressed={isHoverEnabled}
                onPressedChange={onToggleHover}
                aria-label="Toggle hover detection"
                className={`
                  transition-colors duration-200
                  ${isHoverEnabled 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white data-[state=on]:bg-blue-600 data-[state=on]:text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                  }
                `}
              >
                <MousePointer className="h-4 w-4" />
                <span className="ml-2">
                  {isHoverEnabled ? 'Hover On' : 'Hover Off'}
                </span>
              </Toggle>
            </div>

            {/* Terminal Toggle */}
            <div className="flex items-center space-x-2">
              <Toggle
                pressed={showTerminal}
                onPressedChange={onToggleTerminal}
                aria-label="Toggle terminal"
                className={`
                  transition-colors duration-200
                  ${showTerminal 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white data-[state=on]:bg-purple-600 data-[state=on]:text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                  }
                `}
              >
                <Terminal className="h-4 w-4" />
                <span className="ml-2">
                  {showTerminal ? 'Terminal On' : 'Terminal Off'}
                </span>
              </Toggle>
            </div>

            {/* Event Status Icons */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-slate-800/50 rounded-full border border-green-500/30">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-sm text-slate-400">Events:</span>
                <Badge variant="outline" className="text-green-400 border-green-500/50 min-w-[2rem] text-center">
                  {eventCount || 0}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            {/* Lightning Icon with Rate Count */}
            <div className="flex items-center gap-1 bg-slate-800/50 border border-green-500/30 rounded-full px-3 py-1">
              <Zap className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">
                {safeCredits()}
              </span>
            </div>

            {/* Pro Badge */}
            {!isLoading && !error && creditStatus.isPremium && (
              <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-3 py-1">
                <Crown className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium">Pro</span>
              </div>
            )}

            {/* Settings Button */}
            <Button
              onClick={onOpenSettings}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Sign In/Out */}
            {user ? (
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Sign Out</span>
              </Button>
            ) : (
              <Button
                onClick={handleSignIn}
                variant="ghost"
                size="sm"
                className="text-green-400 hover:text-white hover:bg-green-700"
              >
                <LogIn className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
