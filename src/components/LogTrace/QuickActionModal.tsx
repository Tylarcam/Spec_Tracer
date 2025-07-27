import React, { useEffect, useRef, useState } from 'react';
import { Camera, Sparkles, Bug, Copy, Square, Monitor, Maximize2, PenTool, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionModalProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string | { type: string; mode?: string; input?: string }) => void;
}

type ScreenshotMode = 'element' | 'viewport' | 'fullpage' | 'freeform' | 'rect';

const screenshotModes: { mode: ScreenshotMode; label: string; icon: React.ComponentType }[] = [
  { mode: 'element', label: 'Element', icon: Square },
  { mode: 'viewport', label: 'Viewport', icon: Monitor },
  { mode: 'fullpage', label: 'Full Page', icon: Maximize2 },
  { mode: 'freeform', label: 'Freeform', icon: PenTool },
  { mode: 'rect', label: 'Rectangle', icon: Square },
];

const contextModes = [
  { mode: 'basic', label: 'Basic Context' },
  { mode: 'advanced', label: 'Advanced Context' },
];

const actions = [
  { key: 'copy', label: 'Copy', icon: Copy },
  { key: 'screenshot', label: 'Shot', icon: Camera },
  { key: 'context', label: 'Gen', icon: Sparkles },
  { key: 'debug', label: 'Fix', icon: Bug },
];

const QuickActionModal: React.FC<QuickActionModalProps> = ({
  visible,
  x,
  y,
  onClose,
  onAction,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [contextInput, setContextInput] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, onClose]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  useEffect(() => {
    const updatePosition = () => {
      if (!modalRef.current) return;

      const modalWidth = modalRef.current.offsetWidth;
      const modalHeight = modalRef.current.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let newX = x;
      let newY = y;

      if (newX - modalWidth / 2 < 0) {
        newX = modalWidth / 2;
      } else if (newX + modalWidth / 2 > windowWidth) {
        newX = windowWidth - modalWidth / 2;
      }

      if (newY - modalHeight / 2 < 0) {
        newY = modalHeight / 2;
      } else if (newY + modalHeight / 2 > windowHeight) {
        newY = windowHeight - modalHeight / 2;
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [x, y]);

  if (!visible) return null;

  const handleAction = (actionKey: string) => {
    if (actionKey === 'screenshot') {
      setActiveSubmenu('screenshot');
    } else if (actionKey === 'context') {
      setActiveSubmenu('context');
    } else {
      onAction(actionKey);
      onClose();
    }
  };

  const handleScreenshotMode = (mode: ScreenshotMode) => {
    onAction({ type: 'screenshot', mode });
    onClose();
  };

  const handleContextMode = (mode: string) => {
    if (mode === 'basic') {
      onAction({ type: 'context', mode, input: contextInput });
      onClose();
    } else {
      onAction({ type: 'context', mode, input: contextInput });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={modalRef}
        className="absolute bg-slate-800/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg shadow-xl pointer-events-auto"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {!activeSubmenu ? (
          // Main menu
          <div className="p-2 min-w-[200px]">
            <div className="text-cyan-400 text-sm font-medium mb-2 px-2">Quick Actions</div>
            <div className="space-y-1">
              {actions.map((action) => (
                <Button
                  key={action.key}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left hover:bg-cyan-500/20 text-gray-300 hover:text-white"
                  onClick={() => handleAction(action.key)}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        ) : activeSubmenu === 'screenshot' ? (
          // Screenshot submenu
          <div className="p-2 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-cyan-400 text-sm font-medium">Screenshot Mode</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSubmenu(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {screenshotModes.map((mode) => (
                <Button
                  key={mode.mode}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left hover:bg-cyan-500/20 text-gray-300 hover:text-white"
                  onClick={() => handleScreenshotMode(mode.mode)}
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>
        ) : activeSubmenu === 'context' ? (
          // Context submenu
          <div className="p-2 min-w-[240px]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-cyan-400 text-sm font-medium">Generate Context</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSubmenu(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
            <div className="mb-3">
              <input
                type="text"
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                placeholder="What do you want to know?"
                className="w-full px-2 py-1 text-sm bg-slate-700 border border-cyan-500/30 rounded text-white placeholder-gray-400"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              {contextModes.map((mode) => (
                <Button
                  key={mode.mode}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left hover:bg-cyan-500/20 text-gray-300 hover:text-white"
                  onClick={() => handleContextMode(mode.mode)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default QuickActionModal;
