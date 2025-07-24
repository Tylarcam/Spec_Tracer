
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { sanitizeText } from '@/utils/sanitization';
import { LogEvent } from '@/shared/types';

interface ExtensionTerminalWrapperProps {
  showTerminal: boolean;
  onToggleTerminal: () => void;
  events: LogEvent[];
  onExportEvents: () => void;
  onClearEvents: () => void;
  debugResponses?: any[];
  onClearDebugResponses?: () => void;
  consoleLogs?: string[];
  activeTab: 'debug' | 'console' | 'events';
  setActiveTab: React.Dispatch<React.SetStateAction<'debug' | 'console' | 'events'>>;
}

const ExtensionTerminalWrapper: React.FC<ExtensionTerminalWrapperProps> = ({
  showTerminal,
  onToggleTerminal,
  events,
  onExportEvents,
  onClearEvents,
  debugResponses = [],
  onClearDebugResponses = () => {},
  consoleLogs = [],
  activeTab,
  setActiveTab,
}) => {
  if (!showTerminal) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-96 bg-slate-900/95 border-t border-green-500/50 backdrop-blur-md z-[2147483648] pointer-events-auto">
      <Card className="h-full bg-slate-900/95 border-green-500/50 rounded-t-lg">
        <div className="flex justify-between items-center p-4 border-b border-green-500/30">
          <h3 className="text-green-400 font-semibold">LogTrace Terminal</h3>
          <div className="flex gap-2">
            <Button onClick={onExportEvents} variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">Export</Button>
            <Button onClick={onClearEvents} variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">Clear</Button>
            <Button onClick={onToggleTerminal} variant="ghost" size="sm" className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'debug' | 'console' | 'events')} className="h-full flex flex-col">
          <TabsList className="h-10 items-center justify-center rounded-md p-1 text-muted-foreground grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="events" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Events ({events.length})</TabsTrigger>
            <TabsTrigger value="debug" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">AI Debug ({debugResponses.length})</TabsTrigger>
            <TabsTrigger value="console" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Console (0)</TabsTrigger>
          </TabsList>
          <TabsContent value="events" className="mt-4 relative flex-1 min-h-0 overflow-y-auto">
            <div className="font-mono text-sm space-y-1">
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
                    const el: LogEvent['element'] = event.element;
                    const tag = el?.tag || 'div';
                    const id = el?.id ? `#${el.id}` : '';
                    const classes = el?.classes && el.classes.length > 0 ? `.${el.classes.join('.')}` : '';
                    const text = el?.text ? `"${el.text}"` : '';
                    const parentPath = el?.parentPath ? el.parentPath : '';
                    const attributes = el?.attributes && el.attributes.length > 0
                      ? el.attributes.map((a: any) => `${a.name}="${a.value}"`).join(', ')
                      : '';
                    const size = el?.size ? `${el.size.width}×${el.size.height}` : '';
                    const position = event.position ? `@${event.position.x},${event.position.y}` : '';
                    const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(tag) || (el?.classes && el.classes.includes('interactive'));
                    const copyString = `[${event.timestamp}] ${type} ${tag}${id}${classes} ${text} ${position} ${parentPath} ${attributes} ${size}`;
                    return (
                      <div key={idx} className="contents">
                        <div className="text-gray-500 break-all min-w-0 max-w-full" title={event.timestamp}>[{event.timestamp}]</div>
                        <div className={`${color} font-semibold break-all min-w-0 max-w-full`}>{type}</div>
                        <div className="text-cyan-300 font-mono break-all min-w-0 max-w-full" title={`${tag}${id}${classes}`}>{tag}{id}{classes}</div>
                        <div className="italic text-blue-300 break-all min-w-0 max-w-full" title={text}>{text}</div>
                        <div className="text-purple-300 text-xs break-all min-w-0 max-w-full" title={parentPath && `${parentPath} > ${tag}`}>{parentPath && `${parentPath} > ${tag}`}</div>
                        <div className="text-orange-300 text-xs break-all min-w-0 max-w-full" title={attributes}>{attributes.length > 40 ? attributes.slice(0, 40) + '…' : attributes}</div>
                        <div className="min-w-0 max-w-full">
                          {isInteractive && <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-xs font-bold">INTERACTIVE</span>}
                        </div>
                        <div className="text-orange-300 text-xs break-all min-w-0 max-w-full" title={position}>{position}</div>
                        <div className="text-gray-400 text-xs min-w-0 max-w-full" title={size}>{size}</div>
                        <div className="flex justify-end items-center col-span-9">
                          <button
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground rounded-md h-6 w-6 p-0 ml-2"
                            title="Copy event details"
                            onClick={() => navigator.clipboard.writeText(copyString)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy w-3 h-3 text-gray-400"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="debug" className="mt-4 relative flex-1 min-h-0 overflow-y-auto">
            <div className="flex justify-between items-center h-6 shrink-0">
              <span className="text-sm text-gray-400">AI Debug Conversations</span>
              <button
                className="bg-red-500/10 text-red-400 border border-red-500/50 rounded px-3 py-1 text-xs hover:bg-red-500/20 transition"
                onClick={onClearDebugResponses}
              >
                Clear AI Debug
              </button>
            </div>
            <div className="font-mono text-sm space-y-4">
              {debugResponses.length === 0 ? (
                <div className="text-gray-500">No debug responses yet...</div>
              ) : (
                debugResponses.map((resp, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded p-2 text-green-200">
                    <strong>AI Response:</strong><br />
                    <div>{sanitizeText(resp.response)}</div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="console" className="mt-4 relative flex-1 min-h-0 overflow-y-auto">
            {consoleLogs.length === 0 ? (
              <div className="text-gray-500">Console is empty...</div>
            ) : (
              <div className="font-mono text-xs space-y-1">
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="text-blue-300">{log}</div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ExtensionTerminalWrapper;
