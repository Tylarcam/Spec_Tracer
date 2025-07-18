
import React, { useState, useRef } from 'react';
import { ElementInfo } from '@/shared/types';
import { Camera, Sparkles, Bug, Eye } from 'lucide-react';

interface MobileTouchOverlayProps {
  isActive: boolean;
  currentElement: ElementInfo | null;
  touchPosition: { x: number; y: number };
  showQuickActions: boolean;
  isLongPressActive: boolean;
  onActionSelect: (action: string) => void;
}

const quickActions = [
  { id: 'details', label: 'View', icon: Eye, color: 'bg-blue-500' },
  { id: 'screenshot', label: 'Shot', icon: Camera, color: 'bg-green-500' },
  { id: 'context', label: 'Gen', icon: Sparkles, color: 'bg-purple-500' },
  { id: 'debug', label: 'Fix', icon: Bug, color: 'bg-red-500' },
];

const MobileTouchOverlay: React.FC<MobileTouchOverlayProps> = ({
  isActive,
  currentElement,
  touchPosition,
  showQuickActions,
  isLongPressActive,
  onActionSelect,
}) => {
  const [highlightedAction, setHighlightedAction] = useState<string | null>(null);

  if (!isActive) return null;

  // Touch indicator - larger for mobile
  const touchIndicator = (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: touchPosition.x,
        top: touchPosition.y,
        transform: 'translate(-50%, -50%)',
        width: '32px',
        height: '32px',
        border: '3px solid #22c55e',
        borderRadius: '50%',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
      }}
    />
  );

  // Element highlight - more prominent for mobile
  const elementHighlight = currentElement?.element && (
    <div
      className="fixed pointer-events-none z-40"
      style={{
        left: currentElement.element.getBoundingClientRect().left,
        top: currentElement.element.getBoundingClientRect().top,
        width: currentElement.element.getBoundingClientRect().width,
        height: currentElement.element.getBoundingClientRect().height,
        border: '3px solid #06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderRadius: '4px',
      }}
    />
  );

  // Quick actions radial menu for long press
  const quickActionsMenu = showQuickActions && isLongPressActive && (
    <div
      className="fixed z-60 pointer-events-none"
      style={{
        left: touchPosition.x,
        top: touchPosition.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {quickActions.map((action, index) => {
        const angle = (index * 90) - 45; // Spread actions in a cross pattern
        const distance = 80; // Distance from center
        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const y = Math.sin((angle * Math.PI) / 180) * distance;
        
        const isHighlighted = highlightedAction === action.id;

        return (
          <div
            key={action.id}
            data-quick-action
            data-action={action.id}
            className={`absolute pointer-events-auto rounded-full border-2 border-white shadow-lg transition-all duration-200 ${
              action.color
            } ${
              isHighlighted 
                ? 'w-16 h-16 border-4' 
                : 'w-12 h-12'
            }`}
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              setHighlightedAction(action.id);
            }}
            onTouchEnd={() => onActionSelect(action.id)}
          >
            <div className="flex items-center justify-center w-full h-full">
              <action.icon 
                className="text-white" 
                size={isHighlighted ? 24 : 18} 
              />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white font-semibold whitespace-nowrap">
              {action.label}
            </div>
          </div>
        );
      })}
      
      {/* Center circle to indicate active state */}
      <div className="absolute w-8 h-8 bg-slate-800 border-2 border-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-full h-full bg-cyan-400 rounded-full animate-pulse opacity-50" />
      </div>
    </div>
  );

  // Touch feedback for element info
  const elementInfo = currentElement && !showQuickActions && (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: touchPosition.x,
        top: touchPosition.y - 60,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="bg-slate-900/95 border border-cyan-500/50 rounded-lg px-3 py-2 shadow-xl">
        <div className="text-cyan-400 font-semibold text-sm">
          {currentElement.tag}
        </div>
        {currentElement.id && (
          <div className="text-green-400 text-xs">
            #{currentElement.id}
          </div>
        )}
        <div className="text-orange-300 text-xs mt-1">
          Double-tap to inspect
        </div>
      </div>
    </div>
  );

  return (
    <>
      {touchIndicator}
      {elementHighlight}
      {quickActionsMenu}
      {elementInfo}
    </>
  );
};

export default MobileTouchOverlay;
