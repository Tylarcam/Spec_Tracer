

import React, { useState } from 'react';
import { Camera, Sparkles, Bug, Eye, X, Search, Menu, Plus } from 'lucide-react';

interface MobileQuickActionsMenuProps {
  isVisible: boolean;
  onToggle: () => void;
  onAction: (action: string) => void;
}

const quickActions = [
  { id: 'inspector', label: 'Inspector', icon: Eye },      // Open element inspector
  { id: 'screenshot', label: 'Screenshot', icon: Camera }, // Take screenshot
  { id: 'context', label: 'Context', icon: Sparkles },     // Generate context
  { id: 'debug', label: 'Debug', icon: Bug },              // Open AI debug modal
  { id: 'terminal', label: 'Terminal', icon: Search },     // Open terminal panel
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
      {/* Main Fan Component */}
      {isExpanded && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          {/* Semi-circular fan background - adjusted to 240x108 */}
          <div 
            className="w-60 h-27 bg-gradient-to-t from-cyan-400 to-cyan-500 shadow-lg border border-cyan-300/50"
            style={{
              clipPath: 'polygon(0 100%, 100% 100%, 100% 40%, 85% 25%, 70% 15%, 50% 8%, 30% 15%, 15% 25%, 0 40%)',
              borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
            }}
          />
          
          {/* Grouped Action Icons - positioned to align with center button */}
          <div className="absolute inset-0 flex items-center justify-center">
            {quickActions.map((action, index) => {
              // Position 5 icons along the fan curve, perfectly aligned with center button
              const positions = [
                { x: -70, y: -30 },  // Left side - inspector icon
                { x: -35, y: -35 },  // Left center - screenshot icon
                { x: 0, y: -40 },    // Center - context icon (directly above button)
                { x: 35, y: -35 },   // Right center - debug icon
                { x: 70, y: -30 },   // Right side - terminal icon
              ];
              
              const position = positions[index];
              
              return (
                <div
                  key={action.id}
                  className="absolute w-10 h-10 bg-gray-700 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 border border-white/30"
                  style={{
                    left: position.x,
                    top: position.y,
                    transform: 'translate(-50%, -50%)',
                    animationDelay: `${index * 100}ms`,
                  }}
                  onClick={() => handleActionSelect(action.id)}
                >
                  <action.icon className="text-white" size={16} />
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Single centered toggle button */}
      <button
        onClick={handleToggle}
        className={`w-16 h-16 bg-cyan-500 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 border-4 border-cyan-400/50 hover:bg-cyan-600 ${
          isExpanded ? 'rotate-45 bg-cyan-600' : ''
        }`}
      >
        {isExpanded ? (
          <Plus className="text-white" size={24} />
        ) : (
          <Menu className="text-white" size={24} />
        )}
      </button>
    </div>
  );
};

export default MobileQuickActionsMenu;
