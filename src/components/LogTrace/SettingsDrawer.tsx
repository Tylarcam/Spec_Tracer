
import React from 'react';
import { X, Settings, Keyboard, Zap, Eye, Terminal, MousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  onUpgradeClick?: () => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose, onUpgrade, onUpgradeClick }) => {
  const shortcuts = [
    { key: 'S', description: 'Start/Stop tracing', icon: Zap },
    { key: 'E', description: 'End tracing session', icon: X },
    { key: 'D', description: 'Freeze hover state', icon: Eye },
    { key: 'T', description: 'Toggle terminal panel', icon: Terminal },
    { key: 'Ctrl+D', description: 'Trigger AI debug', icon: MousePointer },
  ];

  const handleUpgrade = onUpgradeClick || onUpgrade || (() => {});

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`
        fixed right-0 top-0 h-full w-full max-w-sm bg-slate-900 border-l border-green-500/30 
        shadow-2xl z-50 transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-500/20">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Settings</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
          {/* Upgrade Section */}
          <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2">LogTrace Pro</h3>
            <p className="text-gray-300 text-sm mb-3">
              Unlock unlimited AI debugging, export features, and priority support.
            </p>
            <Button
              onClick={handleUpgrade}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Upgrade to Pro
            </Button>
          </div>

          <Separator className="bg-gray-700" />

          {/* Keyboard Shortcuts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="h-4 w-4 text-cyan-400" />
              <h3 className="text-cyan-400 font-semibold">Keyboard Shortcuts</h3>
            </div>
            <div className="space-y-3">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <shortcut.icon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{shortcut.description}</span>
                  </div>
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-gray-300">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Mobile Tips */}
          <div className="lg:hidden">
            <h3 className="text-cyan-400 font-semibold mb-3">Mobile Tips</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Tap elements to inspect them</p>
              <p>• Long press for additional options</p>
              <p>• Swipe up to access terminal</p>
              <p>• Use two fingers to scroll content</p>
            </div>
          </div>

          {/* Version Info */}
          <div className="text-center text-xs text-gray-500 pt-4">
            LogTrace v1.0.0
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;
