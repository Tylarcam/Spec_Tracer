
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { X, Download, Play, History } from 'lucide-react';

interface TabbedTerminalProps {
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  events: any[];
  exportEvents: () => void;
  clearEvents: () => void;
  debugResponses: any[];
  clearDebugResponses: () => void;
  currentElement?: any;
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
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'debug' | 'console'>('events');

  if (!showTerminal) {
    return (
      <Button
        onClick={() => setShowTerminal(true)}
        className="fixed bottom-4 right-4 z-30 bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 p-0 shadow-lg"
      >
        {/* Keep the green circle terminal icon */}
        <span style={{ fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'>'}</span>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <Card className="bg-slate-900/95 border-green-500/50 rounded-t-lg border-b-0">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-green-400 font-semibold">LogTrace Terminal</h3>
            <div className="flex gap-2">
              <Button
                onClick={exportEvents}
                variant="outline"
                size="sm"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                Export
              </Button>
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
          <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
            <TabsList className="h-10 items-center justify-center rounded-md p-1 text-muted-foreground grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="events" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Events ({events.length})</TabsTrigger>
              <TabsTrigger value="debug" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">AI Debug ({debugResponses.length})</TabsTrigger>
              <TabsTrigger value="console" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Console (0)</TabsTrigger>
            </TabsList>
            <TabsContent value="events" className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Interaction Events</span>
                <button
                  className="bg-red-500/10 text-red-400 border border-red-500/50 rounded px-3 py-1 text-xs hover:bg-red-500/20 transition"
                  onClick={clearEvents}
                >
                  Clear Events
                </button>
              </div>
              <div className="font-mono text-sm space-y-1">
                {events.length === 0 ? (
                  <div className="text-gray-500">No events captured yet...</div>
                ) : (
                  events.map((event, idx) => {
                    let color = '';
                    if (event.type === 'CLICK') color = 'text-green-400';
                    else if (event.type === 'DEBUG') color = 'text-yellow-400';
                    else if (event.type === 'INSPECT') color = 'text-cyan-400';
                    // Compose element info string
                    const tag = event.elementTag || 'div';
                    const id = event.elementId ? `#${event.elementId}` : '';
                    const classes = event.elementClasses ? `.${event.elementClasses.replace(/\s+/g, '.')}` : '';
                    const text = event.elementText ? `"${event.elementText}"` : '';
                    const position = event.position ? `@${event.position.x},${event.position.y}` : '';
                    // Compose copy string
                    const copyString = `[${event.timestamp}] ${event.type} ${tag}${id}${classes} ${text} ${position}`;
                    return (
                      <div key={idx} className="flex gap-2 items-center group">
                        <div className="flex gap-2 flex-1 min-w-0">
                          <span className="text-gray-500 min-w-[100px] text-xs">[{event.timestamp}]</span>
                          <span className={`${color} font-semibold`}>{event.type}</span>
                          <span className="text-gray-300 truncate max-w-[120px]">{tag}{id}{classes}</span>
                          {text && <span className="italic text-gray-400 truncate max-w-[120px]">{text}</span>}
                          {position && <span className="text-gray-400 text-xs">{position}</span>}
                        </div>
                        <button
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground rounded-md h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy event details"
                          onClick={() => navigator.clipboard.writeText(copyString)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy w-3 h-3 text-gray-400"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
            <TabsContent value="debug" className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">AI Debug Conversations</span>
                <button
                  className="bg-red-500/10 text-red-400 border border-red-500/50 rounded px-3 py-1 text-xs hover:bg-red-500/20 transition"
                  onClick={clearDebugResponses}
                >
                  Clear AI Debug
                </button>
              </div>
              <div className="font-mono text-sm space-y-2">
                {debugResponses.length === 0 ? (
                  <div className="text-gray-500">No debug responses yet...</div>
                ) : (
                  debugResponses.map((resp, idx) => (
                    <div key={idx} className="text-gray-300">{JSON.stringify(resp)}</div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="console" className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Console Errors & Warnings</span>
                <button
                  className="bg-red-500/10 text-red-400 border border-red-500/50 rounded px-3 py-1 text-xs hover:bg-red-500/20 transition"
                  onClick={clearEvents}
                >
                  Clear Console
                </button>
              </div>
              <div className="relative overflow-hidden h-64 bg-slate-800/50 rounded p-2">
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
