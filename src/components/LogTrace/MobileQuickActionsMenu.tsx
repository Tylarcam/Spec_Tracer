
import React, { useState } from 'react';
import { Camera, Sparkles, Bug, Eye, Terminal, X, Monitor, Search, Plus } from 'lucide-react';

interface MobileQuickActionsMenuProps {
  isVisible: boolean;
  onToggle: () => void;
  onAction: (action: string) => void;
}

const quickActions = [
  { id: 'inspector', label: 'Element Inspector', icon: Eye, color: 'bg-cyan-500' },
  { id: 'screenshot', label: 'Screenshot', icon: Camera, color: 'bg-cyan-600' },
  { id: 'context', label: 'AI Context', icon: Sparkles, color: 'bg-cyan-400' },
  { id: 'debug', label: 'AI Debug', icon: Bug, color: 'bg-cyan-700' },
  { id: 'terminal', label: 'Terminal', icon: Terminal, color: 'bg-cyan-800' },
];

const MobileQuickActionsMenu: React.FC<MobileQuickActionsMenuProps> = ({
  isVisible,
  onToggle,
  onAction,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      onToggle();
    }
  };

  const handleActionSelect = (actionId: string) => {
    onAction(actionId);
    setIsExpanded(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      {/* Action buttons in upward semi-circle arc */}
      {isExpanded && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          {quickActions.map((action, index) => {
            // Create upward semi-circle from 225° to -45° (or 315°)
            const startAngle = 225; // Bottom-left
            const endAngle = -45; // Top-right (same as 315°)
            
            // Calculate angle span (270° total)
            const totalAngle = startAngle - endAngle;
            const angleStep = totalAngle / (quickActions.length - 1);
            const angle = startAngle - (index * angleStep);
            
            const radius = 120;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            
            return (
              <div
                key={action.id}
                className={`absolute w-14 h-14 ${action.color} rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 animate-scale-in`}
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${index * 100}ms`,
                }}
                onClick={() => handleActionSelect(action.id)}
              >
                <action.icon className="text-white" size={24} />
              </div>
            );
          })}
        </div>
      )}
      
      {/* Main centered toggle button */}
      <button
        onClick={handleToggle}
        className={`w-16 h-16 bg-cyan-400 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 border-4 border-cyan-300/50 ${
          isExpanded ? 'rotate-45 bg-cyan-500' : 'hover:bg-cyan-500'
        }`}
      >
        {isExpanded ? (
          <X className="text-white" size={28} />
        ) : (
          <div className="flex flex-col space-y-1">
            <div className="w-5 h-0.5 bg-white rounded"></div>
            <div className="w-5 h-0.5 bg-white rounded"></div>
            <div className="w-5 h-0.5 bg-white rounded"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default MobileQuickActionsMenu;
