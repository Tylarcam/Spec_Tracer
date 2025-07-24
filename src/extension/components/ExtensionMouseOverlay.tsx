
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sanitizeText } from '@/utils/sanitization';
import { ElementInfo } from '@/shared/types';

interface ExtensionMouseOverlayProps {
  isActive: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  showElementInspector: boolean;
  overlayRef: React.RefObject<HTMLDivElement>;
}

const ExtensionMouseOverlay: React.FC<ExtensionMouseOverlayProps> = ({
  isActive,
  currentElement,
  mousePosition,
  showElementInspector,
  overlayRef,
}) => {
  if (!isActive || !currentElement || showElementInspector) return null;

  return (
    <div
      id="logtrace-overlay"
      ref={overlayRef}
      className="fixed pointer-events-none z-[2147483647] transform -translate-y-full -translate-x-1/2"
      style={{
        left: mousePosition.x,
        top: mousePosition.y - 10,
      }}
    >
      <Card className="bg-slate-900/95 border-cyan-500/50 backdrop-blur-md shadow-xl shadow-cyan-500/20">
        <div className="p-3 text-xs">
          <div className="flex items-center gap-2 mb-2">
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
            <div className="text-green-300 mb-1">
              .{currentElement.classes.map(c => sanitizeText(c)).join(' .')}
            </div>
          )}
          {currentElement.text && (
            <div className="text-gray-300 max-w-48 truncate">
              "{sanitizeText(currentElement.text)}"
            </div>
          )}
          <div className="text-cyan-300 mt-2 text-xs">
            Click to inspect • Ctrl+D to debug
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExtensionMouseOverlay;
