
import React, { useState, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { X, Copy, Eye, Bug, Camera, Sparkles, Zap } from 'lucide-react';
import { ElementInfo } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';
import { useToast } from '@/hooks/use-toast';

interface QuickActionModalProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string | { type: string; mode?: string; input?: string }) => void;
}

const QuickActionModal: React.FC<QuickActionModalProps> = ({
  visible,
  x,
  y,
  onClose,
  onAction,
}) => {
  const [showContextInput, setShowContextInput] = useState(false);
  const [contextInput, setContextInput] = useState('');
  const [showScreenshotOptions, setShowScreenshotOptions] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  if (!visible) return null;

  // Calculate safe position
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const modalWidth = 280;
  const modalHeight = 320;
  
  const safeX = Math.min(x, viewportWidth - modalWidth - 20);
  const safeY = Math.min(y, viewportHeight - modalHeight - 20);

  const handleContextSubmit = () => {
    if (contextInput.trim()) {
      onAction({ type: 'context', mode: 'custom', input: contextInput });
      setContextInput('');
      setShowContextInput(false);
    }
  };

  const handleScreenshotAction = (mode: string) => {
    onAction({ type: 'screenshot', mode });
    setShowScreenshotOptions(false);
  };

  const quickActions = [
    {
      id: 'copy',
      label: 'Copy Details',
      icon: Copy,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      hoverColor: 'hover:bg-blue-500/20',
      description: 'Copy element details to clipboard'
    },
    {
      id: 'details',
      label: 'Inspect Element',
      icon: Eye,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      hoverColor: 'hover:bg-green-500/20',
      description: 'Open detailed element inspector'
    },
    {
      id: 'debug',
      label: 'AI Debug',
      icon: Bug,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      hoverColor: 'hover:bg-purple-500/20',
      description: 'Get AI-powered debugging help'
    },
    {
      id: 'screenshot',
      label: 'Screenshot',
      icon: Camera,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      hoverColor: 'hover:bg-orange-500/20',
      description: 'Take element screenshot'
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      onClick={onClose}
    >
      <Card
        className="absolute bg-slate-900/95 border-cyan-500/50 shadow-2xl pointer-events-auto"
        style={{
          left: safeX,
          top: safeY,
          width: modalWidth,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-cyan-400">Quick Actions</h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {!showContextInput && !showScreenshotOptions && (
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  onClick={() => {
                    if (action.id === 'screenshot') {
                      setShowScreenshotOptions(true);
                    } else {
                      onAction(action.id);
                    }
                  }}
                  variant="ghost"
                  className={`w-full justify-start ${action.color} ${action.bgColor} ${action.hoverColor} border border-transparent hover:border-current/20 transition-all`}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs opacity-70">{action.description}</div>
                  </div>
                </Button>
              ))}
              
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <Button
                  onClick={() => setShowContextInput(true)}
                  variant="ghost"
                  className="w-full justify-start text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 border border-transparent hover:border-yellow-400/20 transition-all"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Custom Context</div>
                    <div className="text-xs opacity-70">Generate context prompt</div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {showContextInput && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowContextInput(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  ←
                </Button>
                <h4 className="text-sm font-medium text-yellow-400">Custom Context</h4>
              </div>
              
              <input
                ref={inputRef}
                type="text"
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                placeholder="Describe what you want to debug..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:border-yellow-400 focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleContextSubmit();
                  }
                }}
                autoFocus
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleContextSubmit}
                  disabled={!contextInput.trim()}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                  size="sm"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate
                </Button>
                <Button
                  onClick={() => {
                    setShowContextInput(false);
                    setContextInput('');
                  }}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {showScreenshotOptions && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowScreenshotOptions(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  ←
                </Button>
                <h4 className="text-sm font-medium text-orange-400">Screenshot Options</h4>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => handleScreenshotAction('element')}
                  variant="ghost"
                  className="w-full justify-start text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Element Only
                </Button>
                <Button
                  onClick={() => handleScreenshotAction('viewport')}
                  variant="ghost"
                  className="w-full justify-start text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Full Viewport
                </Button>
                <Button
                  onClick={() => handleScreenshotAction('selection')}
                  variant="ghost"
                  className="w-full justify-start text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Custom Selection
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QuickActionModal;
