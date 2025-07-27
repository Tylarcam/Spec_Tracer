import React, { useEffect, useRef, useState } from 'react';
import { Camera, Sparkles, Bug, Copy, ChevronDown } from 'lucide-react';

interface QuickActionPillProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: 'screenshot' | 'context' | 'debug' | 'copy' | { type: string; mode?: string; input?: string }) => void;
}

const QuickActionPill: React.FC<QuickActionPillProps> = ({ visible, x, y, onClose, onAction }) => {
  const pillRef = useRef<HTMLDivElement>(null);
  const [expandedButton, setExpandedButton] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (expandedButton) {
          setExpandedButton(null);
          setCustomInput('');
        } else {
          onClose();
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setExpandedButton(null);
        setCustomInput('');
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [visible, onClose, expandedButton]);

  useEffect(() => {
    if (expandedButton && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expandedButton]);

  if (!visible) return null;

  const handleButtonClick = (action: string) => {
    if (action === 'screenshot' || action === 'context' || action === 'debug') {
      setExpandedButton(expandedButton === action ? null : action);
      setCustomInput('');
    } else {
      onAction(action as any);
    }
  };

  const handleDropdownAction = (type: string, mode: string, input?: string) => {
    onAction({ type, mode, input });
    setExpandedButton(null);
    setCustomInput('');
  };

  const handleCustomSubmit = () => {
    if (customInput.trim() && expandedButton) {
      handleDropdownAction(expandedButton, 'custom', customInput);
    }
  };

  const screenshotOptions = [
    { label: 'Element', mode: 'element' },
    { label: 'Rectangle', mode: 'rectangle' },
    { label: 'Window', mode: 'window' },
    { label: 'Full Screen', mode: 'fullscreen' },
    { label: 'Freeform', mode: 'freeform' }
  ];

  const contextOptions = [
    { label: 'Analyze Layout', mode: 'layout' },
    { label: 'Check Accessibility', mode: 'accessibility' },
    { label: 'Performance Review', mode: 'performance' }
  ];

  const debugOptions = [
    { label: 'Why not working?', mode: 'why-not-working' },
    { label: 'CSS Issues', mode: 'css-issues' },
    { label: 'Event Problems', mode: 'event-problems' }
  ];

  return (
    <div
      ref={pillRef}
      className="flex items-center animate-fade-in"
      style={{
        position: 'absolute',
        left: x,
        top: y - 48,
        zIndex: 1000,
        background: 'rgba(30, 41, 59, 0.95)',
        border: '1px solid rgba(34, 211, 238, 0.6)',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(34, 211, 238, 0.2)',
        padding: '12px 16px',
        gap: '8px',
        backdropFilter: 'blur(8px)',
        flexDirection: expandedButton ? 'column' : 'row',
        alignItems: expandedButton ? 'stretch' : 'center',
        minWidth: expandedButton ? '280px' : 'auto'
      }}
      tabIndex={-1}
      data-quick-actions="true"
    >
      {!expandedButton && (
        <>
          <button
            onClick={() => handleButtonClick('copy')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/80 hover:bg-cyan-900/60 border border-transparent hover:border-cyan-400/40 text-cyan-300 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            style={{
              minWidth: '64px',
              background: 'rgba(51, 65, 85, 0.8)',
              border: '1px solid transparent',
              borderRadius: '8px',
              color: '#67e8f9',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
            type="button"
          >
            <Copy className="h-4 w-4" style={{ color: '#67e8f9' }} />
            Copy
          </button>
          
          <button
            onClick={() => handleButtonClick('screenshot')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/80 hover:bg-cyan-900/60 border border-transparent hover:border-cyan-400/40 text-cyan-300 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            style={{
              minWidth: '64px',
              background: 'rgba(51, 65, 85, 0.8)',
              border: '1px solid transparent',
              borderRadius: '8px',
              color: '#67e8f9',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
            type="button"
          >
            <Camera className="h-4 w-4" style={{ color: '#67e8f9' }} />
            Shot
            <ChevronDown className="h-3 w-3" style={{ color: '#67e8f9' }} />
          </button>
          <button
            onClick={() => handleButtonClick('context')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/80 hover:bg-cyan-900/60 border border-transparent hover:border-cyan-400/40 text-cyan-300 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            style={{
              minWidth: '64px',
              background: 'rgba(51, 65, 85, 0.8)',
              border: '1px solid transparent',
              borderRadius: '8px',
              color: '#67e8f9',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
            type="button"
          >
            <Sparkles className="h-4 w-4" style={{ color: '#67e8f9' }} />
            Gen
            <ChevronDown className="h-3 w-3" style={{ color: '#67e8f9' }} />
          </button>
          <button
            onClick={() => handleButtonClick('debug')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/80 hover:bg-cyan-900/60 border border-transparent hover:border-cyan-400/40 text-cyan-300 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            style={{
              minWidth: '64px',
              background: 'rgba(51, 65, 85, 0.8)',
              border: '1px solid transparent',
              borderRadius: '8px',
              color: '#67e8f9',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
            type="button"
          >
            <Bug className="h-4 w-4" style={{ color: '#67e8f9' }} />
            Fix
            <ChevronDown className="h-3 w-3" style={{ color: '#67e8f9' }} />
          </button>
        </>
      )}

      {expandedButton === 'screenshot' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="h-4 w-4 text-orange-400" />
            <span className="text-orange-400 font-medium text-sm">Screenshot Options</span>
          </div>
          {screenshotOptions.map((option) => (
            <button
              key={option.mode}
              onClick={() => handleDropdownAction('screenshot', option.mode)}
              className="w-full text-left px-3 py-2 rounded bg-slate-800/80 hover:bg-orange-500/20 text-orange-300 text-sm transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {expandedButton === 'context' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400 font-medium text-sm">Context Generation</span>
          </div>
          {contextOptions.map((option) => (
            <button
              key={option.mode}
              onClick={() => handleDropdownAction('context', option.mode)}
              className="w-full text-left px-3 py-2 rounded bg-slate-800/80 hover:bg-yellow-500/20 text-yellow-300 text-sm transition-colors"
            >
              {option.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-700/50">
            <input
              ref={inputRef}
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Custom context prompt..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:border-yellow-400 focus:outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCustomSubmit();
                }
              }}
            />
            <button
              onClick={handleCustomSubmit}
              disabled={!customInput.trim()}
              className="w-full mt-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm disabled:opacity-50"
            >
              Generate
            </button>
          </div>
        </div>
      )}

      {expandedButton === 'debug' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="h-4 w-4 text-purple-400" />
            <span className="text-purple-400 font-medium text-sm">Debug Questions</span>
          </div>
          {debugOptions.map((option) => (
            <button
              key={option.mode}
              onClick={() => handleDropdownAction('debug', option.mode)}
              className="w-full text-left px-3 py-2 rounded bg-slate-800/80 hover:bg-purple-500/20 text-purple-300 text-sm transition-colors"
            >
              {option.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-700/50">
            <input
              ref={inputRef}
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Custom debug question..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:border-purple-400 focus:outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCustomSubmit();
                }
              }}
            />
            <button
              onClick={handleCustomSubmit}
              disabled={!customInput.trim()}
              className="w-full mt-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm disabled:opacity-50"
            >
              Debug
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionPill; 