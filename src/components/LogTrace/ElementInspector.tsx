import React, { useState, useRef } from 'react';
import { ElementInfo } from '@/shared/types';
import { Button } from '../ui/button';
import { Zap, Pin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useDraggable } from '@/shared/hooks/useDraggable';
import DebugModal from './DebugModal';

interface ElementInspectorProps {
  isVisible: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  onDebug?: () => void;
  onClose: () => void;
  panelRef: React.RefObject<HTMLDivElement>;
  isExtensionMode?: boolean;
  isDraggable?: boolean;
  isPinned?: boolean;
  onPin?: () => void;
  onShowMoreDetails?: () => void;
  currentDebugCount?: number;
  maxDebugCount?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ElementInspector: React.FC<ElementInspectorProps> = ({
  isVisible,
  currentElement,
  mousePosition,
  onDebug,
  onClose,
  panelRef,
  isExtensionMode = false,
  isDraggable = false,
  isPinned = false,
  onPin,
  onShowMoreDetails,
  currentDebugCount = 0,
  maxDebugCount = 3,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { toast } = useToast();
  const [showDebugModal, setShowDebugModal] = useState(false);
  const { adjustedPosition } = useDraggable(panelRef, mousePosition, isDraggable);
  const [debugResponse, setDebugResponse] = useState<string | null>(null);

  const handleDebugClick = () => {
    if (currentDebugCount >= maxDebugCount) {
      toast({
        title: 'Debug Limit Reached',
        description: `You've reached the maximum of ${maxDebugCount} debug requests. Please upgrade for unlimited access.`,
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Debug button clicked:', { currentElement, mousePosition });
    onDebug?.();
  };

  const handleDebugResponse = (response: string) => {
    setDebugResponse(response);
  };

  return (
    <>
      {isVisible && currentElement && (
        <div
          ref={panelRef}
          className={cn(
            "fixed z-[100] bg-slate-900/95 border border-green-500/50 rounded-lg p-4 shadow-lg min-w-[300px] max-w-[400px]",
            isDraggable && "cursor-move",
            isPinned && "border-blue-500/50"
          )}
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
            maxHeight: '80vh',
            overflow: 'auto'
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Element Inspector
          </h3>
          <div className="text-sm text-gray-300 space-y-1">
            <div><strong>Tag:</strong> {currentElement.tag}</div>
            {currentElement.id && <div><strong>ID:</strong> {currentElement.id}</div>}
            {currentElement.classes.length > 0 && (
              <div><strong>Classes:</strong> {currentElement.classes.join(', ')}</div>
            )}
            {currentElement.text && (
              <div><strong>Text:</strong> {currentElement.text.substring(0, 100)}...</div>
            )}
            {currentElement.size && (
              <div>
                <strong>Size:</strong> {currentElement.size.width}x{currentElement.size.height}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleDebugClick}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
              disabled={currentDebugCount >= maxDebugCount}
            >
              <Zap className="h-4 w-4 mr-2" />
              Debug ({currentDebugCount}/{maxDebugCount})
            </Button>
            
            {onPin && (
              <Button
                onClick={onPin}
                size="sm"
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                <Pin className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              onClick={onClose}
              size="sm"
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <DebugModal
        isOpen={showDebugModal}
        onClose={() => setShowDebugModal(false)}
        currentElement={currentElement}
        mousePosition={mousePosition}
        onDebugResponse={handleDebugResponse}
      />
    </>
  );
};

export default ElementInspector;
