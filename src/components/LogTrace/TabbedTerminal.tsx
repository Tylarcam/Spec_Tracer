
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
import { formatElementDataForCopy } from '@/utils/elementDataFormatter';
import { useToast } from '@/hooks/use-toast';
import { useDebugResponses } from '@/shared/hooks/useDebugResponses';

interface TabbedTerminalProps {
  isOpen: boolean;
  onClose: () => void;
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

const TabbedTerminal: React.FC<TabbedTerminalProps> = React.memo(({
  isOpen,
  onClose,
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
  const [activeTab, setActiveTab] = useState<'terminal' | 'events' | 'context'>('events');
  const [showTimestamps, setShowTimestamps] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Use the debug responses hook for better state management
  const { 
    debugResponses: localDebugResponses, 
    addDebugResponse, 
    clearDebugResponses: clearLocalDebugResponses 
  } = useDebugResponses();

  // Merge external debug responses with local ones
  const allDebugResponses = useMemo(() => {
    return [...debugResponses, ...localDebugResponses];
  }, [debugResponses, localDebugResponses]);

  // Convert events to terminal output for display
  useEffect(() => {
    const newLines: TerminalLine[] = events.map((event, index) => ({
      id: `event-${index}`,
      type: 'output',
      content: `[${event.type.toUpperCase()}] ${event.element?.tag || 'unknown'} at (${event.position?.x || 0}, ${event.position?.y || 0})`,
      timestamp: new Date(event.timestamp),
      relatedEvent: event
    }));

    // Add debug responses as terminal lines
    const debugLines: TerminalLine[] = allDebugResponses.map((response, index) => ({
      id: `debug-${index}`,
      type: 'info',
      content: `[AI DEBUG] ${response.response || response.message || 'Debug response'}`,
      timestamp: new Date(response.timestamp || Date.now()),
    }));

    setTerminalLines([...newLines, ...debugLines]);
  }, [events, allDebugResponses]);

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
    
    // Add to debug responses if it looks like a debug command
    if (inputValue.toLowerCase().includes('debug') || inputValue.toLowerCase().includes('analyze')) {
      addDebugResponse(inputValue, `Command "${inputValue}" processed`);
    }

    setInputValue('');

    // Simulate command processing
    setTimeout(() => {
      const responseLine: TerminalLine = {
        id: `response-${Date.now()}`,
        type: 'info',
        content: `Command "${inputValue}" processed`,
        timestamp: new Date(),
      };
      setTerminalLines(prev => [...prev, responseLine]);
    }, 100);
  }, [inputValue, addDebugResponse]);

  const clearTerminal = useCallback(() => {
    setTerminalLines([]);
    toast({
      title: 'Terminal Cleared',
      description: 'All terminal output has been cleared.',
    });
  }, [toast]);

  const handleClearAllDebugResponses = useCallback(() => {
    clearDebugResponses();
    clearLocalDebugResponses();
    toast({
      title: 'Debug Responses Cleared',
      description: 'All AI debug responses have been cleared.',
    });
  }, [clearDebugResponses, clearLocalDebugResponses, toast]);

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

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'click': return 'text-green-400';
      case 'hover': return 'text-blue-400';
      case 'move': return 'text-yellow-400';
      case 'debug': return 'text-purple-400';
      case 'inspect': return 'text-cyan-400';
      case 'tap': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const copyEventData = useCallback(async (event: LogEvent) => {
    if (!event.element) return;
    
    // Create a mock ElementInfo object with a placeholder element
    const mockElement: ElementInfo = {
      ...event.element,
      element: document.createElement('div') // Placeholder element
    };
    
    const formattedData = formatElementDataForCopy(mockElement, event.position);
    
    try {
      await navigator.clipboard.writeText(formattedData);
      toast({
        title: 'Event Data Copied',
        description: 'Element data has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy event data to clipboard.',
        variant: 'destructive',
      });
    }
  }, [toast]);

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
      position: { x: 0, y: 0 },
      settings: {
        maxEvents: 1000,
        autoSave: true,
        theme: 'dark' as const,
        debugMode: false
      }
    };
  }, [currentElement]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-green-500/30 z-40" style={{ height: terminalHeight }}>
      <div className="flex items-center justify-between p-2 bg-slate-800 border-b border-green-500/20">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-cyan-400">Debug Terminal</h3>
          <Badge variant="outline" className="text-xs text-gray-400">
            {events.length} events
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
            onClick={onClose}
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
              <TabsTrigger value="events" className="data-[state=active]:bg-green-600 text-xs">
                Events ({eventsList.length})
              </TabsTrigger>
              <TabsTrigger value="terminal" className="data-[state=active]:bg-cyan-600 text-xs">
                Terminal
              </TabsTrigger>
              <TabsTrigger value="context" className="data-[state=active]:bg-purple-600 text-xs">
                Context
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="mt-0 h-full">
              <div className="h-full overflow-y-auto p-2 bg-slate-950">
                {eventsList.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    No events recorded yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {eventsList.map((event, index) => (
                      <div
                        key={event.id || index}
                        className="bg-slate-800/50 rounded-lg p-3 border border-green-500/20 hover:border-green-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-mono ${getEventTypeColor(event.type)} border-current`}
                            >
                              {event.type.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <Button
                            onClick={() => copyEventData(event)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white h-6 w-6 p-0"
                            title="Copy event data"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {event.element && (
                          <div className="space-y-2">
                            {/* Element Selector */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 font-mono">
                                {event.element.tag?.toUpperCase() || 'DIV'}
                              </Badge>
                              {event.element.id && (
                                <span className="text-green-300 font-mono text-sm">
                                  #{sanitizeText(event.element.id)}
                                </span>
                              )}
                              {event.element.classes && event.element.classes.length > 0 && (
                                <span className="text-yellow-300 font-mono text-sm">
                                  .{event.element.classes.map(c => sanitizeText(c)).join('.')}
                                </span>
                              )}
                            </div>

                            {/* Element Text */}
                            {event.element.text && (
                              <div className="bg-slate-900/50 rounded p-2 border-l-2 border-cyan-500/50">
                                <span className="text-xs text-gray-400">Text:</span>
                                <div className="text-cyan-200 text-sm font-mono mt-1">
                                  "{sanitizeText(event.element.text, 100)}"
                                </div>
                              </div>
                            )}

                            {/* Element Hierarchy */}
                            {event.element.parentPath && (
                              <div className="bg-slate-900/50 rounded p-2 border-l-2 border-purple-500/50">
                                <span className="text-xs text-gray-400">Hierarchy:</span>
                                <div className="text-purple-200 text-xs font-mono mt-1 break-all">
                                  {event.element.parentPath} → {event.element.tag}
                                </div>
                              </div>
                            )}

                            {/* Position and Size */}
                            <div className="grid grid-cols-2 gap-2">
                              {event.position && (
                                <div className="bg-slate-900/50 rounded p-2 border-l-2 border-orange-500/50">
                                  <span className="text-xs text-gray-400">Position:</span>
                                  <div className="text-orange-200 text-sm font-mono">
                                    ({event.position.x}, {event.position.y})
                                  </div>
                                </div>
                              )}
                              {event.element.size && (
                                <div className="bg-slate-900/50 rounded p-2 border-l-2 border-pink-500/50">
                                  <span className="text-xs text-gray-400">Size:</span>
                                  <div className="text-pink-200 text-sm font-mono">
                                    {event.element.size.width}×{event.element.size.height}px
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Attributes */}
                            {event.element.attributes && event.element.attributes.length > 0 && (
                              <div className="bg-slate-900/50 rounded p-2 border-l-2 border-teal-500/50">
                                <span className="text-xs text-gray-400">Attributes:</span>
                                <div className="text-teal-200 text-xs font-mono mt-1 space-y-1">
                                  {event.element.attributes.slice(0, 5).map((attr, i) => (
                                    <div key={i} className="flex">
                                      <span className="text-teal-300 mr-2">{attr.name}:</span>
                                      <span className="text-teal-100 break-all">
                                        "{sanitizeText(attr.value, 50)}"
                                      </span>
                                    </div>
                                  ))}
                                  {event.element.attributes.length > 5 && (
                                    <div className="text-gray-400 text-xs">
                                      ... and {event.element.attributes.length - 5} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="terminal" className="mt-0 h-full">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-2 bg-slate-800/50 border-b border-green-500/20">
                  <span className="text-sm text-gray-400">Terminal Output</span>
                  <div className="flex gap-1">
                    <Button
                      onClick={exportEvents}
                      variant="outline"
                      size="sm"
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 text-xs"
                    >
                      Export Events
                    </Button>
                    <Button
                      onClick={clearEvents}
                      variant="outline"
                      size="sm"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                      Clear Events
                    </Button>
                  </div>
                </div>
                
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

            <TabsContent value="context" className="mt-0 h-full">
              <div className="h-full overflow-y-auto p-2 bg-slate-950">
                <div className="flex items-center justify-between p-2 bg-slate-800/50 border-b border-green-500/20 mb-4">
                  <span className="text-sm text-gray-400">AI Debug Responses ({allDebugResponses.length})</span>
                  <Button
                    onClick={handleClearAllDebugResponses}
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs"
                  >
                    Clear AI Debug
                  </Button>
                </div>

                <div className="space-y-3">
                  {allDebugResponses.length === 0 ? (
                    <div className="text-gray-500 text-center py-4">
                      No AI debug responses yet
                    </div>
                  ) : (
                    allDebugResponses.map((response, index) => (
                      <div key={index} className="bg-slate-800/50 rounded p-3 border border-green-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400">
                            AI Debug
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(response.timestamp || Date.now()).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm text-green-200 whitespace-pre-wrap">
                          {sanitizeText(response.response || response.message || 'No response')}
                        </div>
                        {response.prompt && (
                          <div className="mt-2 pt-2 border-t border-green-500/10">
                            <div className="text-xs text-gray-400 mb-1">Prompt:</div>
                            <div className="text-xs text-gray-300 font-mono bg-slate-900/50 p-2 rounded">
                              {sanitizeText(response.prompt)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {currentElement && (
                    <div className="bg-slate-800/50 rounded p-3 border border-green-500/20">
                      <h4 className="text-green-400 font-semibold mb-2 text-sm">Current Element Context</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            {currentElement.tag?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                          {currentElement.id && (
                            <span className="text-green-300 font-mono">
                              #{sanitizeText(currentElement.id)}
                            </span>
                          )}
                        </div>
                        {currentElement.classes && currentElement.classes.length > 0 && (
                          <div className="text-gray-400">
                            Classes: .{currentElement.classes.map(c => sanitizeText(c)).join(' .')}
                          </div>
                        )}
                        {currentElement.text && (
                          <div className="text-gray-400">
                            Text: "{sanitizeText(currentElement.text)}"
                          </div>
                        )}
                        {currentElement.parentPath && (
                          <div className="text-gray-400 font-mono text-xs">
                            Path: {currentElement.parentPath}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-slate-800/50 rounded p-3 border border-green-500/20">
                    <h4 className="text-green-400 font-semibold mb-2 text-sm">Debug Settings</h4>
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
});

TabbedTerminal.displayName = 'TabbedTerminal';

export default TabbedTerminal;
