import React, { useRef, useLayoutEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sanitizeText } from '@/utils/sanitization';
import { ElementInfo } from '@/shared/types';
import { Camera, Sparkles, Bug, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatElementDataForCopy } from '@/utils/elementDataFormatter';
import { useToast } from '@/hooks/use-toast';

/**
 * Extracts up to three unique, non-transparent color-related CSS property values from the computed styles of a given HTML element.
 *
 * @param element - The target HTML element from which to extract color properties.
 * @returns An array of objects, each containing a CSS property name and its corresponding color value.
 */
function extractColorsFromElement(element: HTMLElement): { property: string; value: string }[] {
  if (!element) return [];
  const styles = window.getComputedStyle(element);
  const colorProperties = [
    'color',
    'background-color',
    'border-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'text-decoration-color',
    'fill',
    'stroke',
  ];
  const colors: { property: string; value: string }[] = [];
  colorProperties.forEach(property => {
    const value = styles.getPropertyValue(property);
    if (value && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)' && value !== 'initial') {
      colors.push({ property, value: value.trim() });
    }
  });
  // Remove duplicates and limit to 3
  const uniqueColors = colors.filter((color, idx, arr) =>
    arr.findIndex(c => c.value === color.value) === idx
  );
  return uniqueColors.slice(0, 3);
}

