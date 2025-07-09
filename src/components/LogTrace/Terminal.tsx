
import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { LogEvent } from '@/shared/types';

interface TerminalProps {
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  events: LogEvent[];
  exportEvents: () => void;
  clearEvents: () => void;
}

const Terminal: React.FC<TerminalProps> = ({
  showTerminal,
  setShowTerminal,
  events,
  exportEvents,
  clearEvents,
}) => {
  if (!showTerminal) return null;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'move': return 'text-blue-400';
      case 'click': return 'text-green-400';
      case 'debug': return 'text-yellow-400';
      case 'llm_response': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <Card className="bg-slate-900/95 border-green-500/50 rounded-t-lg border-b-0">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-green-400 font-semibold">Event Terminal</h3>
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
          
          <ScrollArea className="h-64 bg-slate-800/50 rounded p-2">
            <div className="font-mono text-sm space-y-1">
              {events.length === 0 ? (
                <div className="text-gray-500">No events logged yet...</div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="flex gap-2">
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
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
};

export default Terminal;
