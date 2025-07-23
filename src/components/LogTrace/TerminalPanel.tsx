
import React, { useEffect, useRef } from 'react';
import { Terminal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TerminalPanelProps {
  output: string[];
  isOpen: boolean;
  onClose: () => void;
}

const TerminalPanel: React.FC<TerminalPanelProps> = ({ output, isOpen, onClose }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  if (!isOpen) return null;

  return (
    <div className="lg:w-1/3 bg-slate-800 border-l border-green-500/30 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-cyan-400">Terminal</h3>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div ref={terminalRef} className="flex-1 overflow-y-auto text-xs text-gray-400 space-y-1">
        {output.map((line, index) => (
          <p key={index} className="font-mono">{line}</p>
        ))}
      </div>
    </div>
  );
};

export default TerminalPanel;
