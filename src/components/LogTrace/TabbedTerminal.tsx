
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  Terminal, 
  X, 
  Copy, 
  Trash2, 
  Download,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { ElementInfo, LogEvent, DebugContext } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';
import { useToast } from '@/hooks/use-toast';

interface TabbedTerminalProps {
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  events: LogEvent[];
  exportEvents: () => void;
  clearEvents: () => void;
  debugResponses: any[];
  clearDebugResponses: () => void;
  currentElement: ElementInfo | null;
  terminalHeight: number;
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
  element?: ElementInfo;
  relatedEvent?: LogEvent;
}

const TabbedTerminal: React.FC<TabbedTerminalProps> = ({
  showTerminal,
  setShowTerminal,
  events,
  exportEvents,
  clearEvents,
  debugResponses,
  clearDebugResponses,
  currentElement,
  terminalHeight
}) => {
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'events' | 'context'>('terminal');
  const [showTimestamps, setShowTimestamps] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Convert events to terminal output for display
  useEffect(() => {
    const newLines: TerminalLine[] = events.map((event, index) => ({
      id: `event-${index}`,
      type: 'output',
      content: `[${event.type.toUpperCase()}] ${event.element?.tag || 'unknown'} at (${event.position?.x || 0}, ${event.position?.y || 0})`,
      timestamp: new Date(event.timestamp),
      relatedEvent: event
    }));
    setTerminalLines(newLines);
  }, [events]);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const handleInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newLine: TerminalLine = {
      id: `input-${Date.now()}`,
      type: 'input',
      content: inputValue,
      timestamp: new Date(),
    };

    setTerminalLines(prev => [...prev, newLine]);
    setInputValue('');

    // Simulate command processing (this would be replaced with actual command handling)
    setTimeout(() => {
      const responseLine: TerminalLine = {
        id: `response-${Date.now()}`,
        type: 'info',
        content: `Command "${inputValue}" processed`,
        timestamp: new Date(),
      };
      setTerminalLines(prev => [...prev, responseLine]);
    }, 100);
  }, [inputValue]);

  const clearTerminal = useCallback(() => {
    setTerminalLines([]);
    toast({
      title: 'Terminal Cleared',
      description: 'All terminal output has been cleared.',
    });
  }, [toast]);

  const copyTerminalOutput = useCallback(async () => {
    const output = terminalLines.map(line => 
      `${showTimestamps ? `[${line.timestamp.toLocaleTimeString()}] ` : ''}${line.content}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(output);
      toast({
        title: 'Copied to Clipboard',
        description: 'Terminal output has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy terminal output to clipboard.',
        variant: 'destructive',
      });
    }
  }, [terminalLines, showTimestamps, toast]);

  const downloadTerminalOutput = useCallback(() => {
    const output = terminalLines.map(line => 
      `${showTimestamps ? `[${line.timestamp.toLocaleTimeString()}] ` : ''}${line.content}`
    ).join('\n');
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-output-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download Started',
      description: 'Terminal output is being downloaded.',
    });
  }, [terminalLines, showTimestamps, toast]);

  const getLineTypeColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-cyan-400';
      case 'output': return 'text-gray-300';
      case 'error': return 'text-red-400';
      case 'info': return 'text-green-400';
      default: return 'text-gray-300';
    }
  };

  const getLineTypePrefix = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return '> ';
      case 'output': return '';
      case 'error': return '! ';
      case 'info': return '+ ';
      default: return '';
    }
  };

  // Memoize expensive computations
  const eventsList = useMemo(() => {
    return events.map(event => ({
      ...event,
      element: event.element || null
    }));
  }, [events]);

  const contextInfo = useMemo(() => {
    return {
      element: currentElement,
      position: { x: 0, y: 0 }, // Default position
      settings: {
        maxEvents: 1000,
        autoSave: true,
        theme: 'dark' as const,
        debugMode: false
      }
    };
  }, [currentElement]);

  if (!showTerminal) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-green-500/30 z-40" style={{ height: terminalHeight }}>
      <div className="flex items-center justify-between p-2 bg-slate-800 border-b border-green-500/20">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-cyan-400">Debug Terminal</h3>
          <Badge variant="outline" className="text-xs text-gray-400">
            {terminalLines.length} lines
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={() => setShowTimestamps(!showTimestamps)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            title={showTimestamps ? "Hide timestamps" : "Show timestamps"}
          >
            {showTimestamps ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button
            onClick={copyTerminalOutput}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            title="Copy terminal output"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            onClick={downloadTerminalOutput}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            title="Download terminal output"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            onClick={clearTerminal}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            title="Clear terminal"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            title={isCollapsed ? "Expand terminal" : "Collapse terminal"}
          >
            {isCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <Button
            onClick={() => setShowTerminal(false)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            title="Close terminal"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="h-full">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 h-8">
              <TabsTrigger value="terminal" className="data-[state=active]:bg-cyan-600 text-xs">
                Terminal
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-cyan-600 text-xs">
                Events ({eventsList.length})
              </TabsTrigger>
              <TabsTrigger value="context" className="data-[state=active]:bg-cyan-600 text-xs">
                Context
              </TabsTrigger>
            </TabsList>

            <TabsContent value="terminal" className="mt-0 h-full">
              <div className="h-full flex flex-col">
                <div 
                  ref={terminalRef}
                  className="flex-1 overflow-y-auto p-2 bg-slate-950 font-mono text-xs"
                >
                  {terminalLines.map((line) => (
                    <div
                      key={line.id}
                      className={`flex ${getLineTypeColor(line.type)} mb-1`}
                    >
                      {showTimestamps && (
                        <span className="text-gray-600 mr-2 shrink-0">
                          [{line.timestamp.toLocaleTimeString()}]
                        </span>
                      )}
                      <span className="shrink-0">{getLineTypePrefix(line.type)}</span>
                      <span className="break-words">{line.content}</span>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleInputSubmit} className="p-2 bg-slate-800 border-t border-green-500/20">
                  <div className="flex gap-2">
                    <span className="text-cyan-400 font-mono text-sm self-center">{'>'}</span>
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter command..."
                      className="bg-slate-900 border-green-500/30 text-green-400 font-mono text-sm"
                      autoComplete="off"
                    />
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="events" className="mt-0 h-full">
              <div className="h-full overflow-y-auto p-2 bg-slate-950">
                {eventsList.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    No events recorded yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {eventsList.map((event) => (
                      <div
                        key={event.id}
                        className="bg-slate-800/50 rounded p-2 border border-green-500/20"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {event.element && (
                          <div className="text-xs text-gray-300 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                                {event.element.tag?.toUpperCase() || 'UNKNOWN'}
                              </Badge>
                              {event.element.id && (
                                <span className="text-green-300 font-mono">
                                  #{sanitizeText(event.element.id)}
                                </span>
                              )}
                            </div>
                            {event.element.classes && event.element.classes.length > 0 && (
                              <div className="text-gray-400">
                                Classes: .{event.element.classes.map(c => sanitizeText(c)).join(' .')}
                              </div>
                            )}
                            {event.element.text && (
                              <div className="text-gray-400 truncate">
                                Text: "{sanitizeText(event.element.text)}"
                              </div>
                            )}
                          </div>
                        )}
                        
                        {event.position && (
                          <div className="text-xs text-gray-400 mt-1">
                            Position: ({event.position.x}, {event.position.y})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="context" className="mt-0 h-full">
              <div className="h-full overflow-y-auto p-2 bg-slate-950">
                <div className="space-y-3">
                  {contextInfo.element ? (
                    <div className="bg-slate-800/50 rounded p-3 border border-green-500/20">
                      <h4 className="text-green-400 font-semibold mb-2 text-sm">Current Element</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            {contextInfo.element.tag?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                          {contextInfo.element.id && (
                            <span className="text-green-300 font-mono">
                              #{sanitizeText(contextInfo.element.id)}
                            </span>
                          )}
                        </div>
                        {contextInfo.element.classes && contextInfo.element.classes.length > 0 && (
                          <div className="text-gray-400">
                            Classes: .{contextInfo.element.classes.map(c => sanitizeText(c)).join(' .')}
                          </div>
                        )}
                        {contextInfo.element.text && (
                          <div className="text-gray-400">
                            Text: "{sanitizeText(contextInfo.element.text)}"
                          </div>
                        )}
                        {contextInfo.element.parentPath && (
                          <div className="text-gray-400 font-mono text-xs">
                            Path: {contextInfo.element.parentPath}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      No element selected
                    </div>
                  )}
                  
                  <div className="bg-slate-800/50 rounded p-3 border border-green-500/20">
                    <h4 className="text-green-400 font-semibold mb-2 text-sm">Current Position</h4>
                    <div className="text-xs text-gray-400">
                      X: {contextInfo.position.x}, Y: {contextInfo.position.y}
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded p-3 border border-green-500/20">
                    <h4 className="text-green-400 font-semibold mb-2 text-sm">Settings</h4>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>Max Events: {contextInfo.settings.maxEvents}</div>
                      <div>Auto Save: {contextInfo.settings.autoSave ? 'On' : 'Off'}</div>
                      <div>Theme: {contextInfo.settings.theme}</div>
                      <div>Debug Mode: {contextInfo.settings.debugMode ? 'On' : 'Off'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default TabbedTerminal;