interface ExtensionMouseOverlayProps {
  isActive: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  showElementInspector: boolean;
  overlayRef: React.RefObject<HTMLDivElement>;
  onPin?: () => void;
  onQuickAction?: (action: 'details' | 'screenshot' | 'context' | 'debug' | 'copy', element: ElementInfo | null) => void;
  onElementClick?: () => void;
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
}) => {
  if (!isActive) return null;

  // Add the toast hook
  const { toast } = useToast();

  // Extract up to 3 unique colors from the hovered element
  const colors = currentElement?.element ? extractColorsFromElement(currentElement.element) : [];

  // Keep info card in viewport
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardPos, setCardPos] = useState<{ left: number; top: number; below?: boolean }>({ left: mousePosition.x, top: mousePosition.y - 10, below: false });

  useLayoutEffect(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const cardRect = card.getBoundingClientRect();
    const padding = 8;
    let left = mousePosition.x;
    let top = mousePosition.y - 10;
    let below = false;
    if (left + cardRect.width / 2 > window.innerWidth - padding) {
      left = window.innerWidth - cardRect.width / 2 - padding;
    }
    if (left - cardRect.width / 2 < padding) {
      left = cardRect.width / 2 + padding;
    }
    if (top - cardRect.height < padding) {
      top = mousePosition.y + 20;
      below = true;
    }
    if (top + cardRect.height > window.innerHeight - padding) {
      top = window.innerHeight - cardRect.height - padding;
    }
    setCardPos({ left, top, below });
  }, [mousePosition.x, mousePosition.y, currentElement]);

  // Quick Actions logic
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickActionPos, setQuickActionPos] = useState<{ left: number; top: number }>({ left: mousePosition.x, top: mousePosition.y - 64 });

  useLayoutEffect(() => {
    // Position quick actions above the overlay card
    setQuickActionPos({ left: mousePosition.x, top: mousePosition.y - 64 });
  }, [mousePosition.x, mousePosition.y, currentElement]);

  const handleQuickAction = (action: 'details' | 'screenshot' | 'context' | 'debug' | 'copy') => {
    setShowQuickActions(false);
    
    if (action === 'copy' && currentElement) {
      handleElementCopy(currentElement);
    } else if (onQuickAction) {
      onQuickAction(action, currentElement);
    }
  };

  // New handler function for copying element data
  const handleElementCopy = async (element: ElementInfo) => {
    try {
      const formattedData = formatElementDataForCopy(element, mousePosition);
      await navigator.clipboard.writeText(formattedData);
      
      // Show success toast
      toast({
        title: 'Element Data Copied',
        description: 'Element identifying data copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy element data:', error);
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy element data to clipboard',
        variant: 'destructive',
      });
    }
  };

  // Show quick actions when hovering overlay card
  const handleOverlayMouseEnter = () => setShowQuickActions(true);
  const handleOverlayMouseLeave = () => setShowQuickActions(false);

  // Placeholder for pin/review action
  const handleOverlayClick = () => {
    if (onPin) onPin();
  };

  return (
    <>
      {/* Green cursor circle */}
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

      {/* Simple blue element border - no halo or glow effects */}
      {currentElement?.element && (
        <div
          className="fixed pointer-events-none z-40"
          style={{
            left: currentElement.element.getBoundingClientRect().left,
            top: currentElement.element.getBoundingClientRect().top,
            width: currentElement.element.getBoundingClientRect().width,
            height: currentElement.element.getBoundingClientRect().height,
            border: '2px solid #06b6d4',
          }}
        />
      )}

      {/* Quick Actions Modal */}
      {currentElement && showQuickActions && !showElementInspector && (
        <div
          style={{ position: 'absolute', left: quickActionPos.left, top: quickActionPos.top, zIndex: 1050 }}
          className="flex items-center bg-slate-900/95 border border-cyan-700 rounded-full shadow-lg px-2 py-1 gap-1"
        >
          <button
            onClick={() => handleQuickAction('copy')}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
            style={{ minWidth: 56 }}
            type="button"
          >
            <Copy className="h-4 w-4 text-cyan-300" />
            Copy
          </button>
          <button
            onClick={() => handleQuickAction('details')}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
            style={{ minWidth: 56 }}
            type="button"
          >
            <Eye className="h-4 w-4 text-cyan-300" />
            View
          </button>
          <button
            onClick={() => handleQuickAction('context')}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
            style={{ minWidth: 56 }}
            type="button"
          >
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Gen
          </button>
          <button
            onClick={() => handleQuickAction('debug')}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
            style={{ minWidth: 56 }}
            type="button"
          >
            <Bug className="h-4 w-4 text-cyan-300" />
            Fix
          </button>
          <button
            onClick={() => handleQuickAction('screenshot')}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
            style={{ minWidth: 56 }}
            type="button"
          >
            <Camera className="h-4 w-4 text-cyan-300" />
            Shot
          </button>
        </div>
      )}

      {/* Info overlay card (with mouse events to show quick actions) */}
      {currentElement && !showElementInspector && (
        <div
          id="logtrace-overlay"
          ref={node => {
            if (cardRef) cardRef.current = node;
            if (overlayRef && 'current' in overlayRef) (overlayRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className={`fixed pointer-events-auto z-40 cursor-pointer transform -translate-x-1/2 ${cardPos.below ? '' : '-translate-y-full'}`}
          style={{
            left: cardPos.left,
            top: cardPos.top,
          }}
          onClick={onElementClick}
          onMouseEnter={handleOverlayMouseEnter}
          onMouseLeave={handleOverlayMouseLeave}
        >
          <Card className="bg-slate-900/95 border-cyan-500/50 shadow-xl hover:border-cyan-400/70 transition-colors">
            <div className="p-3 text-xs">
              <div className="flex items-center gap-2 mb-2">
                {/* Tag name badge */}
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 text-xs">
                  {currentElement.tag}
                </Badge>
                {/* Event Listeners badge: shows count or 'No events' */}
                <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                  {(() => {
                    const el = currentElement.element as any;
                    const listeners = [
                      'onclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmouseout',
                      'onmouseenter', 'onmouseleave', 'onkeydown', 'onkeyup', 'oninput',
                      'onchange', 'onfocus', 'onblur', 'onsubmit', 'onload', 'onerror'
                    ];
                    const active = listeners.filter(l => typeof el?.[l] === 'function');
                    return active.length > 0 ? `${active.length} events` : 'No events';
                  })()}
                </Badge>
                {/* Console Errors badge: placeholder for error count */}
                <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
                  Errors: None {/* Replace with error count if you have error data */}
                </Badge>
              </div>
              {/* Color palette: up to 3 squares for main colors */}
              {colors.length > 0 && (
                <div className="flex gap-1 mb-2">
                  {colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: color.value }}
                      title={`${color.property}: ${color.value}`}
                    />
                  ))}
                </div>
              )}
              {/* Basic Info Section */}
              {/* data-lov-id value */}
              {currentElement.attributes && currentElement.attributes.some(attr => attr.name === 'data-lov-id') && (
                <span className="text-purple-300 block mb-1">
                  data-lov-id: {currentElement.attributes.find(attr => attr.name === 'data-lov-id')?.value}
                </span>
              )}
              {/* data-component-line value */}
              {currentElement.attributes && currentElement.attributes.some(attr => attr.name === 'data-component-line') && (
                <span className="text-cyan-300 block mb-1">
                  data-component-line: {currentElement.attributes.find(attr => attr.name === 'data-component-line')?.value}
                </span>
              )}
              {currentElement.id && (
                <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs mr-1">
                  #{sanitizeText(currentElement.id)}
                </Badge>
              )}
              {currentElement.classes.length > 0 && (
                <span className="text-green-300 max-w-48 truncate block mb-1">
                  class: .{currentElement.classes.map(c => sanitizeText(c)).join(' .')}
                </span>
              )}
              {/* Position (x, y) */}
              <span className="text-orange-300 block mb-1">
                Position: ({mousePosition.x}, {mousePosition.y})
              </span>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ExtensionMouseOverlay;
