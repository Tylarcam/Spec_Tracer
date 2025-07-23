import React, { useEffect, useRef } from 'react';
import { Camera, Sparkles, Bug, Eye, Copy } from 'lucide-react';

interface QuickActionPillProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: 'screenshot' | 'context' | 'debug' | 'details' | 'copy') => void;
}

const QuickActionPill: React.FC<QuickActionPillProps> = ({ visible, x, y, onClose, onAction }) => {
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClick = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={pillRef}
      style={{ position: 'absolute', left: x, top: y - 48, zIndex: 1000 }}
      className="flex items-center bg-slate-900/95 border border-cyan-700 rounded-full shadow-lg px-2 py-1 gap-1 animate-fade-in"
      tabIndex={-1}
      data-quick-actions="true"
    >
      <button
        onClick={() => onAction('copy')}
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
        style={{ minWidth: 56 }}
        type="button"
      >
        <Copy className="h-4 w-4 text-cyan-300" />
        Copy
      </button>
      <button
        onClick={() => onAction('details')}
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
        style={{ minWidth: 56 }}
        type="button"
      >
        <Eye className="h-4 w-4 text-cyan-300" />
        View
      </button>
      <button
        onClick={() => onAction('context')}
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
        style={{ minWidth: 56 }}
        type="button"
      >
        <Sparkles className="h-4 w-4 text-cyan-300" />
        Gen
      </button>
      <button
        onClick={() => onAction('debug')}
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
        style={{ minWidth: 56 }}
        type="button"
      >
        <Bug className="h-4 w-4 text-cyan-300" />
        Fix
      </button>
      <button
        onClick={() => onAction('screenshot')}
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
        style={{ minWidth: 56 }}
        type="button"
      >
        <Camera className="h-4 w-4 text-cyan-300" />
        Shot
      </button>
    </div>
  );
};

export default QuickActionPill; 