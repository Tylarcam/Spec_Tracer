
/**
 * LogTrace component optimized for Chrome extension
 */

import React, { useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { sanitizeText } from '@/utils/sanitization';

const LogTraceExtension: React.FC = () => {
  const {
    isActive,
    setIsActive,
    mousePosition,
    setMousePosition,
    currentElement,
    setCurrentElement,
    showDebugModal,
    setShowDebugModal,
    showTerminal,
    setShowTerminal,
    events,
    isAnalyzing,
    overlayRef,
    modalRef,
    addEvent,
    extractElementInfo,
    analyzeWithAI,
    clearEvents,
    exportEvents,
  } = useLogTrace();

  const [quickPrompt, setQuickPrompt] = React.useState('Why did this happen?');
  const [advancedPrompt, setAdvancedPrompt] = React.useState('');

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive) return;
    
    const target = e.target as HTMLElement;
    if (target && !target.closest('#logtrace-overlay') && !target.closest('#logtrace-modal')) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      const elementInfo = extractElementInfo(target);
      setCurrentElement(elementInfo);
      
      addEvent({
        type: 'move',
        position: { x: e.clientX, y: e.clientY },
        element: {
          tag: elementInfo.tag,
          id: elementInfo.id,
          classes: elementInfo.classes,
          text: elementInfo.text,
        },
      });
    }
  }, [isActive, extractElementInfo, addEvent, setMousePosition, setCurrentElement]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!isActive) return;
    
    const target = e.target as HTMLElement;
    if (target && !target.closest('#logtrace-overlay') && !target.closest('#logtrace-modal')) {
      addEvent({
        type: 'click',
        position: { x: e.clientX, y: e.clientY },
        element: currentElement ? {
          tag: currentElement.tag,
          id: currentElement.id,
          classes: currentElement.classes,
          text: currentElement.text,
        } : undefined,
      });
    }
  }, [isActive, currentElement, addEvent]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isActive && e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      setShowDebugModal(true);
      addEvent({
        type: 'debug',
        position: mousePosition,
        element: currentElement ? {
          tag: currentElement.tag,
          id: currentElement.id,
          classes: currentElement.classes,
          text: currentElement.text,
        } : undefined,
      });
    }
  }, [isActive, mousePosition, currentElement, addEvent, setShowDebugModal]);

  // Set up event listeners for extension context
  useEffect(() => {
    if (isActive) {
      document.addEventListener('mousemove', handleMouseMove, true);
      document.addEventListener('click', handleClick, true);
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove, true);
        document.removeEventListener('click', handleClick, true);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isActive, handleMouseMove, handleClick, handleKeyDown]);

  const generateAdvancedPrompt = useCallback((): string => {
    if (!currentElement) return '';
    
    const element = currentElement.element;
    const styles = window.getComputedStyle(element);
    const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(currentElement.tag) || 
                         element.onclick !== null || 
                         styles.cursor === 'pointer';

    return `Debug this element in detail:

Element: <${currentElement.tag}${currentElement.id ? ` id="${sanitizeText(currentElement.id)}"` : ''}${currentElement.classes.length ? ` class="${currentElement.classes.map(c => sanitizeText(c)).join(' ')}"` : ''}>
Text: "${sanitizeText(currentElement.text)}"
Position: x:${mousePosition.x}, y:${mousePosition.y}
Interactive: ${isInteractive ? 'Yes' : 'No'}
Cursor: ${styles.cursor}
Display: ${styles.display}
Visibility: ${styles.visibility}
Pointer Events: ${styles.pointerEvents}

Consider:
1. Why might this element not be behaving as expected?
2. Are there any CSS properties preventing interaction?
3. Are there any event listeners that might be interfering?
4. What accessibility concerns might exist?
5. How could the user experience be improved?

Provide specific, actionable debugging steps and potential solutions.`;
  }, [currentElement, mousePosition]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[2147483647] font-mono">
      {/* Floating Control Panel */}
      <div className="fixed top-4 right-4 pointer-events-auto z-[2147483648]">
        <Card className="bg-slate-900/95 border-cyan-500/50 backdrop-blur-md shadow-xl">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Switch 
                checked={isActive} 
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-cyan-500"
              />
              <span className={`text-sm ${isActive ? "text-cyan-400" : "text-gray-500"}`}>
                {isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <Button 
              onClick={() => setShowTerminal(!showTerminal)}
              variant="outline"
              size="sm"
              className="border-green-500 text-green-400 hover:bg-green-500/10 w-full"
            >
              Terminal
            </Button>
          </div>
        </Card>
      </div>

      {/* Mouse Overlay */}
      {isActive && currentElement && (
        <div
          id="logtrace-overlay"
          ref={overlayRef}
          className="fixed pointer-events-none z-[2147483647] transform -translate-y-full -translate-x-1/2"
          style={{
            left: mousePosition.x,
            top: mousePosition.y - 10,
          }}
        >
          <Card className="bg-slate-900/95 border-cyan-500/50 backdrop-blur-md shadow-xl shadow-cyan-500/20">
            <div className="p-3 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 text-xs">
                  {currentElement.tag}
                </Badge>
                {currentElement.id && (
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                    #{sanitizeText(currentElement.id)}
                  </Badge>
                )}
              </div>
              {currentElement.classes.length > 0 && (
                <div className="text-green-300 mb-1">
                  .{currentElement.classes.map(c => sanitizeText(c)).join(' .')}
                </div>
              )}
              {currentElement.text && (
                <div className="text-gray-300 max-w-48 truncate">
                  "{sanitizeText(currentElement.text)}"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2147483649] flex items-center justify-center p-4 pointer-events-auto">
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

              {currentElement && (
                <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-green-500/30">
                  <h4 className="text-green-400 font-semibold mb-2">Element Context</h4>
                  <div className="text-sm text-green-300">
                    <div><strong>Tag:</strong> {currentElement.tag}</div>
                    {currentElement.id && <div><strong>ID:</strong> {sanitizeText(currentElement.id)}</div>}
                    {currentElement.classes.length > 0 && (
                      <div><strong>Classes:</strong> {currentElement.classes.map(c => sanitizeText(c)).join(', ')}</div>
                    )}
                    <div><strong>Position:</strong> x:{mousePosition.x}, y:{mousePosition.y}</div>
                    {currentElement.text && (
                      <div><strong>Text:</strong> "{sanitizeText(currentElement.text)}"</div>
                    )}
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
                      maxLength={500}
                    />
                    <Button 
                      onClick={async () => {
                        try {
                          await analyzeWithAI(quickPrompt);
                        } catch (error) {
                          alert('AI debugging is not available in extension mode');
                        }
                      }}
                      disabled={isAnalyzing || !quickPrompt.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Debug'}
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
                    maxLength={2000}
                  />
                  <Button 
                    onClick={async () => {
                      try {
                        await analyzeWithAI(advancedPrompt || generateAdvancedPrompt());
                      } catch (error) {
                        alert('AI debugging is not available in extension mode');
                      }
                    }}
                    disabled={isAnalyzing}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white mt-2"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Advanced Debug'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Terminal */}
      {showTerminal && (
        <div className="fixed bottom-0 left-0 right-0 h-96 bg-slate-900/95 border-t border-green-500/50 backdrop-blur-md z-[2147483648] pointer-events-auto">
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
      )}
    </div>
  );
};

export default LogTraceExtension;
