
import React, { useState } from 'react';
import { Camera, Sparkles, Bug, Eye, Terminal, X, Monitor, Search, Plus, ChevronLeft, ChevronRight, Home } from 'lucide-react';

interface MobileQuickActionsMenuProps {
  isVisible: boolean;
  onToggle: () => void;
  onAction: (action: string) => void;
}

const quickActions = [
  { id: 'inspector', label: 'Element Inspector', icon: Eye, color: 'bg-white' },
  { id: 'screenshot', label: 'Screenshot', icon: Camera, color: 'bg-white' },
  { id: 'context', label: 'AI Context', icon: Sparkles, color: 'bg-white' },
  { id: 'debug', label: 'AI Debug', icon: Bug, color: 'bg-white' },
  { id: 'terminal', label: 'Terminal', icon: Terminal, color: 'bg-white' },
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
      {/* Horizontal Fan Background */}
      {isExpanded && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          {/* Semi-circular cyan fan background */}
          <div 
            className="w-80 h-40 bg-gradient-to-t from-cyan-500 to-cyan-600 rounded-t-full shadow-2xl border-2 border-cyan-400/30"
            style={{
              clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 50% 50%, 0 0)',
            }}
          />
          
          {/* Action buttons distributed along horizontal arc */}
          {quickActions.map((action, index) => {
            // Create horizontal arc from 180° to 0° (left to right)
            const startAngle = 180; // Left
            const endAngle = 0; // Right
            const totalAngle = Math.abs(endAngle - startAngle);
            const angleStep = totalAngle / (quickActions.length - 1);
            const angle = startAngle + (index * angleStep);
            
            const radius = 140; // Slightly larger radius for better distribution
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            
            return (
              <div
                key={action.id}
                className={`absolute w-12 h-12 ${action.color} rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 border-2 border-cyan-200/50`}
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${index * 100}ms`,
                }}
                onClick={() => handleActionSelect(action.id)}
              >
                <action.icon className="text-slate-800" size={20} />
              </div>
            );
          })}
          
          {/* Navigation and control buttons within the fan */}
          <div className="absolute inset-0 flex items-center justify-between px-8">
            {/* Left side controls */}
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <ChevronLeft className="w-4 h-4 text-slate-800" />
              </button>
              <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <X className="w-4 h-4 text-slate-800" />
              </button>
            </div>
            
            {/* Center controls */}
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <Search className="w-4 h-4 text-slate-800" />
              </button>
              <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 text-slate-800" />
              </button>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <Home className="w-4 h-4 text-slate-800" />
              </button>
              <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <ChevronRight className="w-4 h-4 text-slate-800" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main centered toggle button */}
      <button
        onClick={handleToggle}
        className={`w-16 h-16 bg-cyan-500 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 border-4 border-cyan-400/50 hover:bg-cyan-600 ${
          isExpanded ? 'rotate-45 bg-cyan-600' : ''
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
