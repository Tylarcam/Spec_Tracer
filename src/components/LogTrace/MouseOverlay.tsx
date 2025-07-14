
import React from 'react';
import { ElementInfo } from '@/shared/types';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { sanitizeText } from '@/utils/sanitization';

interface MouseOverlayProps {
  isActive: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  overlayRef: React.RefObject<HTMLDivElement>;
  onElementClick: () => void;
}

const MouseOverlay: React.FC<MouseOverlayProps> = ({
  isActive,
  currentElement,
  mousePosition,
  overlayRef,
  onElementClick,
}) => {
  if (!isActive || !currentElement) return null;

  return (
    <div
      id="logtrace-overlay"
      ref={overlayRef}
      className="fixed pointer-events-auto z-40 cursor-pointer transform -translate-y-full -translate-x-1/2"
      style={{
        left: mousePosition.x,
        top: mousePosition.y - 10,
      }}
      onClick={onElementClick}
    >
      {/* Halo effect */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          boxShadow: '0 0 32px 12px rgba(34,211,238,0.35), 0 0 0 4px rgba(34,211,238,0.15)',
          background: 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0.08) 80%, transparent 100%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      <Card className="relative z-10 bg-slate-900/95 border-cyan-500/50 backdrop-blur-md shadow-xl shadow-cyan-500/20 hover:border-cyan-400/70 transition-colors">
        <div className="p-2 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 text-xs">
              {currentElement.tag}
            </Badge>
            {currentElement.id && (
              <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                #{sanitizeText(currentElement.id)}
              </Badge>
            )}
          </div>
          {currentElement.classes.length > 0 && (
            <div className="text-green-300 mb-1 max-w-48 truncate">
              .{currentElement.classes.map(c => sanitizeText(c)).join(' .')}
            </div>
          )}
          {currentElement.text && (
            <div className="text-gray-300 max-w-48 truncate mb-1">
              "{sanitizeText(currentElement.text)}"
            </div>
          )}
          <div className="text-cyan-300 text-xs flex items-center justify-between">
            <span>Click for details</span>
            <span className="text-purple-300">Ctrl+D debug</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MouseOverlay;
