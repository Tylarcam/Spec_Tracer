// MouseOverlay.tsx
// Overlay UI for displaying real-time element info on hover in the LogTrace debugger

import React from 'react';
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
  onElementClick: () => void; // Handler for clicking the overlay (show details)
}

/**
 * MouseOverlay
 * Shows a cursor halo, element highlight, and a floating info card with key element details.
 * Used for real-time UI inspection in the LogTrace debugger.
 */
const MouseOverlay: React.FC<MouseOverlayProps> = ({
  isActive,
  currentElement,
  mousePosition,
  overlayRef,
  onElementClick,
}) => {
  // Don't render overlay if not active
  if (!isActive) return null;

  // Extract up to 3 unique colors from the hovered element
  const colors = currentElement?.element ? extractColorsFromElement(currentElement.element) : [];

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
      
      {/* Blue element highlighter - highlights the DOM element under the cursor */}
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

      {/* Info overlay card - shows element details near the cursor */}
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
          {/* Halo effect for visual focus */}
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
              {/* Header: tag, event listeners, errors */}
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
              {/* ID badge if present */}
              {currentElement.id && (
                <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                  #{sanitizeText(currentElement.id)}
                </Badge>
              )}
              {/* Classes list if present */}
              {currentElement.classes.length > 0 && (
                <div className="text-green-300 mb-1 max-w-48 truncate">
                  .{currentElement.classes.map(c => sanitizeText(c)).join(' .')}
                </div>
              )}
              {/* Text content if present */}
              {currentElement.text && (
                <div className="text-gray-300 max-w-48 truncate mb-1">
                  "{sanitizeText(currentElement.text)}"
                </div>
              )}
              {/* Action instructions for user */}
              <div className="text-cyan-300 text-xs flex items-center justify-between">
                <span>Click for details</span>
                <span className="text-purple-300">Ctrl+D debug</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default MouseOverlay;
