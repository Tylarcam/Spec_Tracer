
import React from 'react';
import { Settings, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface HeaderProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  remainingUses: number;
  onSettingsClick?: () => void;
  onUpgradeClick?: () => void;
  contextCaptureEnabled?: boolean;
  onContextCaptureChange?: (enabled: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isActive,
  setIsActive,
  showTerminal,
  setShowTerminal,
  remainingUses,
  onSettingsClick,
  onUpgradeClick,
  contextCaptureEnabled = false,
  onContextCaptureChange
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-green-500/30">
      <div className="flex items-center justify-between p-3 md:p-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Zap className="h-3 w-3 md:h-4 md:w-4 text-white" />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-white">LogTrace</h1>
          {(isActive || contextCaptureEnabled) && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">
                {contextCaptureEnabled ? 'Capturing' : 'Active'}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Context Capture Toggle - compact for mobile */}
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-xs text-cyan-300 font-medium hidden sm:block">Capture</span>
            <Switch
              checked={contextCaptureEnabled}
              onCheckedChange={onContextCaptureChange}
              className="scale-75 md:scale-100"
              aria-label="Enable Context Capture"
            />
          </div>

          {/* Usage Counter - Mobile optimized */}
          <div className="flex items-center gap-1 px-2 md:px-3 py-1 bg-slate-800 border border-green-500/30 rounded-full">
            <Zap className="h-3 w-3 md:h-4 md:w-4 text-green-400" />            <span className="text-xs md:text-sm text-green-400 font-medium">
              {remainingUses}/5
            </span>
          </div>

          {/* Upgrade Button - Responsive */}
          <Button
            onClick={onUpgradeClick}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-black px-2 md:px-3 h-8 md:h-9"
          >
            <Crown className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
            <span className="hidden sm:inline">Pro</span>
          </Button>

          {/* Settings Button */}
          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white h-8 md:h-9 w-8 md:w-9 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Status Bar */}
      {(isActive || contextCaptureEnabled) && (
        <div className="sm:hidden px-3 pb-2">
          <div className="flex items-center justify-center gap-2 py-1 bg-green-500/10 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">
              {contextCaptureEnabled ? 'Context Capture Active' : 'LogTrace Active'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
