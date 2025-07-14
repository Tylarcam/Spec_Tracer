import React, { useState, useMemo, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Eye, Settings, Code, Zap, X, Hash, Type, Lock, Unlock, Copy } from 'lucide-react';
import { ElementInfo } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';

interface ElementInspectorProps {
  isVisible: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  onDebug: () => void;
  onClose: () => void;
  panelRef?: React.RefObject<HTMLDivElement>;
  // Extension mode adjustments
  isExtensionMode?: boolean;
  isDraggable?: boolean;
  isPinned?: boolean;
  onPin?: () => void;
  onShowMoreDetails: () => void;
  // NEW: AI debug usage
  currentDebugCount?: number;
  maxDebugCount?: number;
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
  currentDebugCount,
  maxDebugCount,
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  const yDown = useRef<number | null>(null);

  // Handle swipe-down to close gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) yDown.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!yDown.current) return;
    const yDiff = e.touches[0].clientY - yDown.current;
    if (yDiff > 120) {          // 120px threshold
      onClose();                // existing close prop
      yDown.current = null;
    }
  };

  // Get computed styles
  const computedStyles = useMemo(() => {
    if (!currentElement?.element) return {};
    const styles = window.getComputedStyle(currentElement.element);
    return {
      // Layout
      display: styles.display,
      position: styles.position,
      zIndex: styles.zIndex,
      visibility: styles.visibility,
      opacity: styles.opacity,
      overflow: styles.overflow,
      // Dimensions
      width: styles.width,
      height: styles.height,
      margin: styles.margin,
      padding: styles.padding,
      border: styles.border,
      // Typography
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      fontSize: styles.fontSize,
      fontFamily: styles.fontFamily,
      lineHeight: styles.lineHeight,
      textAlign: styles.textAlign,
      // Interactive
      pointerEvents: styles.pointerEvents,
      cursor: styles.cursor,
      userSelect: styles.userSelect,
      // Flexbox
      flexDirection: styles.flexDirection,
      alignItems: styles.alignItems,
      justifyContent: styles.justifyContent,
      flexWrap: styles.flexWrap,
      // Grid
      gridTemplateColumns: styles.gridTemplateColumns,
      gridTemplateRows: styles.gridTemplateRows,
      gridArea: styles.gridArea,
      // Visual Effects
      borderRadius: styles.borderRadius,
      boxShadow: styles.boxShadow,
      transform: styles.transform,
      filter: styles.filter,
    };
  }, [currentElement]);

  // Get element attributes
  const attributes = useMemo(() => {
    if (!currentElement?.element) return [];
    return Array.from(currentElement.element.attributes).map(attr => ({
      name: attr.name,
      value: attr.value
    }));
  }, [currentElement]);

  // Get event listeners
  const eventListeners = useMemo(() => {
    if (!currentElement?.element) return [];
    const el = currentElement.element as any;
    const listeners = [
      'onclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmouseout',
      'onmouseenter', 'onmouseleave', 'onkeydown', 'onkeyup', 'oninput',
      'onchange', 'onfocus', 'onblur', 'onsubmit', 'onload', 'onerror'
    ];
    return listeners.filter(listener => typeof el[listener] === 'function');
  }, [currentElement]);

  // Check if element is interactive
  const isInteractive = useMemo(() => {
    if (!currentElement) return false;
    return ['button', 'a', 'input', 'select', 'textarea'].includes(currentElement.tag) || 
           currentElement.element?.onclick !== null ||
           computedStyles.cursor === 'pointer';
  }, [currentElement, computedStyles]);

  // Element hierarchy
  const hierarchy = useMemo(() => {
    if (!currentElement?.element) return '';
    const parents = [];
    let element = currentElement.element.parentElement;
    let depth = 0;
    
    while (element && depth < 3) {
      const tagName = element.tagName.toLowerCase();
      const id = element.id ? `#${element.id}` : '';
      const className = element.className ? `.${element.className.split(' ')[0]}` : '';
      parents.unshift(`${tagName}${id}${className}`);
      element = element.parentElement;
      depth++;
    }
    
    return parents.length > 0 ? parents.join(' > ') + ' > ' : '';
  }, [currentElement]);

  if (!isVisible || !currentElement) return null;

  const positionStyle = isExtensionMode 
    ? {
        left: Math.min(mousePosition.x + 20, window.innerWidth - 350),
        top: Math.min(mousePosition.y + 20, window.innerHeight - 450),
      }
    : {
        left: Math.min(mousePosition.x + 20, window.innerWidth - 320),
        top: Math.min(mousePosition.y + 20, window.innerHeight - 400),
      };

  return (
    <div
      ref={panelRef}
      className={`fixed pointer-events-auto z-50 w-full max-w-md max-h-[80vh] overflow-y-auto ${isExtensionMode ? 'z-[10001]' : 'z-50'}`}
      style={positionStyle}
    >
      <Card 
        className="bg-slate-900/95 border-cyan-500/50 backdrop-blur-md shadow-xl shadow-cyan-500/20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">
                {currentElement.tag.toUpperCase()}
              </Badge>
              {isInteractive && (
                <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Interactive
                </Badge>
              )}
            </div>
            <div className="flex gap-1 items-center">
              {/* AI debug usage badge */}
              {(typeof currentDebugCount === 'number' && typeof maxDebugCount === 'number') && (
                <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs flex items-center gap-1">
                  <Zap className="w-3 h-3 mr-1" />
                  {currentDebugCount}/{maxDebugCount}
                </Badge>
              )}
              {onPin && isDraggable && (
                <Button
                  onClick={onPin}
                  size="sm"
                  variant="ghost"
                  className={`h-6 w-6 p-0 ${isPinned ? 'text-green-400' : 'text-gray-400'} hover:text-green-300 hover:bg-green-500/10`}
                  title={isPinned ? 'Unpin panel' : 'Pin panel'}
                >
                  {isPinned ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </Button>
              )}
              <Button
                onClick={onDebug}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                title="Debug with AI"
              >
                <Code className="w-3 h-3" />
              </Button>
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </Button>
              <Button
                onClick={onShowMoreDetails}
                size="sm"
                variant="outline"
                className="ml-2 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/10"
              >
                More Details
              </Button>
            </div>
          </div>

          {/* Accordion Sections */}
          <Accordion 
            type="multiple" 
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="w-full"
          >
            {/* Basic Info */}
            <AccordionItem value="basic" className="border-green-500/20">
              <AccordionTrigger className="text-cyan-400 text-sm py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Basic Info</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-xs">
                <div className="bg-slate-800/50 p-3 rounded border border-cyan-500/20">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tag:</span>
                    <span className="text-cyan-300 font-mono">&lt;{currentElement.tag}&gt;</span>
                  </div>
                  {currentElement.id && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID:</span>
                      <span className="text-green-300 font-mono">#{sanitizeText(currentElement.id)}</span>
                    </div>
                  )}
                  {currentElement.classes.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Classes:</span>
                      <span className="text-green-300 font-mono text-right">
                        .{currentElement.classes.map(c => sanitizeText(c)).join(' .')}
                      </span>
                    </div>
                  )}
                  {currentElement.text && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Text:</span>
                      <span className="text-blue-300 font-mono text-right max-w-[150px] truncate">
                        "{sanitizeText(currentElement.text)}"
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Position:</span>
                    <span className="text-orange-300 font-mono">
                      ({mousePosition.x}, {mousePosition.y})
                    </span>
                  </div>
                  {hierarchy && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <span className="text-gray-400 text-xs">Path:</span>
                      <div className="text-purple-300 font-mono text-xs mt-1 break-all">
                        {hierarchy}{currentElement.tag}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Attributes */}
            {attributes.length > 0 && (
              <AccordionItem value="attributes" className="border-purple-500/20">
                <AccordionTrigger className="text-purple-400 text-sm py-2 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span>Attributes ({attributes.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-1 text-xs">
                  <div className="bg-slate-800/50 p-3 rounded border border-purple-500/20 max-h-32 overflow-y-auto">
                    {attributes.map((attr, index) => (
                      <div key={index} className="flex justify-between py-0.5">
                        <span className="text-purple-300">{attr.name}:</span>
                        <span className="text-gray-300 font-mono text-right max-w-[120px] truncate">
                          "{sanitizeText(attr.value)}"
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Computed Styles */}
            <AccordionItem value="styles" className="border-orange-500/20">
              <AccordionTrigger className="text-orange-400 text-sm py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Computed Styles</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-xs">
                <div className="bg-slate-800/50 p-3 rounded border border-orange-500/20 max-h-48 overflow-y-auto">
                  {Object.entries(computedStyles).map(([property, value]) => (
                    <div key={property} className="flex justify-between py-0.5">
                      <span className="text-orange-300">{property}:</span>
                      <span className="text-gray-300 font-mono text-right max-w-[120px] truncate">
                        {sanitizeText(String(value))}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Event Listeners */}
            {eventListeners.length > 0 && (
              <AccordionItem value="events" className="border-yellow-500/20">
                <AccordionTrigger className="text-yellow-400 text-sm py-2 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Event Listeners ({eventListeners.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-1 text-xs">
                  <div className="bg-slate-800/50 p-3 rounded border border-yellow-500/20">
                    {eventListeners.map((listener, index) => (
                      <div key={index} className="text-yellow-300 font-mono">
                        {listener}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </Card>
    </div>
  );
};

export default ElementInspector; 