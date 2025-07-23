
import React, { useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Pause, 
  RotateCcw, 
  Terminal, 
  Bug, 
  Camera, 
  Sparkles, 
  Eye, 
  Settings, 
  Monitor,
  Maximize2,
  PenTool,
  SquareDashedMousePointer
} from 'lucide-react';

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  isActive: boolean;
  isHoverPaused: boolean;
  showTerminal: boolean;
  currentElement: any;
  onAction: (action: string, ...args: any[]) => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  disabled?: boolean;
  description?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  onClose,
  isActive,
  isHoverPaused,
  showTerminal,
  currentElement,
  onAction,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const sections: MenuSection[] = [
    {
      title: 'LogTrace Control',
      items: [
        {
          key: 'toggle-active',
          label: isActive ? 'Stop LogTrace' : 'Start LogTrace',
          icon: isActive ? Square : Play,
          action: () => onAction('toggle-active'),
          description: isActive ? 'Stop element inspection' : 'Start element inspection'
        },
        {
          key: 'toggle-pause',
          label: isHoverPaused ? 'Resume Hover' : 'Pause Hover',
          icon: isHoverPaused ? Play : Pause,
          action: () => onAction('toggle-pause'),
          disabled: !isActive,
          description: isHoverPaused ? 'Resume hover tracking' : 'Pause hover tracking'
        },
        {
          key: 'reset',
          label: 'Reset Session',
          icon: RotateCcw,
          action: () => onAction('reset'),
          description: 'Clear all events and reset LogTrace'
        }
      ]
    },
    {
      title: 'Element Actions',
      items: [
        {
          key: 'view-details',
          label: 'View Details',
          icon: Eye,
          action: () => onAction('view-details'),
          disabled: !currentElement,
          description: 'View detailed element information'
        },
        {
          key: 'ai-debug',
          label: 'AI Debug',
          icon: Bug,
          action: () => onAction('ai-debug'),
          disabled: !currentElement,
          description: 'Get AI-powered debugging insights'
        },
        {
          key: 'generate-context',
          label: 'Generate Context',
          icon: Sparkles,
          action: () => onAction('generate-context'),
          disabled: !currentElement,
          description: 'Generate context about this element'
        }
      ]
    },
    {
      title: 'Screenshots',
      items: [
        {
          key: 'screenshot-rectangle',
          label: 'Rectangle Screenshot',
          icon: SquareDashedMousePointer,
          action: () => onAction('screenshot', 'rectangle'),
          description: 'Select rectangular area to capture'
        },
        {
          key: 'screenshot-freeform',
          label: 'Freeform Screenshot',
          icon: PenTool,
          action: () => onAction('screenshot', 'freeform'),
          description: 'Draw custom shape to capture'
        },
        {
          key: 'screenshot-window',
          label: 'Window Screenshot',
          icon: Monitor,
          action: () => onAction('screenshot', 'window'),
          description: 'Capture visible window area'
        },
        {
          key: 'screenshot-full',
          label: 'Full Page Screenshot',
          icon: Maximize2,
          action: () => onAction('screenshot', 'fullscreen'),
          description: 'Capture entire page'
        }
      ]
    },
    {
      title: 'Tools',
      items: [
        {
          key: 'toggle-terminal',
          label: showTerminal ? 'Close Terminal' : 'Open Terminal',
          icon: Terminal,
          action: () => onAction('toggle-terminal'),
          description: showTerminal ? 'Hide debug terminal' : 'Show debug terminal and logs'
        },
        {
          key: 'settings',
          label: 'Settings',
          icon: Settings,
          action: () => onAction('settings'),
          description: 'Open LogTrace settings'
        }
      ]
    }
  ];

  // Position menu to stay within viewport
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 280),
    top: Math.min(y, window.innerHeight - 400),
    zIndex: 1000,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="bg-slate-900/95 border border-cyan-500/30 rounded-xl shadow-2xl backdrop-blur-sm w-72 animate-fade-in"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-500/20">
        <h3 className="text-cyan-400 font-semibold text-sm">LogTrace Actions</h3>
        <p className="text-gray-400 text-xs mt-1">Right-click for context menu</p>
      </div>

      {/* Menu sections */}
      <div className="max-h-96 overflow-y-auto">
        {sections.map((section, sectionIndex) => (
          <div key={section.title} className={sectionIndex > 0 ? 'border-t border-slate-700/50' : ''}>
            <div className="px-4 py-2">
              <h4 className="text-gray-300 font-medium text-xs uppercase tracking-wide">
                {section.title}
              </h4>
            </div>
            <div className="pb-2">
              {section.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (!item.disabled) {
                      item.action();
                      onClose();
                    }
                  }}
                  disabled={item.disabled}
                  className={`
                    w-full px-4 py-2 flex items-center gap-3 text-left transition-colors
                    ${item.disabled 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-200 hover:bg-cyan-900/30 hover:text-cyan-300'
                    }
                  `}
                  title={item.description}
                >
                  <item.icon className={`h-4 w-4 ${item.disabled ? 'text-gray-600' : 'text-cyan-400'}`} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/50">
        <p className="text-xs text-gray-500 text-center">
          Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
};

export default ContextMenu;
