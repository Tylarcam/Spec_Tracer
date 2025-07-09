
import React from 'react';
import { ElementInfo } from '@/shared/types';

interface MouseOverlayProps {
  isActive: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  overlayRef: React.RefObject<HTMLDivElement>;
}

const MouseOverlay: React.FC<MouseOverlayProps> = ({
  isActive,
  currentElement,
  mousePosition,
  overlayRef,
}) => {
  if (!isActive || !currentElement) return null;

  return (
    <div
      id="logtrace-overlay"
      ref={overlayRef}
      className="fixed pointer-events-none z-40"
      style={{
        left: mousePosition.x + 10,
        top: mousePosition.y + 10,
      }}
    >
      <div className="bg-slate-900/95 border border-green-500/50 rounded-lg p-3 text-sm max-w-xs">
        <div className="text-cyan-400 font-semibold">{currentElement.tag}</div>
        {currentElement.id && (
          <div className="text-green-300">#{currentElement.id}</div>
        )}
        {currentElement.classes.length > 0 && (
          <div className="text-green-300">.{currentElement.classes.join('.')}</div>
        )}
        {currentElement.text && (
          <div className="text-gray-300 mt-1 truncate">"{currentElement.text}"</div>
        )}
      </div>
    </div>
  );
};

export default MouseOverlay;
