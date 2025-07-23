
import React, { useState } from 'react';
import { Play, Pause, MousePointer, Settings, Terminal, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';
import { useEnhancedCredits } from '@/hooks/useEnhancedCredits';
import SettingsDrawer from '@/components/LogTrace/SettingsDrawer';

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
  const [showSettings, setShowSettings] = useState(false);
  const { creditStatus } = useEnhancedCredits();

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-green-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-green-400">LogTrace</h1>
            </div>

            {/* Center Controls */}
            <div className="flex items-center space-x-4">
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
                      ? 'bg-green-600 hover:bg-green-700 text-white data-[state=on]:bg-green-600 data-[state=on]:text-white' 
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                    }
                  `}
                >
                  <MousePointer className="h-4 w-4" />
                  <span className="ml-2">Hover</span>
                </Toggle>
              </div>

              {/* Event Count */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">Events:</span>
                <Badge variant="outline" className="text-green-400 border-green-500/50">
                  {eventCount}
                </Badge>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              {/* Pro Badge with Credits */}
              <div className="flex items-center space-x-2">
                {creditStatus.isPremium ? (
                  <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-3 py-1">
                    <Crown className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-medium">Pro</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
                    <span className="text-xs text-green-400 font-medium">
                      {creditStatus.totalCredits} credits
                    </span>
                  </div>
                )}
              </div>

              {/* Terminal Toggle */}
              <Button
                onClick={onToggleTerminal}
                variant="ghost"
                size="sm"
                className={`
                  transition-colors duration-200
                  ${showTerminal
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }
                `}
              >
                <Terminal className="h-4 w-4" />
              </Button>

              {/* Settings Button */}
              <Button
                onClick={handleSettingsClick}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={showSettings}
        onClose={handleCloseSettings}
      />
    </>
  );
};

export default NavBar;
