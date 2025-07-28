import React, { useEffect, useRef, useState } from 'react';
import { ElementInfo } from '@/shared/types';

interface ExtensionMouseOverlayProps {
  isActive: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  showElementInspector: boolean;
  overlayRef: React.RefObject<HTMLDivElement>;
  onPin: () => void;
  onQuickAction: (action: string, element: ElementInfo | null) => void;
  onElementClick: () => void;
  onRightClick?: (e: React.MouseEvent) => void;
  isHoverPaused?: boolean;
}

const ExtensionMouseOverlay: React.FC<ExtensionMouseOverlayProps> = ({
  isActive,
  currentElement,
  mousePosition,
  showElementInspector,
  overlayRef,
  onPin,
  onQuickAction,
  onElementClick,
  onRightClick,
  isHoverPaused = false,
}) => {
  const [elementColors, setElementColors] = useState<{
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  }>({
    backgroundColor: '#1e293b',
    textColor: '#e2e8f0',
    borderColor: '#06b6d4',
  });

  // Track mouse movement and detect elements
  useEffect(() => {
    if (!isActive || isHoverPaused) return;

    const handleMouseMove = (e: MouseEvent) => {
      // This will be handled by the parent component
    };

    const handleMouseClick = (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        onElementClick();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (onRightClick) {
        onRightClick(e as any);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleMouseClick);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleMouseClick);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isActive, isHoverPaused, onElementClick, onRightClick]);

  // Extract colors from current element
  useEffect(() => {
    if (!currentElement) return;

    try {
      const targetElement = document.elementFromPoint(mousePosition.x, mousePosition.y);
      if (targetElement) {
        const computedStyle = window.getComputedStyle(targetElement);
        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;
        const borderColor = computedStyle.borderColor;

        setElementColors({
          backgroundColor: bgColor && bgColor !== 'rgba(0, 0, 0, 0)' ? bgColor : '#1e293b',
          textColor: textColor || '#e2e8f0',
          borderColor: borderColor || '#06b6d4',
        });
      }
    } catch (error) {
      console.error('Error extracting colors:', error);
    }
  }, [currentElement, mousePosition]);

  if (!isActive || !currentElement) return null;

  const cardWidth = 280;
  const cardHeight = 120;
  const offset = 10;

  // Calculate position to keep card within viewport
  let cardX = mousePosition.x + offset;
  let cardY = mousePosition.y + offset;

  // Adjust if card would go off-screen
  if (cardX + cardWidth > window.innerWidth) {
    cardX = mousePosition.x - cardWidth - offset;
  }
  if (cardY + cardHeight > window.innerHeight) {
    cardY = mousePosition.y - cardHeight - offset;
  }

  // Ensure minimum distance from edges
  cardX = Math.max(10, Math.min(cardX, window.innerWidth - cardWidth - 10));
  cardY = Math.max(10, Math.min(cardY, window.innerHeight - cardHeight - 10));

  const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(currentElement.tag) || 
                       (currentElement.classes && currentElement.classes.includes('interactive'));

  return (
    <div
      ref={overlayRef}
      className="fixed pointer-events-none z-[2147483647]"
      style={{
        left: cardX,
        top: cardY,
        width: cardWidth,
        height: cardHeight,
      }}
    >
      <div 
        className="bg-slate-900/95 border border-cyan-500/50 rounded-lg shadow-xl p-3 backdrop-blur-sm pointer-events-auto"
        onContextMenu={onRightClick}
        style={{
          borderColor: elementColors.borderColor + '80',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="text-cyan-400 font-mono text-sm">
              {currentElement.tag}
              {currentElement.id && <span className="text-yellow-400">#{currentElement.id}</span>}
            </div>
            {isInteractive && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-bold">
                INTERACTIVE
              </span>
            )}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => onPin()}
              className="p-1 hover:bg-cyan-500/20 rounded text-cyan-400 text-xs"
              title="Pin Element"
            >
              📌
            </button>
            <button
              onClick={() => onQuickAction('debug', currentElement)}
              className="p-1 hover:bg-yellow-500/20 rounded text-yellow-400 text-xs"
              title="AI Debug"
            >
              🤖
            </button>
          </div>
        </div>
        
        <div className="space-y-1 text-xs">
          {currentElement.classes && currentElement.classes.length > 0 && (
            <div className="text-purple-300 font-mono">
              .{currentElement.classes.join('.')}
            </div>
          )}
          
          {currentElement.text && (
            <div className="text-blue-300 italic truncate">
              "{currentElement.text}"
            </div>
          )}
          
          {currentElement.parentPath && (
            <div className="text-gray-400 text-xs truncate">
              {currentElement.parentPath} → {currentElement.tag}
            </div>
          )}
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-xs text-gray-400">
            Right-click for quick actions • Left-click to inspect
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionMouseOverlay;
