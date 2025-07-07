import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Copy, Settings, X } from 'lucide-react';

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
  const [showQuickImproveModal, setShowQuickImproveModal] = useState(false);
  const [quickImprovePrompt, setQuickImprovePrompt] = useState('How can I quickly improve this element?');
  const [quickImproveResponse, setQuickImproveResponse] = useState('');
  const [frozenMousePosition, setFrozenMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [frozenHoveredElement, setFrozenHoveredElement] = useState<HoveredElement | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [suggestionHistory, setSuggestionHistory] = useState<Array<{id: string, timestamp: string, prompt: string, response: string}>>([]);
  const [lastClickedElement, setLastClickedElement] = useState<HoveredElement | null>(null);
  const [mouseTrackingEnabled, setMouseTrackingEnabled] = useState(() => {
    const saved = localStorage.getItem('logtrace-mouse-tracking');
    return saved === null ? true : saved === 'true';
  });
  const [inspectorEnabled, setInspectorEnabled] = useState(() => {
    const saved = localStorage.getItem('logtrace-inspector-enabled');
    return saved === null ? false : saved === 'true';
  });
  const [inspectorPanelOpen, setInspectorPanelOpen] = useState(false);
  const [showFullTextModal, setShowFullTextModal] = useState(false);
  const [fullTextContent, setFullTextContent] = useState<string | null>(null);

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

  // Freeze mouse position and hovered element when modal opens
  useEffect(() => {
    if (showDebugModal || showQuickImproveModal) {
      setFrozenMousePosition(mousePosition);
      setFrozenHoveredElement(hoveredElement);
    } else {
      setFrozenMousePosition(null);
      setFrozenHoveredElement(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDebugModal, showQuickImproveModal]);

  // Only update mouse position and hovered element if not frozen
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isEnabled) return;
    if (showDebugModal || showQuickImproveModal) return;
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
  }, [isEnabled, getElementInfo, addEvent, showDebugModal, showQuickImproveModal]);

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
      setLastClickedElement(hoveredElement);
      if (inspectorEnabled) setInspectorPanelOpen(true);
    }
  }, [isEnabled, hoveredElement, addEvent, inspectorEnabled]);

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
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      setShowQuickImproveModal(true);
    }
    if (e.key === 'Escape') {
      if (showDebugModal) setShowDebugModal(false);
      if (showQuickImproveModal) setShowQuickImproveModal(false);
    }
  }, [isEnabled, mousePosition, hoveredElement, addEvent, showDebugModal, showQuickImproveModal]);

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

      setSuggestionHistory(prev => [{ id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), prompt, response: llmResponse }, ...prev]);
      setShowDebugModal(false);
      setShowTerminal(true);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      alert('Error getting AI response. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickImproveSubmit = async () => {
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
              content: 'You are an expert web developer and UI/UX improver. Suggest quick, actionable improvements for the given element.'
            },
            {
              role: 'user',
              content: quickImprovePrompt
            }
          ],
          max_tokens: 800,
          temperature: 0.6,
        }),
      });
      if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
      const data = await response.json();
      setSuggestionHistory(prev => [{ id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), prompt: quickImprovePrompt, response: data.choices[0].message.content }, ...prev]);
    } catch (error) {
      setQuickImproveResponse('Error getting improvement suggestions.');
    } finally {
      setIsLoading(false);
    }
    setShowQuickImproveModal(false);
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

  // Use frozen or live mouse/element for overlay and modals
  const overlayPosition = frozenMousePosition || mousePosition;
  const overlayElement = frozenHoveredElement || hoveredElement;

  // Add a copy-to-clipboard utility
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    });
  }

  // Utility to build a CSS selector for the element
  function buildSelector(element: { tag: string; id: string; classes: string[] }) {
    let sel = element.tag;
    if (element.id) sel += `#${element.id}`;
    if (element.classes.length) sel += '.' + element.classes.join('.');
    return sel;
  }

  // Persist toggle
  useEffect(() => {
    localStorage.setItem('logtrace-mouse-tracking', mouseTrackingEnabled.toString());
  }, [mouseTrackingEnabled]);

  // Persist inspector toggle
  useEffect(() => {
    localStorage.setItem('logtrace-inspector-enabled', inspectorEnabled.toString());
  }, [inspectorEnabled]);

  // Helper to get element hierarchy (from current element up to body)
  function getElementHierarchy(element: HTMLElement | null): HTMLElement[] {
    const hierarchy: HTMLElement[] = [];
    let current = element;
    while (current && current !== document.body && current instanceof HTMLElement) {
      hierarchy.unshift(current);
      current = current.parentElement as HTMLElement | null;
    }
    if (document.body) hierarchy.unshift(document.body);
    return hierarchy;
  }

  // Allow closing inspector panel with Escape key
  useEffect(() => {
    if (!inspectorPanelOpen) return;
    function handleInspectorPanelEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setInspectorPanelOpen(false);
    }
    document.addEventListener('keydown', handleInspectorPanelEsc);
    return () => document.removeEventListener('keydown', handleInspectorPanelEsc);
  }, [inspectorPanelOpen]);

  // Instead, set inspectorPanelOpen to false when inspectorEnabled is toggled off
  useEffect(() => {
    if (!inspectorEnabled) setInspectorPanelOpen(false);
  }, [inspectorEnabled]);

  // Helper to format text content for display (basic markdown-like heuristics)
  function formatTextContentForDisplay(text: string): React.ReactNode {
    if (!text) return null;
    // Split into lines and paragraphs
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headings: lines starting with #
      if (/^#+ /.test(line)) {
        const level = line.match(/^#+/)[0].length;
        return (
          <div key={idx} className={`font-bold text-cyan-300 mt-4 mb-2 text-${level === 1 ? '2xl' : level === 2 ? 'xl' : 'lg'}`}>{line.replace(/^#+ /, '')}</div>
        );
      }
      // Lists: lines starting with - or *
      if (/^[-*] /.test(line)) {
        return (
          <li key={idx} className="ml-6 list-disc text-green-200">{line.replace(/^[-*] /, '')}</li>
        );
      }
      // Code blocks: lines surrounded by ```
      if (/^```/.test(line)) {
        return <pre key={idx} className="bg-slate-800 text-cyan-200 rounded p-2 my-2 font-mono overflow-x-auto">{line.replace(/^```/, '')}</pre>;
      }
      // Paragraphs
      return <p key={idx} className="mb-2 text-green-100 leading-relaxed">{line}</p>;
    });
  }

  return (
    <div className="min-h-screen bg-slate-900 text-green-400 font-mono relative overflow-hidden"
         onMouseMove={handleMouseMove}
         onClick={handleClick}>
      
      {/* Floating Debug Button */}
      <div
        id="logtrace-debug-btn"
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          width: 50,
          height: 50,
          background: 'rgb(79, 70, 229)',
          color: 'white',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          zIndex: 10000,
          boxShadow: 'rgba(0, 0, 0, 0.3) 0px 4px 12px',
          transition: '0.3s',
          transform: 'scale(1)',
        }}
        aria-label={isEnabled ? 'Disable Debug Mode' : 'Enable Debug Mode'}
        tabIndex={0}
        role="button"
        onClick={() => setIsEnabled((v) => !v)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setIsEnabled((v) => !v);
        }}
        title={isEnabled ? 'Disable Debug Mode' : 'Enable Debug Mode'}
      >
        🐛
      </div>

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

      {/* Wrap the top and middle sections in a common container for alignment */}
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-5xl px-4">
          {/* Main Controls and How to Use */}
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-cyan-400 mb-2">LogTrace</h1>
                <button
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  aria-label="Open settings"
                  tabIndex={0}
                  onClick={() => setShowSettingsModal(true)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowSettingsModal(true); }}
                  style={{ marginBottom: '0.25rem' }}
                >
                  <Settings className="w-6 h-6 text-cyan-300" />
                </button>
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
          {/* Memory Log and Suggestions/Feedback Panels */}
          <div className="flex flex-row w-full gap-x-4">
            {/* Memory Log Panel (fixed width, left) */}
            {isEnabled && (
              <div
                className="z-50 bg-slate-900/95 border border-green-500/40 border-cyan-500/30 rounded-lg shadow-lg flex flex-col"
                style={{
                  width: 243,
                  minWidth: 243,
                  maxWidth: 243,
                  height: 320,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-green-500/20">
                  <span className="text-cyan-400 font-bold text-sm">Memory Log</span>
                  <div className="flex gap-1">
                    <Button onClick={exportEvents} variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400">Export</Button>
                    <Button onClick={clearEvents} variant="outline" size="sm" className="border-red-500/50 text-red-400">Clear</Button>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-2 overflow-y-auto">
                  <div className="space-y-2">
                    {events.filter(e => e.type === 'click' || e.type === 'debug').length === 0 ? (
                      <div className="text-gray-500 text-center py-8 text-xs">
                        No memory events yet.
                      </div>
                    ) : (
                      <Accordion type="single" collapsible className="w-full">
                        {events.filter(e => e.type === 'click' || e.type === 'debug').map(event => (
                          <AccordionItem key={event.id} value={event.id} className="border-b border-green-500/10">
                            <AccordionTrigger className="flex items-center gap-2 text-xs">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  event.type === 'click' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-purple-500/20 text-purple-400'
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
                            </AccordionTrigger>
                            <AccordionContent className="bg-slate-800/60 p-2 rounded text-xs">
                              {event.element && (
                                <div className="mb-2">
                                  <div><strong>Tag:</strong> {event.element.tag}</div>
                                  {event.element.id && <div><strong>ID:</strong> {event.element.id}</div>}
                                  {event.element.classes.length > 0 && <div><strong>Classes:</strong> {event.element.classes.join(', ')}</div>}
                                  {event.element.text && <div><strong>Text:</strong> "{event.element.text}"</div>}
                                  {(event.element as any).attributes && Object.keys((event.element as any).attributes).length > 0 && (
                                    <div><strong>Attributes:</strong> {Object.entries((event.element as any).attributes).map(([k, v]) => `${k}="${v}"`).join(', ')}</div>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-cyan-400 border-cyan-500/40 px-2 py-1 text-xs"
                                      onClick={() => copyToClipboard(buildSelector(event.element!))}
                                    >
                                      Copy Selector
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-400 border-green-500/40 px-2 py-1 text-xs"
                                      onClick={() => copyToClipboard(event.element.text || '')}
                                    >
                                      Copy Text
                                    </Button>
                                  </div>
                                </div>
                              )}
                              {/* Mocked referenced functions/files */}
                              <div className="mt-2">
                                <strong>Referenced in:</strong>
                                <ul className="list-disc ml-4 text-green-300">
                                  <li>Button.tsx</li>
                                  <li>handleClick()</li>
                                  <li>Header.tsx</li>
                                </ul>
                              </div>
                              <div className="mt-2 text-cyan-200">
                                <strong>Description:</strong> {event.element ? `This is a ${event.element.tag}${event.element.id ? ' with id ' + event.element.id : ''}${event.element.classes.length ? ' and classes ' + event.element.classes.join(', ') : ''}.` : ''}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
            {/* Suggestions & Feedback Panel (flex-grow, right) */}
            <div
              className="z-50 bg-slate-900/95 border border-green-500/40 border-cyan-500/30 rounded-lg shadow-lg flex flex-col"
              style={{
                flexGrow: 1,
                height: 320,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-green-500/20">
                <span className="text-cyan-400 font-bold text-sm">Suggestions & Feedback</span>
              </div>
              <ScrollArea className="flex-1 p-2 overflow-y-auto">
                <div className="space-y-2">
                  {suggestionHistory.length === 0 ? (
                    <div className="text-gray-500 text-center py-8 text-xs">
                      No suggestions yet.
                    </div>
                  ) : (
                    suggestionHistory.map(item => (
                      <div key={item.id} className="border-b border-cyan-500/10 pb-2 mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                          <button
                            onClick={() => copyToClipboard(item.response)}
                            aria-label="Copy suggestion"
                            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            tabIndex={0}
                          >
                            <Copy className="w-4 h-4" /> Copy
                          </button>
                        </div>
                        <div className="text-green-300 text-xs mb-1"><strong>Prompt:</strong> {item.prompt}</div>
                        <div className="p-2 bg-slate-800/70 rounded text-green-200 text-sm whitespace-pre-line w-full max-w-full min-h-12 max-h-[20vh] overflow-auto font-mono">
                          {item.response}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* Debug/Chat Terminal Panel */}
      {(showTerminal || events.some(e => e.type === 'llm_response')) && (
        <div
          className="fixed z-50 bg-slate-900/95 border border-cyan-500/40 rounded-lg shadow-lg"
          style={{ left: 250, top: 520, right: 22, height: 320, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/20">
            <span className="text-cyan-400 font-bold text-sm">Debug Response Chat</span>
            <Button onClick={() => setShowTerminal(false)} variant="ghost" size="sm" className="text-gray-400">✕</Button>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {events.filter(e => e.type === 'llm_response').length === 0 ? (
                <div className="text-gray-500 text-center py-8 text-xs">
                  No debug responses yet.
                </div>
              ) : (
                events.filter(e => e.type === 'llm_response').map(event => (
                  <div key={event.id} className="text-xs border-l-2 border-cyan-500/30 pl-2 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">LLM</Badge>
                      <span className="text-gray-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.prompt && (
                      <div className="text-green-300 mt-1">
                        <strong>Prompt:</strong> {event.prompt}
                      </div>
                    )}
                    {event.response && (
                      <div className="mt-2">
                        <div className="flex justify-end mb-1">
                          <button
                            onClick={() => copyToClipboard(event.response!)}
                            aria-label="Copy debug response"
                            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            tabIndex={0}
                          >
                            <Copy className="w-4 h-4" /> Copy
                          </button>
                        </div>
                        <div className="p-3 bg-slate-800/70 rounded text-green-200 text-sm whitespace-pre-line w-full max-w-full min-h-24 max-h-[40vh] overflow-auto font-mono">
                          <strong>AI Response:</strong><br />
                          {event.response}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Mouse Overlay */}
      {isEnabled && overlayElement && (
        <div
          id="logtrace-overlay"
          ref={overlayRef}
          className="fixed pointer-events-none z-50"
          style={{
            left: overlayPosition.x + 18,
            top: overlayPosition.y - 10,
          }}
        >
          <Card className="bg-slate-900/95 border-cyan-500/50 backdrop-blur-md shadow-xl shadow-cyan-500/20 w-[260px] h-[340px] flex flex-col">
            <div className="p-3 text-xs overflow-y-auto h-full">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 text-xs">
                  {overlayElement.tag}
                </Badge>
                {overlayElement.id && (
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                    #{overlayElement.id}
                  </Badge>
                )}
                {(showDebugModal || showQuickImproveModal) && (
                  <Badge variant="outline" className="border-yellow-500/70 text-yellow-400 text-xs ml-2 animate-pulse">
                    Mouse Frozen
                  </Badge>
                )}
              </div>
              {overlayElement.classes.length > 0 && (
                <div className="text-green-300 mb-1">
                  .{overlayElement.classes.join(' .')}
                </div>
              )}
              {overlayElement.text && (
                <div className="text-gray-300 max-w-48 truncate">
                  "{overlayElement.text}"
                </div>
              )}
              {/* Minimal summary and quick commands only when inspector is enabled */}
              {inspectorEnabled ? (
                <div className="text-cyan-300 mt-2 text-xs">
                  Ctrl+D to debug • Ctrl+E to quick improve
                </div>
              ) : (
                // If not inspector, show full data dictionary after click
                !lastClickedElement && (
                  <div className="text-cyan-300 mt-2 text-xs">
                    Ctrl+D to debug • Ctrl+E to quick improve
                  </div>
                )
              )}
              {/* If not inspector and clicked, show full data dictionary and details (but no description or references) */}
              {!inspectorEnabled && lastClickedElement && (
                <div className="mt-2 bg-slate-800/60 p-2 rounded text-xs border border-green-500/10">
                  <div className="mb-2">
                    <div className="text-cyan-200"><strong>Tag:</strong> <span className="text-green-200">{lastClickedElement.tag}</span></div>
                    {lastClickedElement.id && <div className="text-cyan-200"><strong>ID:</strong> <span className="text-green-200">{lastClickedElement.id}</span></div>}
                    {lastClickedElement.classes.length > 0 && <div className="text-cyan-200"><strong>Classes:</strong> <span className="text-green-200">{lastClickedElement.classes.join(', ')}</span></div>}
                    {lastClickedElement.text && <div className="text-cyan-200"><strong>Text:</strong> <span className="text-green-200">"{lastClickedElement.text}"</span></div>}
                    {(lastClickedElement as any).attributes && Object.keys((lastClickedElement as any).attributes).length > 0 && (
                      <div className="text-cyan-200"><strong>Attributes:</strong> <span className="text-green-200">{Object.entries((lastClickedElement as any).attributes).map(([k, v]) => `${k}="${v}"`).join(', ')}</span></div>
                    )}
                    {mouseTrackingEnabled && (
                      <div className="text-cyan-200"><strong>Position:</strong> <span className="text-green-200">x:{lastClickedElement.element?.getBoundingClientRect().x.toFixed(0)}, y:{lastClickedElement.element?.getBoundingClientRect().y.toFixed(0)}</span></div>
                    )}
                  </div>
                </div>
              )}
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

      {/* Quick Improve Modal */}
      <Dialog open={showQuickImproveModal} onOpenChange={setShowQuickImproveModal}>
        <DialogContent className="bg-slate-900 border-cyan-500/50">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Quick Improve Assistant</DialogTitle>
          </DialogHeader>
          <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-green-500/30">
            <h4 className="text-green-400 font-semibold mb-2">Element Context</h4>
            {hoveredElement && (
              <div className="text-sm text-green-300">
                <div><strong>Tag:</strong> {hoveredElement.tag}</div>
                {hoveredElement.id && <div><strong>ID:</strong> {hoveredElement.id}</div>}
                {hoveredElement.classes.length > 0 && (
                  <div><strong>Classes:</strong> {hoveredElement.classes.join(', ')}</div>
                )}
                <div><strong>Text:</strong> "{hoveredElement.text}"</div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <Textarea
              value={quickImprovePrompt}
              onChange={e => setQuickImprovePrompt(e.target.value)}
              className="bg-slate-800 border-green-500/30 text-green-400 min-h-24"
              placeholder="Describe what you want to improve..."
            />
            <Button
              onClick={handleQuickImproveSubmit}
              disabled={isLoading || !apiKey}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isLoading ? 'Analyzing...' : 'Suggest Improvements'}
            </Button>
            {quickImproveResponse && (
              <div className="mt-4">
                <div className="flex justify-end mb-1">
                  <button
                    onClick={() => copyToClipboard(quickImproveResponse)}
                    aria-label="Copy suggestions"
                    className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    tabIndex={0}
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                </div>
                <div className="p-3 bg-slate-800/70 rounded text-green-200 text-sm whitespace-pre-line w-full max-w-full min-h-24 max-h-[40vh] overflow-auto font-mono">
                  <strong>Suggestions:</strong><br />
                  {quickImproveResponse}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="bg-slate-900 border-cyan-500/50 max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-green-400 font-semibold mb-2">OpenAI API Key</label>
              <Input
                type="password"
                placeholder="Enter your OpenAI API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-slate-800 border-green-500/30 text-green-400"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveApiKey} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                Save
              </Button>
              <Button onClick={() => setShowSettingsModal(false)} variant="outline" className="border-gray-500 text-gray-400">
                Cancel
              </Button>
            </div>
            {/* Granular Tools Section */}
            <div className="mt-6">
              <h4 className="text-cyan-300 font-semibold mb-2">Granular Tools</h4>
              <div className="flex items-center gap-3 mb-2">
                <Switch
                  checked={mouseTrackingEnabled}
                  onCheckedChange={setMouseTrackingEnabled}
                  className="data-[state=checked]:bg-cyan-500"
                />
                <span className={mouseTrackingEnabled ? 'text-cyan-400' : 'text-gray-500'}>
                  Mouse X/Y Tracking {mouseTrackingEnabled ? '(On)' : '(Off)'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={inspectorEnabled}
                  onCheckedChange={setInspectorEnabled}
                  className="data-[state=checked]:bg-cyan-500"
                />
                <span className={inspectorEnabled ? 'text-cyan-400' : 'text-gray-500'}>
                  Element Inspector {inspectorEnabled ? '(On)' : '(Off)'}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                When enabled, pointer position is included in the data dictionary for clicked elements. Inspector highlights element box model.
              </div>
            </div>
          </div>
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onClick={() => setShowSettingsModal(false)}
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogContent>
      </Dialog>

      {/* Fixed-Position Inspection Panel */}
      {inspectorEnabled && isEnabled && overlayElement && inspectorPanelOpen && (
        <div className="fixed z-50 bottom-6 right-6 bg-slate-900 border border-cyan-500/60 rounded-lg shadow-2xl w-[340px] max-w-full max-h-[80vh] p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-400 font-bold text-sm">Element Inspector</span>
            <button
              onClick={() => setInspectorPanelOpen(false)}
              className="text-gray-400 hover:text-white text-lg font-bold px-2"
              aria-label="Close Inspector"
            >
              ×
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            <ul className="space-y-2">
              {getElementHierarchy(overlayElement.element).map((el, idx, arr) => {
                const text = el.textContent?.trim() || '';
                const isLong = text.length > 60;
                return (
                  <li key={idx} className="bg-slate-800/80 rounded p-2 flex flex-col gap-1 border border-cyan-500/10">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300 font-mono text-xs">{el.tagName.toLowerCase()}</span>
                      {el.id && <span className="text-green-300 text-xs">#{el.id}</span>}
                      {el.classList.length > 0 && <span className="text-yellow-300 text-xs">.{Array.from(el.classList).join('.')}</span>}
                    </div>
                    {text && (
                      <div>
                        <span className="text-gray-300 text-xs">
                          "{isLong ? (
                            <span
                              className="underline cursor-pointer hover:text-cyan-300"
                              onClick={() => { setFullTextContent(text); setShowFullTextModal(true); }}
                              title="Click to view full text"
                            >
                              {text.slice(0, 60)}... (more)
                            </span>
                          ) : text}"
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-1">
                      <button
                        className="flex items-center gap-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        onClick={() => copyToClipboard(el.outerHTML)}
                        tabIndex={0}
                      >
                        <span role="img" aria-label="Copy">📋</span> Copy
                      </button>
                      <button
                        className="flex items-center gap-1 bg-purple-700 hover:bg-purple-600 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                        // Placeholder for edit action
                        onClick={() => toast.success('Edit (magic sparkle) coming soon!')}
                        tabIndex={0}
                      >
                        <span role="img" aria-label="Edit">✨</span> Edit
                      </button>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="border-l-2 border-cyan-500/20 h-3 ml-2"></div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Full text modal */}
      {showFullTextModal && fullTextContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-900 border border-cyan-500/60 rounded-lg shadow-2xl w-[600px] max-w-full max-h-[80vh] p-8 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-bold text-lg">Full Text Content</span>
              <button
                onClick={() => setShowFullTextModal(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold px-2"
                aria-label="Close Full Text"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto text-green-200 text-base whitespace-pre-line break-words p-4 bg-slate-800 rounded border border-cyan-700 font-sans leading-relaxed" style={{ minHeight: '200px', maxHeight: '60vh' }}>
              {formatTextContentForDisplay(fullTextContent)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogTrace; 