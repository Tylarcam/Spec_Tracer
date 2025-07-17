import React, { useState, useMemo, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Eye, Settings, Code, Zap, X, Hash, Type, Lock, Unlock, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { ElementInfo } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';
import { useToast } from '@/hooks/use-toast';
import { useConsoleLogs } from '@/shared/hooks/useConsoleLogs';

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
  // For extension: pause hover when mouse is over inspector
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
  currentDebugCount,
  maxDebugCount,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  const [expandedAttrIndexes, setExpandedAttrIndexes] = useState<number[]>([]);
  const { toast } = useToast();
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    if (isPinned) return;
    dragging.current = true;
    const rect = panelRef?.current?.getBoundingClientRect();
    dragOffset.current = rect
      ? { x: e.clientX - rect.left, y: e.clientY - rect.top }
      : { x: 0, y: 0 };
    document.body.style.userSelect = 'none';
  };
  const handleDrag = (e: MouseEvent) => {
    if (!dragging.current || isPinned) return;
    setModalPosition({ x: e.clientX - (dragOffset.current?.x || 0), y: e.clientY - (dragOffset.current?.y || 0) });
  };
  const handleDragEnd = () => {
    dragging.current = false;
    document.body.style.userSelect = '';
  };
  React.useEffect(() => {
    if (!dragging.current) return;
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  });

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

  // Position logic
  const defaultPosition = isExtensionMode
    ? {
        left: Math.min(mousePosition.x + 20, window.innerWidth - 350),
        top: Math.min(mousePosition.y + 20, window.innerHeight - 450),
      }
    : {
        left: Math.min(mousePosition.x + 20, window.innerWidth - 320),
        top: Math.min(mousePosition.y + 20, window.innerHeight - 400),
      };
  const positionStyle = modalPosition
    ? { left: Math.max(0, Math.min(modalPosition.x, window.innerWidth - 350)), top: Math.max(0, Math.min(modalPosition.y, window.innerHeight - 100)) }
    : defaultPosition;

  return (
    <div
      ref={panelRef}
      className={`fixed pointer-events-auto z-50 w-full max-w-md max-h-[80vh] overflow-y-auto ${isExtensionMode ? 'z-[10001]' : 'z-50'}`}
      style={positionStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Card className="bg-slate-900/95 border-cyan-500/50 backdrop-blur-md shadow-xl shadow-cyan-500/20">
        <div className="p-4">
          {/* Header */}
          <div
            className="flex items-center justify-between mb-3 cursor-move select-none"
            onMouseDown={handleDragStart}
            style={{ cursor: isPinned ? 'default' : 'move' }}
          >
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
              {onPin && (
                <Button
                  onClick={onPin}
                  size="sm"
                  variant="ghost"
                  className={`h-6 w-6 p-0 ${isPinned ? 'text-green-400' : 'text-gray-400'} hover:text-green-300 hover:bg-green-500/10`}
                  title={isPinned ? 'Unpin panel' : 'Pin panel'}
                  tabIndex={-1}
                  type="button"
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
                tabIndex={-1}
                type="button"
              >
                <Code className="w-3 h-3" />
              </Button>
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                title="Close"
                tabIndex={-1}
                type="button"
              >
                <X className="w-3 h-3" />
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

                  {/* Events Section */}
                  {eventListeners.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className="font-semibold text-purple-300 mb-1 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Events
                      </div>
                      <table className="min-w-full text-xs text-left">
                        <thead>
                          <tr>
                            <th className="py-1 px-2 text-purple-200 font-medium">Type</th>
                            <th className="py-1 px-2 text-purple-200 font-medium">Handler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eventListeners.map((evt, idx) => (
                            <tr key={idx} className="border-b border-gray-700/50 last:border-b-0">
                              <td className="py-1 px-2 font-mono text-purple-100">{evt.replace('on', '')}</td>
                              <td className="py-1 px-2 text-gray-300">handler</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {attributes.length > 0 && (
              <AccordionItem value="attributes" className="border-purple-500/20">
                <AccordionTrigger className="text-purple-400 text-sm py-2 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span>Attributes ({attributes.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-1 text-xs">
                  <div className="bg-slate-800/50 p-3 rounded border border-purple-500/20 max-h-48 overflow-y-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-700/50">
                          <th className="text-left py-1 px-2 text-purple-300 font-medium">attribute</th>
                          <th className="text-left py-1 px-2 text-purple-300 font-medium">value</th>
                          <th className="text-left py-1 px-2 text-purple-300 font-medium w-16">actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attributes.map((attr, index) => {
                          const isLongValue = attr.value.length > 50;
                          const isExpanded = expandedAttrIndexes.includes(index);
                          const displayValue = isLongValue && !isExpanded
                            ? `${attr.value.substring(0, 50)}...`
                            : attr.value;
                          const handleToggle = () => {
                            setExpandedAttrIndexes(prev =>
                              prev.includes(index)
                                ? prev.filter(i => i !== index)
                                : [...prev, index]
                            );
                          };
                          
                          return (
                            <React.Fragment key={index}>
                              <tr className="border-b border-gray-700/50 last:border-b-0">
                                <td className="py-1 px-2 text-purple-200 font-mono align-top">
                                  {attr.name}
                                </td>
                                <td className="py-1 px-2 align-top">
                                  <div className="flex items-start gap-1">
                                    <span
                                      className={`text-gray-300 font-mono break-all ${
                                        isLongValue && !isExpanded ? 'max-w-[200px]' : 'max-w-[300px]'
                                      }`}
                                      title={isLongValue ? attr.value : undefined}
                                    >
                                      "{sanitizeText(displayValue)}"
                                    </span>
                                    {isLongValue && (
                                      <button
                                        onClick={handleToggle}
                                        className="text-gray-400 hover:text-purple-300 transition-colors flex-shrink-0 mt-0.5"
                                        title={isExpanded ? 'Collapse' : 'Expand'}
                                      >
                                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="py-1 px-2 align-top">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(attr.value);
                                      toast({ title: 'Copied!', description: 'Attribute value copied to clipboard', variant: 'success' });
                                    }}
                                    className="text-gray-400 hover:text-purple-300 transition-colors"
                                    title="Copy value"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                              {isLongValue && isExpanded && (
                                <tr>
                                  <td colSpan={3} className="px-2 pb-2">
                                    <div className="mt-1 p-2 bg-slate-900/50 rounded border border-purple-500/20">
                                      <div className="text-gray-300 font-mono text-xs break-all">
                                        {sanitizeText(attr.value)}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="styles" className="border-orange-500/20">
              <AccordionTrigger className="text-orange-400 text-sm py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Computed Styles</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-xs">
                <div className="bg-slate-800/50 p-3 rounded border border-orange-500/20 max-h-48 overflow-y-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="text-left py-1 px-2 text-orange-300 font-medium">property</th>
                        <th className="text-left py-1 px-2 text-orange-300 font-medium">value</th>
                        <th className="text-left py-1 px-2 text-orange-300 font-medium w-16">actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(computedStyles).map(([property, value], idx) => (
                        <tr key={property} className="border-b border-gray-700/50 last:border-b-0">
                          <td className="py-1 px-2 text-orange-200 font-mono align-top">{property}</td>
                          <td className="py-1 px-2 align-top">
                            <span className="text-gray-300 font-mono break-all max-w-[300px]">{sanitizeText(String(value))}</span>
                          </td>
                          <td className="py-1 px-2 align-top">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(String(value));
                                toast({ title: 'Copied!', description: 'Style value copied to clipboard', variant: 'success' });
                              }}
                              className="text-gray-400 hover:text-orange-300 transition-colors"
                              title="Copy value"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>

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
