
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { X, Eye, Bug, Copy, MoreVertical, Pin } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ElementInfo } from '@/shared/types';
import { formatElementDataForCopy, formatElementDataAsSelector, formatElementDataAsJSON } from '@/utils/elementDataFormatter';
import { useToast } from '@/hooks/use-toast';

interface ElementInspectorProps {
  isVisible: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number } | null;
  onClose: () => void;
  onDebug: () => void;
  onShowMoreDetails: () => void;
  panelRef?: React.RefObject<HTMLDivElement>;
  isExtensionMode?: boolean;
  isDraggable?: boolean;
  isPinned?: boolean;
  onPin?: () => void;
  currentDebugCount?: number;
  maxDebugCount?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isStatic?: boolean;
  staticPosition?: { x: number; y: number } | null;
  zIndex?: number;
  inspectorId?: string;
  onBringToFront?: () => void;
}

const ElementInspector: React.FC<ElementInspectorProps> = ({
  isVisible,
  currentElement,
  mousePosition,
  onClose,
  onDebug,
  onShowMoreDetails,
  panelRef,
  isExtensionMode = false,
  isDraggable = false,
  isPinned = false,
  onPin,
  currentDebugCount = 0,
  maxDebugCount = 5,
  onMouseEnter,
  onMouseLeave,
  isStatic = false,
  staticPosition = null,
  zIndex = 10,
  inspectorId,
  onBringToFront,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const zIndexClass = `z-[${zIndex}]`;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDraggable) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - (staticPosition?.x || mousePosition?.x || 0),
        y: e.clientY - (staticPosition?.y || mousePosition?.y || 0),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isStatic) {
      e.stopPropagation();
    }
  };

  const handleBringToFront = () => {
    if (onBringToFront) {
      onBringToFront();
    }
  };

  const cardStyle = {
    left: isStatic ? `${staticPosition?.x || mousePosition?.x || 0}px` : `${mousePosition?.x || 0}px`,
    top: isStatic ? `${staticPosition?.y || mousePosition?.y || 0}px` : `${mousePosition?.y || 0}px`,
  };

  const handleCopyFormatted = () => {
    if (currentElement) {
      const formattedData = formatElementDataForCopy(currentElement, mousePosition);
      navigator.clipboard.writeText(formattedData);
      toast({
        title: "Element details copied",
        description: "Formatted element information has been copied to clipboard",
      });
    }
  };

  const handleCopySelector = () => {
    if (currentElement) {
      const selector = formatElementDataAsSelector(currentElement);
      navigator.clipboard.writeText(selector);
      toast({
        title: "CSS selector copied",
        description: `Selector "${selector}" has been copied to clipboard`,
      });
    }
  };

  const handleCopyJSON = () => {
    if (currentElement) {
      const jsonData = formatElementDataAsJSON(currentElement, mousePosition);
      navigator.clipboard.writeText(jsonData);
      toast({
        title: "JSON data copied",
        description: "Element data as JSON has been copied to clipboard",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <Card 
      ref={panelRef}
      className={`bg-slate-900/95 border-2 ${zIndexClass} ${
        isStatic ? 'absolute' : 'fixed'
      } transition-all duration-200 ease-in-out shadow-xl backdrop-blur-sm`}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleBringToFront}
    >
      <CardContent className="relative p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="uppercase text-xs font-bold border-green-500/50 text-green-400">
              {currentElement?.tag || 'Unknown'}
            </Badge>
            {currentElement?.id && (
              <Badge variant="secondary" className="text-xs">
                #{currentElement.id}
              </Badge>
            )}
            {currentElement?.classes && currentElement.classes.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                .{currentElement.classes.join('.')}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onPin && (
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onPin}>
                <Pin className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardContent className="p-3 space-y-3">
        <div className="space-y-1">
          <div className="text-xs text-gray-400">Text Content</div>
          <div className="text-sm text-gray-200">{currentElement?.text?.slice(0, 50) || 'N/A'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-400">Parent Path</div>
          <div className="text-sm text-gray-200">{currentElement?.parentPath || 'N/A'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-400">Size</div>
          <div className="text-sm text-gray-200">
            {currentElement?.size ? `${currentElement.size.width}x${currentElement.size.height}` : 'N/A'}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-700/50">
          <Button
            onClick={handleCopyFormatted}
            variant="outline"
            size="sm"
            className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/10"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy Details
          </Button>
          <Button
            onClick={handleCopySelector}
            variant="outline"
            size="sm"
            className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy Selector
          </Button>
          <Button
            onClick={handleCopyJSON}
            variant="outline"
            size="sm"
            className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy JSON
          </Button>
        </div>
        
        <div className="flex gap-2 pt-2 border-t border-slate-700/50">
          <Button
            onClick={onDebug}
            variant="secondary"
            size="sm"
            className="flex-1 text-yellow-400 hover:bg-yellow-500/10"
          >
            <Bug className="h-3 w-3 mr-1" />
            Debug with AI
          </Button>
          {currentDebugCount !== undefined && maxDebugCount !== undefined && (
            <div className="text-xs text-gray-400 self-center">
              {currentDebugCount}/{maxDebugCount}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ElementInspector;
