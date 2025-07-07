
import React from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { LogEvent } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';

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

  return (
    <div className="fixed bottom-0 left-0 right-0 h-96 bg-slate-900/95 border-t border-green-500/50 backdrop-blur-md z-40">
      <div className="flex items-center justify-between p-4 border-b border-green-500/30">
        <h3 className="text-cyan-400 font-bold">Memory Terminal</h3>
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
      
      <ScrollArea className="h-80 p-4">
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No events logged yet. Enable LogTrace and start interacting with the page.
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="text-xs border-l-2 border-green-500/30 pl-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      event.type === 'move' ? 'bg-blue-500/20 text-blue-400' :
                      event.type === 'click' ? 'bg-yellow-500/20 text-yellow-400' :
                      event.type === 'debug' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {event.type.toUpperCase()}
                  </Badge>
                  <span className="text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  {event.element && (
                    <span className="text-cyan-300">
                      {event.element.tag}{event.element.id && `#${event.element.id}`}
                    </span>
                  )}
                </div>
                {event.prompt && (
                  <div className="text-green-300 mt-1">{sanitizeText(event.prompt)}</div>
                )}
                {event.response && (
                  <div className="text-green-200 mt-2 p-2 bg-slate-800/50 rounded text-sm">
                    <strong>AI Response:</strong><br />
                    <div>{sanitizeText(event.response)}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Terminal;
