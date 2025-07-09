import React, { useState, useRef, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, Move } from 'lucide-react';
import { ElementInfo } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';

interface PinnedDetail {
  id: string;
  element: ElementInfo;
  position: { x: number; y: number };
  pinnedAt: { x: number; y: number };
}

interface PinnedDetailsProps {
  pinnedDetails: PinnedDetail[];
  onRemovePin: (id: string) => void;
  onUpdatePosition: (id: string, position: { x: number; y: number }) => void;
}

const PinnedDetails: React.FC<PinnedDetailsProps> = ({
  pinnedDetails,
  onRemovePin,
  onUpdatePosition,
}) => {
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    pinId: string | null;
    offset: { x: number; y: number };
  }>({
    isDragging: false,
    pinId: null,
    offset: { x: 0, y: 0 },
  });

  const handleMouseDown = useCallback((e: React.MouseEvent, pinId: string) => {
    e.preventDefault();
    const pin = pinnedDetails.find(p => p.id === pinId);
    if (!pin) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragState({
      isDragging: true,
      pinId,
      offset: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    });
  }, [pinnedDetails]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.pinId) return;

    const newPosition = {
      x: e.clientX - dragState.offset.x,
      y: e.clientY - dragState.offset.y,
    };

    // Keep within viewport bounds
    const maxX = window.innerWidth - 320; // card width
    const maxY = window.innerHeight - 200; // estimated card height
    
    newPosition.x = Math.max(0, Math.min(maxX, newPosition.x));
    newPosition.y = Math.max(0, Math.min(maxY, newPosition.y));

    onUpdatePosition(dragState.pinId, newPosition);
  }, [dragState, onUpdatePosition]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      pinId: null,
      offset: { x: 0, y: 0 },
    });
  }, []);

  React.useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return (
    <>
      {pinnedDetails.map((pin) => (
        <div
          key={pin.id}
          className="fixed pointer-events-auto z-40 w-80"
          style={{
            left: pin.pinnedAt.x,
            top: pin.pinnedAt.y,
          }}
        >
          <Card className="bg-slate-900/95 border-purple-500/50 backdrop-blur-md shadow-xl shadow-purple-500/20">
            <div className="p-4">
              {/* Header with drag handle */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="cursor-move p-1 rounded hover:bg-purple-500/20"
                    onMouseDown={(e) => handleMouseDown(e, pin.id)}
                  >
                    <Move className="w-4 h-4 text-purple-400" />
                  </div>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                    {pin.element.tag.toUpperCase()}
                  </Badge>
                </div>
                <Button
                  onClick={() => onRemovePin(pin.id)}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Element Details */}
              <div className="space-y-2 text-xs">
                {pin.element.id && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID:</span>
                    <span className="text-green-300 font-mono">#{sanitizeText(pin.element.id)}</span>
                  </div>
                )}
                {pin.element.classes.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Classes:</span>
                    <span className="text-green-300 font-mono text-right">
                      .{pin.element.classes.map(c => sanitizeText(c)).join(' .')}
                    </span>
                  </div>
                )}
                {pin.element.text && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Text:</span>
                    <span className="text-gray-300 text-right max-w-32 truncate">
                      "{sanitizeText(pin.element.text)}"
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Position:</span>
                  <span className="text-cyan-300 font-mono">
                    {pin.position.x}, {pin.position.y}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </>
  );
};

export default PinnedDetails;
