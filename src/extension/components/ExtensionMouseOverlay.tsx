
import React, { useRef, useLayoutEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sanitizeText } from '@/utils/sanitization';
import { ElementInfo } from '@/shared/types';
import { Camera, Sparkles, Bug, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Utility to extract up to 3 unique colors from computed styles
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
  onQuickAction?: (action: 'details' | 'screenshot' | 'context' | 'debug', element: ElementInfo | null) => void;
}

const ExtensionMouseOverlay: React.FC<ExtensionMouseOverlayProps> = ({
  isActive,
  currentElement,
  mousePosition,
  showElementInspector,
  overlayRef,
  onPin,
  onQuickAction,
}) => {
  if (!isActive) return null;

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

  const handleQuickAction = (action: 'details' | 'screenshot' | 'context' | 'debug') => {
    setShowQuickActions(false);
    if (onQuickAction) onQuickAction(action, currentElement);
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

      {/* Blue element highlighter */}
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

      {/* Quick Actions Modal */}
      {currentElement && showQuickActions && !showElementInspector && (
        <div
          style={{ position: 'absolute', left: quickActionPos.left, top: quickActionPos.top, zIndex: 1050 }}
          className="flex items-center bg-slate-900/95 border border-cyan-700 rounded-full shadow-lg px-2 py-1 gap-1 animate-fade-in"
        >
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
            onClick={() => handleQuickAction('screenshot')}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
            style={{ minWidth: 56 }}
            type="button"
          >
            <Camera className="h-4 w-4 text-cyan-300" />
            Shot
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
          onClick={handleOverlayClick}
          onMouseEnter={handleOverlayMouseEnter}
          onMouseLeave={handleOverlayMouseLeave}
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
              {/* Show up to 3 unique colors */}
              {colors.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {colors.map((color, idx) => (
                    <span key={idx} className="inline-block w-4 h-4 rounded-full border border-cyan-400" style={{ background: color.value }} title={color.property} />
                  ))}
                </div>
              )}
              <div className="text-cyan-300 mt-2 text-xs">
                Click to inspect • Ctrl+D to debug
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ExtensionMouseOverlay;
