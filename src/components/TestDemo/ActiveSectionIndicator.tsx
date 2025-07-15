
import React from 'react';
import { Zap } from 'lucide-react';

interface ActiveSectionIndicatorProps {
  activeSection: string | null;
}

export const ActiveSectionIndicator: React.FC<ActiveSectionIndicatorProps> = ({ activeSection }) => {
  if (!activeSection) return null;

  return (
    <div className="fixed top-20 right-4 z-40 bg-cyan-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4" />
        <span className="font-medium">Interacted with: {activeSection}</span>
      </div>
    </div>
  );
};
