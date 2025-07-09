import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Copy, Check } from 'lucide-react';
import { LogEvent } from '@/shared/types';

interface TabbedTerminalProps {
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  events: LogEvent[];
  exportEvents: () => void;
  clearEvents: () => void;
  debugResponses: Array<{ id: string; prompt: string; response: string; timestamp: string }>;
}

const TabbedTerminal: React.FC<TabbedTerminalProps> = ({
  showTerminal,
  setShowTerminal,
  events,
  exportEvents,
  clearEvents,
  debugResponses,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!showTerminal) return null;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'click': return 'text-green-400';
      case 'debug': return 'text-yellow-400';
      case 'inspect': return 'text-cyan-400';
      case 'llm_response': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const copyEventToClipboard = async (event: LogEvent) => {
    const eventText = `[${formatTime(event.timestamp)}] ${event.type.toUpperCase()} ${
      event.element ? `${event.element.tag}${event.element.id ? `#${event.element.id}` : ''}${
        event.element.classes.length > 0 ? `.${event.element.classes.join('.')}` : ''
      }` : ''
    } ${event.position ? `@${event.position.x},${event.position.y}` : ''}`;
    
    await navigator.clipboard.writeText(eventText);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 1000);
  };

  const clickEvents = events.filter(e => ['click', 'debug', 'inspect'].includes(e.type));

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
                onClick={clearEvents}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Clear
              </Button>
              <Button
                onClick={() => setShowTerminal(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
          </div>

          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
              <TabsTrigger value="events" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                Events ({clickEvents.length})
              </TabsTrigger>
              <TabsTrigger value="debug" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                AI Debug ({debugResponses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="mt-4">
              <ScrollArea className="h-64 bg-slate-800/50 rounded p-2">
                <div className="font-mono text-sm space-y-1">
                  {clickEvents.length === 0 ? (
                    <div className="text-gray-500">No click events logged yet...</div>
                  ) : (
                    clickEvents.map((event) => (
                      <div key={event.id} className="flex gap-2 items-center group">
                        <div className="flex gap-2 flex-1">
                          <span className="text-gray-500">[{formatTime(event.timestamp)}]</span>
                          <span className={getEventColor(event.type)}>{event.type.toUpperCase()}</span>
                          {event.element && (
                            <span className="text-gray-300">
                              {event.element.tag}
                              {event.element.id && `#${event.element.id}`}
                              {event.element.classes.length > 0 && `.${event.element.classes.join('.')}`}
                            </span>
                          )}
                          {event.position && (
                            <span className="text-gray-400">
                              @{event.position.x},{event.position.y}
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => copyEventToClipboard(event)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedId === event.id ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="debug" className="mt-4">
              <ScrollArea className="h-64 bg-slate-800/50 rounded p-2">
                <div className="font-mono text-sm space-y-3">
                  {debugResponses.length === 0 ? (
                    <div className="text-gray-500">No debug responses yet...</div>
                  ) : (
                    debugResponses.map((response) => (
                      <div key={response.id} className="border-l-2 border-purple-500/30 pl-3">
                        <div className="text-gray-500 text-xs mb-1">
                          [{formatTime(response.timestamp)}]
                        </div>
                        <div className="text-purple-400 font-medium mb-1">Prompt:</div>
                        <div className="text-gray-300 text-xs mb-2 bg-slate-700/50 p-2 rounded">
                          {response.prompt}
                        </div>
                        <div className="text-green-400 font-medium mb-1">Response:</div>
                        <div className="text-gray-300 text-xs bg-slate-700/50 p-2 rounded">
                          {response.response}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default TabbedTerminal;