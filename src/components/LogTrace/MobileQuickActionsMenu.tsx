
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
      {/* Action buttons - arranged in upward semi-circle arc from 225° to -45° (315°) */}
      {isExpanded && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          {quickActions.map((action, index) => {
            // Create upward semi-circle arc from 225° to -45° (315°)
            const startAngle = 225; // Bottom-left
            const endAngle = -45; // Top-right (equivalent to 315°)
            
            // Calculate total arc span (270° clockwise)
            let totalAngle;
            if (endAngle < 0) {
              totalAngle = startAngle - endAngle; // 225 - (-45) = 270°
            } else {
              totalAngle = startAngle + (360 - endAngle);
            }
            
            const angleStep = totalAngle / (quickActions.length - 1);
            let angle = startAngle - (index * angleStep);
            
            // Normalize angle to 0-360 range
            if (angle < 0) angle += 360;
            
            const radius = 120; // Distance from FAB center
            
            // Convert to radians and calculate position
            const radian = (angle * Math.PI) / 180;
            const x = Math.cos(radian) * radius;
            const y = -Math.sin(radian) * radius; // Negative because CSS Y increases downward
            
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
          
          {/* Background overlay for visual feedback */}
          <div 
            className="absolute inset-0 w-80 h-80 -left-40 -top-40 rounded-full bg-cyan-900/10 border border-cyan-500/20"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      )}
      
      {/* Main centered FAB toggle button */}
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
