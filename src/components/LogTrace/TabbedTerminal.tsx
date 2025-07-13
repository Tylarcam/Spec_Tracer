
import React, { useState, useRef, useEffect } from 'react';
import { Terminal, History, Download, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'hover' | 'click' | 'ai-response' | 'system';
  content: string;
  element?: string;
}

interface TabbedTerminalProps {
  logs?: LogEntry[];
  isVisible: boolean;
  onToggle: () => void;
  onClear: () => void;
  showTerminal?: boolean;
  setShowTerminal?: (show: boolean) => void;
  events?: any[];
  exportEvents?: () => void;
  clearEvents?: () => void;
  debugResponses?: any[];
  clearDebugResponses?: () => void;
  currentElement?: any;
}

const TabbedTerminal: React.FC<TabbedTerminalProps> = ({
  logs = [],
  isVisible,
  onToggle,
  onClear,
  showTerminal,
  setShowTerminal,
  events = [],
  exportEvents,
  clearEvents,
  debugResponses = [],
  clearDebugResponses,
}) => {
  const [activeTab, setActiveTab] = useState('terminal');
  const [isExpanded, setIsExpanded] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const isMobile = window.innerWidth < 768;

  // Use showTerminal prop if provided, otherwise use isVisible
  const terminalVisible = showTerminal !== undefined ? showTerminal : isVisible;
  const handleToggle = setShowTerminal || onToggle;

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, events]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'hover': return '👆';
      case 'click': return '🖱️';
      case 'ai-response': return '🤖';
      case 'system': return '⚙️';
      default: return '•';
    }
  };

  const exportLogs = () => {
    const allLogs = [...logs, ...events];
    const content = allLogs.map(log => 
      `[${log.timestamp ? formatTimestamp(new Date(log.timestamp)) : new Date().toLocaleTimeString()}] ${(log.type || 'event').toUpperCase()}: ${log.content || log.prompt || JSON.stringify(log)}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logtrace-session-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    onClear();
    if (clearEvents) clearEvents();
    if (clearDebugResponses) clearDebugResponses();
  };

  const handleExport = () => {
    if (exportEvents) {
      exportEvents();
    } else {
      exportLogs();
    }
  };

  if (!terminalVisible) {
    return (
      <Button
        onClick={handleToggle}
        className="fixed bottom-4 right-4 z-30 bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 p-0 shadow-lg"
      >
        <Terminal className="h-5 w-5" />
      </Button>
    );
  }

  const allLogs = [...logs, ...events];

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-green-500/30 shadow-2xl
      transition-all duration-300 ease-out
      ${isExpanded ? 'h-3/4' : 'h-64'}
      ${isMobile ? 'h-1/2' : ''}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-green-500/20">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-green-400" />
          <span className="text-green-400 font-semibold text-sm">Debug Terminal</span>
          <span className="text-xs text-gray-400">({allLogs.length} entries)</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Mobile expand/collapse */}
          {isMobile && (
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-7 w-7 p-0"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          )}
          
          <Button
            onClick={handleExport}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white h-7 w-7 p-0"
            disabled={allLogs.length === 0}
          >
            <Download className="h-3 w-3" />
          </Button>
          
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-400 h-7 w-7 p-0"
            disabled={allLogs.length === 0}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          
          <Button
            onClick={handleToggle}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="bg-slate-800 border-b border-green-500/20 rounded-none w-full justify-start p-0">
          <TabsTrigger 
            value="terminal" 
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400 px-4 py-2 text-sm"
          >
            Terminal
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400 px-4 py-2 text-sm"
          >
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terminal" className="flex-1 m-0 p-0">
          <div 
            ref={terminalRef}
            className="h-full overflow-y-auto p-3 space-y-2 font-mono text-sm"
          >
            {allLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Start tracing to see debug logs</p>
                </div>
              </div>
            ) : (
              allLogs.map((log, index) => (
                <div key={log.id || index} className="flex gap-2 text-xs">
                  <span className="text-gray-500 shrink-0">
                    {log.timestamp ? formatTimestamp(new Date(log.timestamp)) : new Date().toLocaleTimeString()}
                  </span>
                  <span className="shrink-0">{getLogIcon(log.type || 'system')}</span>
                  <span className="text-gray-300 break-all">{log.content || log.prompt || JSON.stringify(log)}</span>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 m-0 p-0">
          <div className="h-full overflow-y-auto p-3">
            <div className="space-y-3">
              {debugResponses.filter(log => log.type === 'ai-response' || log.response).map((log, index) => (
                <div key={log.id || index} className="bg-slate-800 rounded-lg p-3 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">
                      {log.timestamp ? formatTimestamp(new Date(log.timestamp)) : new Date().toLocaleTimeString()}
                    </span>
                    <span className="text-xs text-green-400 font-medium">AI Response</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{log.content || log.response}</p>
                </div>
              ))}
              {debugResponses.filter(log => log.type === 'ai-response' || log.response).length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No AI responses yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TabbedTerminal;
