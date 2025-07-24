// MouseOverlay.tsx
// Overlay UI for displaying real-time element info on hover in the LogTrace debugger

import React, { useRef, useLayoutEffect, useState, useMemo } from 'react';
import { ElementInfo } from '@/shared/types';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { sanitizeText } from '@/utils/sanitization';

/**
 * Color extraction utilities for UI elements
 * Returns up to 3 unique colors from computed styles
 */
export interface ColorInfo {
  property: string;
  value: string;
  hex?: string;
  rgba?: string;
}

export function extractColorsFromElement(element: HTMLElement): ColorInfo[] {
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
    'stroke'
  ];
  const colors: ColorInfo[] = [];
  colorProperties.forEach(property => {
    const value = styles.getPropertyValue(property);
    if (value && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)' && value !== 'initial') {
      colors.push({
        property,
        value: value.trim(),
        hex: value, // Optionally convert to hex if needed
        rgba: value
      });
    }
  });
  // Remove duplicates and limit to 3
  const uniqueColors = colors.filter((color, idx, arr) =>
    arr.findIndex(c => c.value === color.value) === idx
  );
  return uniqueColors.slice(0, 3);
}

// Props for the MouseOverlay component
interface MouseOverlayProps {
  isActive: boolean; // Whether the overlay is active (user is in inspect mode)
  currentElement: ElementInfo | null; // The element currently hovered/inspected
  mousePosition: { x: number; y: number }; // Current mouse position
  overlayRef: React.RefObject<HTMLDivElement>; // Ref for the overlay div
  inspectorCount?: number; // Number of open inspectors
}

/**
 * MouseOverlay
 * Shows a cursor halo, element highlight, and a floating info card with key element details.
 * Used for real-time UI inspection in the LogTrace debugger.
 */
const MouseOverlay: React.FC<MouseOverlayProps> = React.memo(({
  isActive,
  currentElement,
  mousePosition,
  overlayRef,
  inspectorCount = 0,
}) => {
  // Don't render overlay if not active
  if (!isActive) return null;

  // Memoized color extraction to prevent recalculation on every render
  const colors = useMemo(() => {
    return currentElement?.element ? extractColorsFromElement(currentElement.element) : [];
  }, [currentElement?.element]);

  // Memoized element bounds calculation
  const elementBounds = useMemo(() => {
    if (!currentElement?.element) return null;
    const rect = currentElement.element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }, [currentElement?.element]);

  // Memoized event listener count calculation
  const eventListenerCount = useMemo(() => {
    if (!currentElement?.element) return 0;
    const el = currentElement.element as any;
    const listeners = [
      'onclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmouseout',
      'onmouseenter', 'onmouseleave', 'onkeydown', 'onkeyup', 'oninput',
      'onchange', 'onfocus', 'onblur', 'onsubmit', 'onload', 'onerror'
    ];
    return listeners.filter(l => typeof el?.[l] === 'function').length;
  }, [currentElement?.element]);

  // Keep info card in viewport with throttled updates
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardPos, setCardPos] = useState<{ left: number; top: number; below?: boolean }>({ 
    left: mousePosition.x, 
    top: mousePosition.y - 10, 
    below: false 
  });

  // Throttled position update to prevent excessive layout calculations
  useLayoutEffect(() => {
    const updatePosition = () => {
      if (!cardRef.current) return;
      
      const card = cardRef.current;
      const cardRect = card.getBoundingClientRect();
      const padding = 8;
      let left = mousePosition.x;
      let top = mousePosition.y - 10;
      let below = false;

      // Horizontal bounds checking
      if (left + cardRect.width / 2 > window.innerWidth - padding) {
        left = window.innerWidth - cardRect.width / 2 - padding;
      }
      if (left - cardRect.width / 2 < padding) {
        left = cardRect.width / 2 + padding;
      }
      
      // Vertical bounds checking
      if (top - cardRect.height < padding) {
        top = mousePosition.y + 20;
        below = true;
      }
      if (top + cardRect.height > window.innerHeight - padding) {
        top = window.innerHeight - cardRect.height - padding;
      }

      setCardPos({ left, top, below });
    };

    // Use requestAnimationFrame to throttle position updates
    const rafId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(rafId);
  }, [mousePosition.x, mousePosition.y, currentElement]);

  // Memoized attribute values
  const lovIdValue = useMemo(() => 
    currentElement?.attributes?.find(attr => attr.name === 'data-lov-id')?.value,
    [currentElement?.attributes]
  );

  const componentLineValue = useMemo(() => 
    currentElement?.attributes?.find(attr => attr.name === 'data-component-line')?.value,
    [currentElement?.attributes]
  );

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
      
      {/* Blue element highlighter - simple border only */}
      {elementBounds && (
        <div
          className="fixed pointer-events-none z-40"
          style={{
            left: elementBounds.left,
            top: elementBounds.top,
            width: elementBounds.width,
            height: elementBounds.height,
            border: '2px solid #06b6d4',
          }}
        />
      )}

      {/* Info overlay card - shows element details near the cursor (read-only) */}
      {currentElement && (
        <div
          id="logtrace-overlay"
          ref={node => {
            if (cardRef) cardRef.current = node;
            if (overlayRef && 'current' in overlayRef) (overlayRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className={`fixed pointer-events-none z-40 transform -translate-x-1/2 ${cardPos.below ? '' : '-translate-y-full'}`}
          style={{
            left: cardPos.left,
            top: cardPos.top,
          }}
        >
          <Card className="bg-slate-900/95 border-cyan-500/50 backdrop-blur-md shadow-xl hover:border-cyan-400/70 transition-colors">
            <div className="p-3 text-xs">
              {/* Header: tag, event listeners, errors */}
              <div className="flex items-center gap-2 mb-2">
                {/* Tag name badge */}
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 text-xs">
                  {currentElement.tag}
                </Badge>
                {/* Event Listeners badge: shows count or 'No events' */}
                <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                  {eventListenerCount > 0 ? `${eventListenerCount} events` : 'No events'}
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
              <div className="mb-1">
                {/* data-lov-id value */}
                {lovIdValue && (
                  <span className="text-purple-300 block mb-1">
                    data-lov-id: {lovIdValue}
                  </span>
                )}
                {/* data-component-line value */}
                {componentLineValue && (
                  <span className="text-cyan-300 block mb-1">
                    data-component-line: {componentLineValue}
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
                {/* Click hint */}
                <span className="text-yellow-300 block text-xs font-medium">
                  💡 Click to open inspector ({inspectorCount}/3)
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
});

MouseOverlay.displayName = 'MouseOverlay';

export default MouseOverlay;
