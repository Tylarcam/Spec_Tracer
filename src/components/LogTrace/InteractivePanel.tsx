
import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ChevronDown, Code, Eye, Settings, Zap } from 'lucide-react';
import { ElementInfo } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';

interface InteractivePanelProps {
  isVisible: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  onDebug: () => void;
  onClose: () => void;
  panelRef: React.RefObject<HTMLDivElement>;
}

const InteractivePanel: React.FC<InteractivePanelProps> = ({
  isVisible,
  currentElement,
  mousePosition,
  onDebug,
  onClose,
  panelRef,
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  if (!isVisible || !currentElement) return null;

  const getComputedStyles = () => {
    if (!currentElement.element) return null;
    const styles = window.getComputedStyle(currentElement.element);
    // Only include key properties
    return {
      display: styles.display,
      position: styles.position,
      zIndex: styles.zIndex,
      visibility: styles.visibility,
      opacity: styles.opacity,
      pointerEvents: styles.pointerEvents,
      overflow: styles.overflow,
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      fontSize: styles.fontSize,
      fontFamily: styles.fontFamily,
      width: styles.width,
      height: styles.height,
      margin: styles.margin,
      padding: styles.padding,
      border: styles.border,
      flexDirection: styles.flexDirection,
      alignItems: styles.alignItems,
      justifyContent: styles.justifyContent,
      gridTemplateColumns: styles.gridTemplateColumns,
      gridTemplateRows: styles.gridTemplateRows,
    };
  };

  const styles = getComputedStyles();
  const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(currentElement.tag) || 
                       currentElement.element?.onclick !== null;

  // Utility to detect event listeners
  const getEventListeners = () => {
    if (!currentElement.element) return [];
    const el = currentElement.element as any;
    const listeners = [
      'onclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmouseout',
      'onmouseenter', 'onmouseleave', 'onkeydown', 'onkeyup', 'oninput',
      'onchange', 'onfocus', 'onblur', 'onsubmit'
    ];
    return listeners.filter(listener => typeof el[listener] === 'function');
  };
  const eventListeners = getEventListeners();

  return (
    <div
      ref={panelRef}
      className="fixed pointer-events-auto z-50 w-80 max-h-96 overflow-hidden"
      style={{
        left: Math.min(mousePosition.x + 20, window.innerWidth - 320),
        top: Math.min(mousePosition.y + 20, window.innerHeight - 400),
      }}
    >
      <Card className="bg-slate-900/95 border-cyan-500/50 backdrop-blur-md shadow-xl shadow-cyan-500/20">
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
            <div className="flex gap-1">
              <Button
                onClick={onDebug}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              >
                <Code className="w-3 h-3" />
              </Button>
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                ×
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
                  Basic Info
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="space-y-2 text-xs">
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
                      <span className="text-gray-300 text-right max-w-32 truncate">
                        "{sanitizeText(currentElement.text)}"
                      </span>
                    </div>
                  )}
                  {currentElement.parentPath && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hierarchy:</span>
                      <span className="text-blue-300 font-mono text-right max-w-32 truncate">
                        {currentElement.parentPath}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Position:</span>
                    <span className="text-cyan-300 font-mono">
                      {mousePosition.x}, {mousePosition.y}
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Computed Styles */}
            {styles && (
              <AccordionItem value="styles" className="border-green-500/20">
                <AccordionTrigger className="text-cyan-400 text-sm py-2 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Computed Styles
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                    {Object.entries(styles).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400">{key}:</span>
                        <span className="text-yellow-300 font-mono text-right max-w-32 truncate">
                          {sanitizeText(value?.toString() || '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Attributes */}
            <AccordionItem value="attributes" className="border-green-500/20">
              <AccordionTrigger className="text-cyan-400 text-sm py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Attributes
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                  {currentElement.element && Array.from(currentElement.element.attributes).map((attr) => (
                    <div key={attr.name} className="flex justify-between">
                      <span className="text-gray-400">{attr.name}:</span>
                      <span className="text-orange-300 font-mono text-right max-w-32 truncate">
                        "{sanitizeText(attr.value)}"
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Event Listeners */}
            {eventListeners.length > 0 && (
              <AccordionItem value="listeners" className="border-green-500/20">
                <AccordionTrigger className="text-cyan-400 text-sm py-2 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Event Listeners
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="space-y-1 text-xs">
                    {eventListeners.map(listener => (
                      <div key={listener} className="flex justify-between">
                        <span className="text-gray-400">{listener.replace('on', '')}:</span>
                        <span className="text-purple-300 font-mono">attached</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          <Separator className="bg-green-500/30 my-3" />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onDebug}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white flex-1 text-xs"
            >
              <Code className="w-3 h-3 mr-1" />
              Debug with AI
            </Button>
          </div>

          {/* Quick Actions Tip */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            Ctrl+D for quick debug • Click sections to expand
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InteractivePanel;
