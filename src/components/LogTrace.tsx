
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface MouseEvent {
  id: string;
  timestamp: string;
  type: 'move' | 'click' | 'debug' | 'llm_response';
  position: { x: number; y: number };
  element?: {
    tag: string;
    id: string;
    classes: string[];
    text: string;
  };
  prompt?: string;
  response?: string;
}

interface HoveredElement {
  tag: string;
  id: string;
  classes: string[];
  text: string;
  element: HTMLElement;
}

const LogTrace = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState<HoveredElement | null>(null);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [events, setEvents] = useState<MouseEvent[]>([]);
  const [quickPrompt, setQuickPrompt] = useState("Why did this happen?");
  const [advancedPrompt, setAdvancedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('logtrace-events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    
    const savedApiKey = localStorage.getItem('logtrace-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('logtrace-events', JSON.stringify(events));
  }, [events]);

  const addEvent = useCallback((event: Omit<MouseEvent, 'id' | 'timestamp'>) => {
    const newEvent: MouseEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setEvents(prev => [newEvent, ...prev]);
  }, []);

  const getElementInfo = useCallback((element: HTMLElement): HoveredElement => {
    const rect = element.getBoundingClientRect();
    const text = element.textContent?.slice(0, 50) || '';
    
    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || '',
      classes: Array.from(element.classList),
      text: text.length > 47 ? text + '...' : text,
      element
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isEnabled) return;

    const target = e.target as HTMLElement;
    if (target && !target.closest('#logtrace-overlay') && !target.closest('#logtrace-modal')) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      const elementInfo = getElementInfo(target);
      setHoveredElement(elementInfo);
      
      addEvent({
        type: 'move',
        position: { x: e.clientX, y: e.clientY },
        element: {
          tag: elementInfo.tag,
          id: elementInfo.id,
          classes: elementInfo.classes,
          text: elementInfo.text,
        }
      });
    }
  }, [isEnabled, getElementInfo, addEvent]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEnabled) return;
    
    const target = e.target as HTMLElement;
    if (target && !target.closest('#logtrace-overlay') && !target.closest('#logtrace-modal')) {
      addEvent({
        type: 'click',
        position: { x: e.clientX, y: e.clientY },
        element: hoveredElement ? {
          tag: hoveredElement.tag,
          id: hoveredElement.id,
          classes: hoveredElement.classes,
          text: hoveredElement.text,
        } : undefined
      });
    }
  }, [isEnabled, hoveredElement, addEvent]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEnabled) return;
    
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      setShowDebugModal(true);
      addEvent({
        type: 'debug',
        position: mousePosition,
        element: hoveredElement ? {
          tag: hoveredElement.tag,
          id: hoveredElement.id,
          classes: hoveredElement.classes,
          text: hoveredElement.text,
        } : undefined
      });
    }
  }, [isEnabled, mousePosition, hoveredElement, addEvent]);

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEnabled, handleKeyDown]);

  const generateAdvancedPrompt = useCallback(() => {
    if (!hoveredElement) return "";
    
    const element = hoveredElement.element;
    const computedStyle = window.getComputedStyle(element);
    const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(hoveredElement.tag) ||
                          element.onclick !== null ||
                          computedStyle.cursor === 'pointer';
    
    return `Debug this element in detail:

Element: <${hoveredElement.tag}${hoveredElement.id ? ` id="${hoveredElement.id}"` : ''}${hoveredElement.classes.length ? ` class="${hoveredElement.classes.join(' ')}"` : ''}>
Text: "${hoveredElement.text}"
Position: x:${mousePosition.x}, y:${mousePosition.y}
Interactive: ${isInteractive ? 'Yes' : 'No'}
Cursor: ${computedStyle.cursor}
Display: ${computedStyle.display}
Visibility: ${computedStyle.visibility}
Pointer Events: ${computedStyle.pointerEvents}

Consider:
1. Why might this element not be behaving as expected?
2. Are there any CSS properties preventing interaction?
3. Are there any event listeners that might be interfering?
4. What accessibility concerns might exist?
5. How could the user experience be improved?

Provide specific, actionable debugging steps and potential solutions.`;
  }, [hoveredElement, mousePosition]);

  const handleDebugSubmit = async (prompt: string) => {
    if (!apiKey) {
      alert('Please enter your OpenAI API key first');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert web developer and debugger. Provide clear, actionable debugging advice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const llmResponse = data.choices[0].message.content;

      addEvent({
        type: 'llm_response',
        position: mousePosition,
        prompt,
        response: llmResponse,
        element: hoveredElement ? {
          tag: hoveredElement.tag,
          id: hoveredElement.id,
          classes: hoveredElement.classes,
          text: hoveredElement.text,
        } : undefined
      });

      setShowDebugModal(false);
      setShowTerminal(true);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      alert('Error getting AI response. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearEvents = () => {
    setEvents([]);
    localStorage.removeItem('logtrace-events');
  };

  const exportEvents = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `logtrace-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const saveApiKey = () => {
    localStorage.setItem('logtrace-api-key', apiKey);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-green-400 font-mono relative overflow-hidden"
         onMouseMove={handleMouseMove}
         onClick={handleClick}>
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Main Controls */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">LogTrace</h1>
            <p className="text-green-300">Mouse Cursor & Memory Log Debug Terminal</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
                className="data-[state=checked]:bg-cyan-500"
              />
              <span className={isEnabled ? 'text-cyan-400' : 'text-gray-500'}>
                {isEnabled ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            
            <Button
              onClick={() => setShowTerminal(!showTerminal)}
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500/10"
            >
              Terminal
            </Button>
          </div>
        </div>

        {/* API Key Configuration */}
        <Card className="bg-slate-800/50 border-cyan-500/30 mb-6 backdrop-blur-sm">
          <div className="p-4">
            <h3 className="text-cyan-400 font-semibold mb-3">OpenAI API Configuration</h3>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter your OpenAI API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-slate-900/50 border-green-500/30 text-green-400 placeholder-green-300/50"
              />
              <Button 
                onClick={saveApiKey}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
          <div className="p-6">
            <h3 className="text-cyan-400 font-semibold mb-4">How to Use</h3>
            <div className="grid md:grid-cols-2 gap-4 text-green-300">
              <div>
                <h4 className="text-cyan-300 font-medium mb-2">Controls</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Toggle activation with the switch above</li>
                  <li>• Move mouse to inspect elements</li>
                  <li>• Click elements to log interactions</li>
                  <li>• Press <kbd className="bg-slate-700 px-1 rounded">Ctrl+D</kbd> to debug</li>
                </ul>
              </div>
              <div>
                <h4 className="text-cyan-300 font-medium mb-2">Features</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Real-time element inspection overlay</li>
                  <li>• AI-powered debugging assistance</li>
                  <li>• Persistent event logging</li>
                  <li>• Export debugging sessions</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Mouse Overlay */}
      {isEnabled && hoveredElement && (
        <div
          id="logtrace-overlay"
          ref={overlayRef}
          className="fixed pointer-events-none z-50 transform -translate-y-full -translate-x-1/2"
          style={{
            left: mousePosition.x,
            top: mousePosition.y - 10,
          }}
        >
          <Card className="bg-slate-900/95 border-cyan-500/50 backdrop-blur-md shadow-xl shadow-cyan-500/20">
            <div className="p-3 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 text-xs">
                  {hoveredElement.tag}
                </Badge>
                {hoveredElement.id && (
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                    #{hoveredElement.id}
                  </Badge>
                )}
              </div>
              {hoveredElement.classes.length > 0 && (
                <div className="text-green-300 mb-1">
                  .{hoveredElement.classes.join(' .')}
                </div>
              )}
              {hoveredElement.text && (
                <div className="text-gray-300 max-w-48 truncate">
                  "{hoveredElement.text}"
                </div>
              )}
              <div className="text-cyan-300 mt-2 text-xs">
                Ctrl+D to debug
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Debug Modal */}
      {showDebugModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card
            id="logtrace-modal"
            ref={modalRef}
            className="bg-slate-900/95 border-cyan-500/50 w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-cyan-400">Debug Assistant</h3>
                <Button
                  onClick={() => setShowDebugModal(false)}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              {hoveredElement && (
                <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-green-500/30">
                  <h4 className="text-green-400 font-semibold mb-2">Element Context</h4>
                  <div className="text-sm text-green-300">
                    <div><strong>Tag:</strong> {hoveredElement.tag}</div>
                    {hoveredElement.id && <div><strong>ID:</strong> {hoveredElement.id}</div>}
                    {hoveredElement.classes.length > 0 && (
                      <div><strong>Classes:</strong> {hoveredElement.classes.join(', ')}</div>
                    )}
                    <div><strong>Position:</strong> x:{mousePosition.x}, y:{mousePosition.y}</div>
                    {hoveredElement.text && <div><strong>Text:</strong> "{hoveredElement.text}"</div>}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-cyan-400 font-semibold mb-2">Quick Debug</label>
                  <div className="flex gap-2">
                    <Input
                      value={quickPrompt}
                      onChange={(e) => setQuickPrompt(e.target.value)}
                      className="bg-slate-800 border-green-500/30 text-green-400"
                      placeholder="Quick debugging question..."
                    />
                    <Button
                      onClick={() => handleDebugSubmit(quickPrompt)}
                      disabled={isLoading || !apiKey}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isLoading ? 'Analyzing...' : 'Debug'}
                    </Button>
                  </div>
                </div>

                <Separator className="bg-green-500/30" />

                <div>
                  <label className="block text-cyan-400 font-semibold mb-2">Advanced Debug</label>
                  <Textarea
                    value={advancedPrompt || generateAdvancedPrompt()}
                    onChange={(e) => setAdvancedPrompt(e.target.value)}
                    className="bg-slate-800 border-green-500/30 text-green-400 min-h-32"
                    placeholder="Detailed debugging prompt..."
                  />
                  <Button
                    onClick={() => handleDebugSubmit(advancedPrompt || generateAdvancedPrompt())}
                    disabled={isLoading || !apiKey}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white mt-2"
                  >
                    {isLoading ? 'Analyzing...' : 'Advanced Debug'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Terminal */}
      {showTerminal && (
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
                          {event.element.tag}
                          {event.element.id && `#${event.element.id}`}
                        </span>
                      )}
                    </div>
                    {event.prompt && (
                      <div className="text-green-300 mt-1">
                        <strong>Prompt:</strong> {event.prompt}
                      </div>
                    )}
                    {event.response && (
                      <div className="text-green-200 mt-2 p-2 bg-slate-800/50 rounded text-sm">
                        <strong>AI Response:</strong><br />
                        {event.response}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default LogTrace;
