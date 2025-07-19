
import React, { useState } from 'react';
import { Camera, Sparkles, Bug, Eye, Terminal, X } from 'lucide-react';

interface MobileQuickActionsMenuProps {
  isVisible: boolean;
  onToggle: () => void;
  onAction: (action: string) => void;
}

const quickActions = [
  { id: 'inspector', label: 'Element Inspector', icon: Eye, color: 'bg-blue-500' },
  { id: 'screenshot', label: 'Screenshot', icon: Camera, color: 'bg-green-500' },
  { id: 'context', label: 'AI Context', icon: Sparkles, color: 'bg-purple-500' },
  { id: 'debug', label: 'AI Debug', icon: Bug, color: 'bg-red-500' },
  { id: 'terminal', label: 'Terminal', icon: Terminal, color: 'bg-orange-500' },
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons - spread in a fan pattern when expanded */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0">
          {quickActions.map((action, index) => {
            const angle = (index * 60) - 120; // Fan pattern from -120° to +120°
            const distance = 80;
            const x = Math.cos((angle * Math.PI) / 180) * distance;
            const y = Math.sin((angle * Math.PI) / 180) * distance;
            
            return (
              <div
                key={action.id}
                className={`absolute w-12 h-12 ${action.color} rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110`}
                style={{
                  right: -x,
                  bottom: -y,
                  transform: 'translate(50%, 50%)',
                }}
                onClick={() => handleActionSelect(action.id)}
              >
                <action.icon className="text-white" size={20} />
              </div>
            );
          })}
        </div>
      )}
      
      {/* Main toggle button */}
      <button
        onClick={handleToggle}
        className={`w-14 h-14 bg-yellow-400 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isExpanded ? 'rotate-45' : ''
        }`}
      >
        {isExpanded ? (
          <X className="text-black" size={24} />
        ) : (
          <div className="flex flex-col space-y-1">
            <div className="w-4 h-0.5 bg-black"></div>
            <div className="w-4 h-0.5 bg-black"></div>
            <div className="w-4 h-0.5 bg-black"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default MobileQuickActionsMenu;
