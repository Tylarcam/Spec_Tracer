import React, { useEffect, useRef } from 'react';
import { Camera, Sparkles, Bug, Copy } from 'lucide-react';

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
        backdropFilter: 'blur(8px)'
      }}
      tabIndex={-1}
      data-quick-actions="true"
    >
      <button
        onClick={() => onAction('copy')}
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
        onClick={() => onAction('screenshot')}
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
      </button>
      <button
        onClick={() => onAction('context')}
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
      </button>
      <button
        onClick={() => onAction('debug')}
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
      </button>
    </div>
  );
};

export default QuickActionPill; 