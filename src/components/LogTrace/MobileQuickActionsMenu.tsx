
import React, { useState } from 'react';
import { Camera, Sparkles, Bug, Eye, X, Search, Menu, Plus } from 'lucide-react';

interface MobileQuickActionsMenuProps {
  isVisible: boolean;
  onToggle: () => void;
  onAction: (action: string) => void;
}

const quickActions = [
  { id: 'inspector', label: 'Inspector', icon: Eye },
  { id: 'screenshot', label: 'Screenshot', icon: Camera },
  { id: 'context', label: 'Context', icon: Sparkles },
  { id: 'debug', label: 'Debug', icon: Bug },
  { id: 'terminal', label: 'Terminal', icon: Search },
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

  // Calculate positions for fan layout - semi-circle above the main button
  const getActionPosition = (index: number) => {
    const totalActions = quickActions.length;
    const radius = 80; // Distance from center button
    const startAngle = 180; // Start angle in degrees (left)
    const endAngle = 0; // End angle in degrees (right)
    const angleRange = startAngle - endAngle; // 180 degrees total for semi-circle
    const angleStep = angleRange / (totalActions - 1);
    const angle = (startAngle - (index * angleStep)) * (Math.PI / 180); // Convert to radians
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return { x, y };
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      {/* Fan Action Icons - positioned above the center button */}
      {isExpanded && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4">
          {quickActions.map((action, index) => {
            const position = getActionPosition(index);
            
            return (
              <div
                key={action.id}
                className="absolute w-12 h-12 bg-gray-700 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 border-2 border-white/20 hover:border-white/40"
                style={{
                  left: position.x,
                  top: -position.y, // Negative Y to position above
                  transform: 'translate(-50%, -50%)',
                  animation: `fadeInScale 0.3s ease-out ${index * 0.05}s both`,
                }}
                onClick={() => handleActionSelect(action.id)}
              >
                <action.icon className="text-white" size={18} />
              </div>
            );
          })}
        </div>
      )}
      
      {/* Main center toggle button */}
      <button
        onClick={handleToggle}
        className={`w-16 h-16 bg-cyan-500 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 border-4 border-cyan-400/50 hover:bg-cyan-600 ${
          isExpanded ? 'rotate-45 bg-cyan-600 scale-110' : 'hover:scale-105'
        }`}
        style={{
          boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3)',
        }}
      >
        {isExpanded ? (
          <Plus className="text-white" size={24} />
        ) : (
          <Menu className="text-white" size={24} />
        )}
      </button>

      {/* Custom animations */}
      <style>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default MobileQuickActionsMenu;
