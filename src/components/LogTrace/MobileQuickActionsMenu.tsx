
import React from 'react';
import { X, Zap, MousePointer, Eye, Settings, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileQuickActionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrace: () => void;
  onEndTrace: () => void;
  onToggleHover: () => void;
  onUpgrade: () => void;
  onSettings: () => void;
  isTracing: boolean;
  isHoverEnabled: boolean;
}

const MobileQuickActionsMenu: React.FC<MobileQuickActionsMenuProps> = ({
  isOpen,
  onClose,
  onStartTrace,
  onEndTrace,
  onToggleHover,
  onUpgrade,
  onSettings,
  isTracing,
  isHoverEnabled,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          .slide-up {
            animation: slideUp 0.3s ease-out;
          }
        `}
      </style>
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-green-500/30 z-50 slide-up">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-400">Quick Actions</h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={isTracing ? onEndTrace : onStartTrace}
              variant={isTracing ? "destructive" : "default"}
              className="h-12 flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {isTracing ? 'End Trace' : 'Start Trace'}
            </Button>

            <Button
              onClick={onToggleHover}
              variant={isHoverEnabled ? "secondary" : "outline"}
              className="h-12 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {isHoverEnabled ? 'Disable Hover' : 'Enable Hover'}
            </Button>

            <Button
              onClick={onSettings}
              variant="outline"
              className="h-12 flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>

            <Button
              onClick={onUpgrade}
              className="h-12 flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Crown className="h-4 w-4" />
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileQuickActionsMenu;
