
import React, { useState, useRef, useEffect } from 'react';
import { Terminal, History, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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
  logs: LogEntry[];
  isVisible: boolean;
  onToggle: () => void;
  onClear: () => void;
}

const TabbedTerminal: React.FC<TabbedTerminalProps> = ({
  logs,
  isVisible,
  onToggle,
  onClear,
}) => {
  const [activeTab, setActiveTab] = useState('terminal');
  const [isExpanded, setIsExpanded] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const isMobile = window.innerWidth < 768;

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

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
    const content = logs.map(log => 
      `[${formatTimestamp(log.timestamp)}] ${log.type.toUpperCase()}: ${log.content}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logtrace-session-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-30 bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 p-0 shadow-lg"
      >
        <Terminal className="h-5 w-5" />
      </Button>
    );
  }

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
          <span className="text-xs text-gray-400">({logs.length} entries)</span>
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
            onClick={exportLogs}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white h-7 w-7 p-0"
            disabled={logs.length === 0}
          >
            <Download className="h-3 w-3" />
          </Button>
          
          <Button
            onClick={onClear}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-400 h-7 w-7 p-0"
            disabled={logs.length === 0}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white h-7 w-7 p-0"
          >
            <ChevronDown className="h-4 w-4" />
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
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Start tracing to see debug logs</p>
                </div>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-2 text-xs">
                  <span className="text-gray-500 shrink-0">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className="shrink-0">{getLogIcon(log.type)}</span>
                  <span className="text-gray-300 break-all">{log.content}</span>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 m-0 p-0">
          <div className="h-full overflow-y-auto p-3">
            <div className="space-y-3">
              {logs.filter(log => log.type === 'ai-response').map((log) => (
                <div key={log.id} className="bg-slate-800 rounded-lg p-3 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</span>
                    <span className="text-xs text-green-400 font-medium">AI Response</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{log.content}</p>
                </div>
              ))}
              {logs.filter(log => log.type === 'ai-response').length === 0 && (
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
