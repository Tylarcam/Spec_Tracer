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
  if (!isActive) return null;

  return (
    <>
      {/* Green cursor circle - always show when active */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: 'translate(-50%, -50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #22c55e',
          borderRadius: '50%',
        }}
      />
      
      {/* Blue element highlighter - show when hovering over an element */}
      {currentElement?.element && (
        <div
          className="fixed pointer-events-none z-40"
          style={{
            left: currentElement.element.getBoundingClientRect().left,
            top: currentElement.element.getBoundingClientRect().top,
            width: currentElement.element.getBoundingClientRect().width,
            height: currentElement.element.getBoundingClientRect().height,
            border: '2px solid #06b6d4',
            background: 'rgba(6, 182, 212, 0.1)',
            boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)',
          }}
        />
      )}

      {/* Info overlay card - show when hovering over an element */}
      {currentElement && (
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
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default MouseOverlay;

