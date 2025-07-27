import React, { useState, useRef, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { X, Download, Play, History, GripHorizontal, Copy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { parseAIResponse, formatAIResponseForDisplay } from '@/utils/sanitization';
import { formatElementDataForCopy } from '@/utils/elementDataFormatter';
import { useToast } from '@/hooks/use-toast';

interface TabbedTerminalProps {
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  events: any[];
  exportEvents: () => void;
  clearEvents: () => void;
  debugResponses: any[];
  clearDebugResponses: () => void;
  currentElement?: any;
  terminalHeight?: number;
  onTerminalHeightChange?: (height: number) => void;
}

const TabbedTerminal: React.FC<TabbedTerminalProps> = ({
  showTerminal,
  setShowTerminal,
  events = [],
  exportEvents,
  clearEvents,
  debugResponses = [],
  clearDebugResponses,
  currentElement,
  terminalHeight = 384,
  onTerminalHeightChange,
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'debug' | 'console'>('events');
  const [associateWithElement, setAssociateWithElement] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(terminalHeight);
  const resizeRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startY = e.clientY;
    const startHeight = currentHeight;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY;
      const newHeight = Math.max(200, Math.min(window.innerHeight * 0.75, startHeight + deltaY));
      setCurrentHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      onTerminalHeightChange?.(currentHeight);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [currentHeight, onTerminalHeightChange]);

  const handleCopyEvent = (event: any) => {
    const formattedData = formatElementDataForCopy(event.element, event.position);
    navigator.clipboard.writeText(formattedData);
    toast({
      title: "Event copied to clipboard",
      description: "Element details have been copied successfully",
    });
  };

  const handleCopyDebugResponse = (response: string) => {
    navigator.clipboard.writeText(response);
    toast({
      title: "Response copied to clipboard",
      description: "AI debug response has been copied successfully",
    });
  };

  if (!showTerminal) {
    return null;
  }

  return (
    <div
      className={`w-full ${isMobile ? 'z-100' : 'z-50'}`}
      style={{ height: `${currentHeight}px` }}
    >
      <Card className={`bg-slate-900/95 border-green-500/50 ${isMobile ? 'rounded-none border-x-0 border-b-0' : 'rounded-t-lg border-b-0'} h-full`}>
        {/* Resize Handle */}
        {!isMobile && (
          <div
            ref={resizeRef}
            className={`h-2 w-full cursor-row-resize bg-green-500/20 hover:bg-green-500/30 transition-colors flex items-center justify-center group ${isResizing ? 'bg-green-500/40' : ''}`}
            onMouseDown={handleMouseDown}
          >
            <GripHorizontal className="h-3 w-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
        
        <div className={`${isMobile ? 'p-2' : 'p-4'} h-full flex flex-col min-h-0`} style={{ height: isMobile ? '100%' : 'calc(100% - 8px)' }}>
          {/* Header with Close Button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-green-400 font-semibold">LogTrace Terminal</h3>
            <div className="flex gap-2">
              {!isMobile && (
                <Button
                  onClick={exportEvents}
                  variant="outline"
                  size="sm"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                >
                  Export
                </Button>
              )}
              <Button
                onClick={() => setShowTerminal(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full flex-1 flex flex-col min-h-0">
            <TabsList className={`${isMobile ? 'h-12' : 'h-10'} items-center justify-center rounded-md p-1 text-muted-foreground grid w-full grid-cols-3 bg-slate-800/50`}>
              <TabsTrigger 
                value="events" 
                className={`data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 ${isMobile ? 'text-xs p-2' : ''}`}
              >
                Events ({events.length})
              </TabsTrigger>
              <TabsTrigger 
                value="debug" 
                className={`data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 ${isMobile ? 'text-xs p-2' : ''}`}
              >
                AI Debug ({debugResponses.length})
              </TabsTrigger>
              <TabsTrigger 
                value="console" 
                className={`data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 ${isMobile ? 'text-xs p-2' : ''}`}
              >
                Console (0)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="mt-4 relative flex-1 min-h-0">
              <div className="flex justify-between items-center shrink-0 h-6">
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>Interaction Events</span>
                <div className="flex gap-2">
                  {isMobile && (
                    <button
                      className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 rounded px-2 py-1 text-xs hover:bg-cyan-500/20 transition"
                      onClick={exportEvents}
                    >
                      Export
                    </button>
                  )}
                  <button
                    className={`bg-red-500/10 text-red-400 border border-red-500/50 rounded ${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-xs'} hover:bg-red-500/20 transition`}
                    onClick={clearEvents}
                  >
                    Clear
                  </button>
                </div>
              </div>
                <div className="absolute inset-x-0 bottom-0 top-6 font-mono text-sm space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent">
                {events.length === 0 ? (
                  <div className="text-gray-500">No events captured yet...</div>
                ) : (
                  <div className="grid grid-cols-9 gap-2 items-center text-xs font-mono w-full">
                    {/* Header Row */}
                    <div className="font-bold text-gray-400">Timestamp</div>
                    <div className="font-bold text-gray-400">Type</div>
                    <div className="font-bold text-gray-400">Tag/ID/Classes</div>
                    <div className="font-bold text-gray-400">Text</div>
                    <div className="font-bold text-gray-400">Hierarchy</div>
                    <div className="font-bold text-gray-400">Attributes</div>
                    <div className="font-bold text-gray-400">Interactive</div>
                    <div className="font-bold text-gray-400">Position</div>
                    <div className="font-bold text-gray-400">Size</div>
                    {/* Data Rows */}
                    {events.map((event, idx) => {
                      let color = '';
                      const type = String(event.type).toUpperCase();
                      if (type === 'CLICK') color = 'text-green-400';
                      else if (type === 'DEBUG') color = 'text-yellow-400';
                      else if (type === 'INSPECT') color = 'text-cyan-400';
                      // Compose element info
                      const el = event.element || {};
                      const tag = el.tag || 'div';
                      const id = el.id ? `#${el.id}` : '';
                      const classes = el.classes && el.classes.length > 0 ? `.${el.classes.join('.')}` : '';
                      const text = el.text ? `"${el.text}"` : '';
                      const parentPath = el.parentPath ? el.parentPath : '';
                      const attributes = el.attributes && el.attributes.length > 0
                        ? el.attributes.map(a => `${a.name}="${a.value}"`).join(', ')
                        : '';
                      const size = el.size ? `${el.size.width}×${el.size.height}` : '';
                      const position = event.position ? `@${event.position.x},${event.position.y}` : '';
                      const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(tag) || (el && el.classes && el.classes.includes('interactive'));
                      const copyString = `[${event.timestamp}] ${type} ${tag}${id}${classes} ${text} ${position} ${parentPath} ${attributes} ${size}`;
                      return (
                        <div key={idx} className="contents">
                          <div className="text-gray-500 break-all min-w-0 max-w-full" title={event.timestamp}>[{event.timestamp}]</div>
                          <div className={`${color} font-semibold break-all min-w-0 max-w-full`}>{type}</div>
                          <div className="text-cyan-300 font-mono truncate whitespace-nowrap min-w-0 max-w-full" title={`${tag}${id}${classes}`}>{tag}{id}{classes}</div>
                          <div className="italic text-blue-300 break-all min-w-0 max-w-full" title={text}>{text}</div>
                          <div className="text-purple-300 text-xs truncate whitespace-nowrap min-w-0 max-w-full" title={parentPath && `${parentPath} > ${tag}`}>{parentPath && `${parentPath} > ${tag}`}</div>
                          <div className="text-orange-300 text-xs break-all min-w-0 max-w-full" title={attributes}>{attributes.length > 40 ? attributes.slice(0, 40) + '…' : attributes}</div>
                          <div className="min-w-0 max-w-full">
                            {isInteractive && <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-xs font-bold">INTERACTIVE</span>}
                          </div>
                          <div className="text-orange-300 text-xs break-all min-w-0 max-w-full" title={position}>{position}</div>
                          <div className="text-gray-400 text-xs min-w-0 max-w-full" title={size}>{size}</div>
                          <div className="flex justify-end items-center col-span-9">
                            <button
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md h-6 w-6 p-0 ml-2"
                              title="Copy event details"
                              onClick={() => handleCopyEvent(event)}
                            >
                              <Copy className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                      </div>
                  )}
                </div>
            </TabsContent>
            <TabsContent value="debug" className="mt-4 relative flex-1 min-h-0">
              <div className="flex justify-between items-center h-6 shrink-0">
                <span className="text-sm text-gray-400">AI Debug Conversations</span>
                <button
                  className="bg-red-500/10 text-red-400 border border-red-500/50 rounded px-3 py-1 text-xs hover:bg-red-500/20 transition"
                  onClick={clearDebugResponses}
                >
                  Clear AI Debug
                </button>
              </div>
              <div className="absolute inset-x-0 bottom-0 top-6 font-mono text-sm space-y-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent">
                {debugResponses.length === 0 ? (
                  <div className="text-gray-500">No debug responses yet...</div>
                ) : (
                  debugResponses.map((resp, idx) => {
                    const parsedResponse = parseAIResponse(resp.response);
                    const formattedResponse = formatAIResponseForDisplay(parsedResponse);
                    return (
                      <div key={idx} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                        {/* Header with timestamp and copy button */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {new Date(resp.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="text-xs text-green-400 font-semibold">AI Debug</span>
                          </div>
                          <button
                            onClick={() => handleCopyDebugResponse(formattedResponse)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Copy response"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {/* Prompt */}
                        <div className="mb-3">
                          <div className="text-xs text-gray-400 mb-1">Prompt:</div>
                          <div className="text-sm text-blue-300 bg-slate-800/50 rounded p-2">
                            {resp.prompt}
                          </div>
                        </div>
                        {/* Parsed Response */}
                        <div>
                          <div className="text-xs text-gray-400 mb-2">Response:</div>
                          <div className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">
                            {formattedResponse}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
            <TabsContent value="console" className="mt-4 relative flex-1 min-h-0">
              <div className="flex justify-between items-center h-6 shrink-0">
                <span className="text-sm text-gray-400">Console Errors & Warnings</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={associateWithElement}
                      onChange={e => setAssociateWithElement(e.target.checked)}
                      className="accent-blue-500 h-3 w-3 rounded border-gray-400 focus:ring-0"
                    />
                    Associate with element
                  </label>
                  <button
                    className="bg-red-500/10 text-red-400 border border-red-500/50 rounded px-3 py-1 text-xs hover:bg-red-500/20 transition"
                    onClick={clearEvents}
                  >
                    Clear Console
                  </button>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 top-6 overflow-y-auto overflow-x-hidden bg-slate-800/50 rounded p-2 scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent">
                <div className="font-mono text-sm space-y-2">
                    <div className="text-gray-500">No console errors or warnings captured yet...</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default TabbedTerminal;
