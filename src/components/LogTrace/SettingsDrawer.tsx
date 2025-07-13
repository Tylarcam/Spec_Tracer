
import React, { useState } from 'react';
import { Settings, X, Keyboard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

interface SettingsDrawerProps {
  onUpgradeClick: () => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ onUpgradeClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'S', description: 'Start element tracing mode' },
    { key: 'E', description: 'End tracing and exit mode' },
    { key: 'D', description: 'Freeze hover (pause element selection)' },
    { key: 'T', description: 'Toggle terminal history panel' },
    { key: 'Ctrl+D', description: 'Trigger AI debug analysis' },
    { key: 'Escape', description: 'Close all panels and modals' },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-40 bg-slate-800/80 hover:bg-slate-700 text-green-400 border border-green-400/20"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="bg-slate-900 border-green-400/20">
        <DrawerHeader className="border-b border-green-400/20">
          <DrawerTitle className="text-green-400 font-mono flex items-center gap-2">
            <Settings className="h-5 w-5" />
            LogTrace Settings
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="p-6 space-y-6">
          {/* Keyboard Shortcuts Section */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 bg-slate-800/50 rounded border border-slate-700">
                  <span className="text-slate-300 text-sm">{shortcut.description}</span>
                  <kbd className="bg-slate-700 text-green-400 px-2 py-1 rounded text-xs font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Section */}
          <div className="border-t border-green-400/20 pt-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Upgrade
            </h3>
            <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">LogTrace Pro</h4>
              <p className="text-slate-300 text-sm mb-4">
                Unlock unlimited AI debugging, export features, and advanced analytics.
              </p>
              <Button
                onClick={() => {
                  onUpgradeClick();
                  setIsOpen(false);
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SettingsDrawer;
