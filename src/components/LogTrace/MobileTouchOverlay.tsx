
import React from 'react';
import { ElementInfo } from '@/shared/types';

interface MobileTouchOverlayProps {
  isActive: boolean;
  currentElement: ElementInfo | null;
  touchPosition: { x: number; y: number };
}

const MobileTouchOverlay: React.FC<MobileTouchOverlayProps> = ({
  isActive,
  currentElement,
  touchPosition,
}) => {
  if (!isActive) return null;

  // Touch indicator for feedback
  const touchIndicator = (
    <div
      className="fixed pointer-events-none z-40"
      style={{
        left: touchPosition.x,
        top: touchPosition.y,
        transform: 'translate(-50%, -50%)',
        width: '24px',
        height: '24px',
        border: '2px solid #22c55e',
        borderRadius: '50%',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
      }}
    />
  );

  // Element highlight
  const elementHighlight = currentElement?.element && (
    <div
      className="fixed pointer-events-none z-30"
      style={{
        left: currentElement.element.getBoundingClientRect().left,
        top: currentElement.element.getBoundingClientRect().top,
        width: currentElement.element.getBoundingClientRect().width,
        height: currentElement.element.getBoundingClientRect().height,
        border: '2px solid #06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderRadius: '4px',
      }}
    />
  );

  // Element info tooltip
  const elementInfo = currentElement && (
    <div
      className="fixed z-40 pointer-events-none"
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
          Tap to select
        </div>
      </div>
    </div>
  );

  return (
    <>
      {touchIndicator}
      {elementHighlight}
      {elementInfo}
    </>
  );
};

export default MobileTouchOverlay;
