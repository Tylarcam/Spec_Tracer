import React, { useEffect, useRef } from 'react';
import { Camera, Sparkles, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionModalProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: 'screenshot' | 'context' | 'debug') => void;
}

const actions = [
  { key: 'screenshot', label: 'Screenshot', icon: Camera },
  { key: 'context', label: 'Generate Context', icon: Sparkles },
  { key: 'debug', label: 'Debug', icon: Bug },
] as const;

type ActionKey = typeof actions[number]['key'];

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ visible, x, y, onClose, onAction }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // Trap focus
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>('button');
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
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
      ref={modalRef}
      style={{ position: 'absolute', left: x, top: y, zIndex: 1000, minWidth: 220 }}
      className="bg-slate-900 border border-cyan-400 rounded-xl shadow-2xl p-4 flex flex-col gap-4 animate-fade-in"
      tabIndex={-1}
    >
      {actions.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant="secondary"
          size="lg"
          className="flex items-center gap-3 text-lg font-semibold"
          onClick={() => onAction(key)}
          autoFocus={key === 'screenshot'}
        >
          <Icon className="h-6 w-6 text-cyan-400" />
          {label}
        </Button>
      ))}
    </div>
  );
};

export default QuickActionModal; 