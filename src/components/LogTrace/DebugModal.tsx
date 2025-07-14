
import React, { useState, useMemo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { X, Sparkles, Copy } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { ElementInfo } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';
import { useToast } from '@/hooks/use-toast';
import { useConsoleLogs } from '@/shared/hooks/useConsoleLogs';
import { useContextEngine } from '@/shared/hooks/useContextEngine';

interface DebugModalProps {
  showDebugModal: boolean;
  setShowDebugModal: (show: boolean) => void;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  isAnalyzing: boolean;
  analyzeWithAI: (prompt: string) => Promise<void>;
  generateAdvancedPrompt: () => string;
  modalRef: React.RefObject<HTMLDivElement>;
  // Extension-specific props
  isExtensionMode?: boolean;
  showAuthModal?: boolean;
  setShowAuthModal?: (show: boolean) => void;
  user?: any;
  guestDebugCount?: number;
  maxGuestDebugs?: number;
}

const DebugModal: React.FC<DebugModalProps> = ({
  showDebugModal,
  setShowDebugModal,
  currentElement,
  mousePosition,
  isAnalyzing,
  analyzeWithAI,
  generateAdvancedPrompt,
  modalRef,
  isExtensionMode = false,
  showAuthModal = false,
  setShowAuthModal,
  user,
  guestDebugCount = 0,
  maxGuestDebugs = 3,
}) => {
  const [userIntent, setUserIntent] = useState('');
  const [advancedPrompt, setAdvancedPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('quick');
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get console logs for current element
  const currentElementSelector = useMemo(() => {
    if (!currentElement) return undefined;
    let selector = currentElement.tag;
    if (currentElement.id) selector += `#${currentElement.id}`;
    if (currentElement.classes.length > 0) selector += `.${currentElement.classes.join('.')}`;
    return selector;
  }, [currentElement]);

  const { logs } = useConsoleLogs(currentElementSelector);

  // Get computed styles for current element
  const computedStyles = useMemo(() => {
    if (!currentElement?.element) return {};
    const styles = window.getComputedStyle(currentElement.element);
    return {
      display: styles.display,
      position: styles.position,
      zIndex: styles.zIndex,
      visibility: styles.visibility,
      opacity: styles.opacity,
      pointerEvents: styles.pointerEvents,
      overflow: styles.overflow,
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      fontSize: styles.fontSize,
      fontFamily: styles.fontFamily,
      width: styles.width,
      height: styles.height,
      margin: styles.margin,
      padding: styles.padding,
      border: styles.border,
      flexDirection: styles.flexDirection,
      alignItems: styles.alignItems,
      justifyContent: styles.justifyContent,
      gridTemplateColumns: styles.gridTemplateColumns,
      gridTemplateRows: styles.gridTemplateRows,
    };
  }, [currentElement]);

  // Get event listeners for current element
  const eventListeners = useMemo(() => {
    if (!currentElement?.element) return [];
    const el = currentElement.element as any;
    const listeners = [
      'onclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmouseout',
      'onmouseenter', 'onmouseleave', 'onkeydown', 'onkeyup', 'oninput',
      'onchange', 'onfocus', 'onblur', 'onsubmit'
    ];
    return listeners.filter(listener => typeof el[listener] === 'function');
  }, [currentElement]);

  // Filter console logs for current element
  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.associatedElement === currentElementSelector || 
      (log.message.includes(currentElement?.tag || '') && log.message.includes(currentElement?.id || ''))
    );
  }, [logs, currentElementSelector, currentElement]);

  // Context engine
  const contextEngine = useContextEngine({
    elementInfo: {
      tag: currentElement?.tag || '',
      id: currentElement?.id,
      classes: currentElement?.classes || [],
      text: currentElement?.text,
      parentPath: currentElement?.parentPath,
    },
    computedStyles,
    eventListeners,
    consoleLogs: filteredLogs,
    userIntent,
  });

  if (!showDebugModal) return null;

  // Add guest gating logic for extension
  const handleDebugSubmit = async (prompt: string) => {
    if (!prompt.trim()) {
      toast({
        title: 'Invalid Prompt',
        description: 'Please enter a valid prompt before debugging.',
        variant: 'destructive',
      });
      return;
    }
    // Extension guest gating
    if (isExtensionMode && !user && guestDebugCount >= maxGuestDebugs) {
      setShowAuthModal && setShowAuthModal(true);
      return;
    }
    try {
      setErrorMessage(null);
      await analyzeWithAI(prompt);
    } catch (error: any) {
      console.error('Debug analyze error:', error);
      const msg = error?.message || 'Error getting AI response';
      setErrorMessage(msg);
      toast({
        title: 'Debugging Failed',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  const handleGeneratePrompt = () => {
    const prompt = contextEngine.generatePrompt();
    setGeneratedPrompt(prompt);
    setActiveTab('prompt');
  };

  const handleCopyPrompt = async () => {
    if (!generatedPrompt) {
      toast({
        title: 'No Prompt Generated',
        description: 'Please generate a prompt first.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast({
        title: 'Prompt Copied',
        description: 'The generated prompt has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy prompt to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card 
        id="logtrace-modal"
        ref={modalRef}
        className="bg-slate-900/95 border-cyan-500/50 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-cyan-400">Debug Assistant</h3>
            <Button 
              onClick={() => setShowDebugModal(false)}
              variant="ghost" 
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="quick" className="data-[state=active]:bg-cyan-600">Quick Debug</TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-cyan-600">Advanced</TabsTrigger>
              <TabsTrigger value="prompt" className="data-[state=active]:bg-cyan-600">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Prompt
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="space-y-4">
            <div>
                <label className="block text-cyan-400 font-semibold mb-2">What do you want to change or fix?</label>
              <div className="flex gap-2">
                <Input
                    value={userIntent}
                    onChange={(e) => setUserIntent(e.target.value)}
                  className="bg-slate-800 border-green-500/30 text-green-400"
                    placeholder="Describe what you want to change or fix..."
                  maxLength={500}
                />
                <Button 
                    onClick={() => handleDebugSubmit(userIntent)}
                    disabled={isAnalyzing || !userIntent.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Debug'}
                </Button>
              </div>
            </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleGeneratePrompt}
                  disabled={!userIntent.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-200" />
                  Generate Context Prompt
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
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
                onClick={() => handleDebugSubmit(advancedPrompt || generateAdvancedPrompt())}
                disabled={isAnalyzing}
                className="bg-cyan-600 hover:bg-cyan-700 text-white mt-2"
              >
                {isAnalyzing ? 'Analyzing...' : 'Advanced Debug'}
              </Button>
            </div>
            </TabsContent>

            <TabsContent value="prompt" className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-cyan-400 font-semibold">Generated Context Prompt</label>
                  <Button 
                    onClick={handleCopyPrompt}
                    disabled={!generatedPrompt}
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-1" /> Copy Prompt
                  </Button>
                </div>
                <ScrollArea className="h-64 w-full rounded-md border border-green-500/30">
                  <Textarea
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    className="bg-slate-800 border-none text-green-400 min-h-60 resize-none"
                    placeholder="Generated prompt will appear here..."
                    readOnly={!generatedPrompt}
                  />
                </ScrollArea>
                {generatedPrompt && (
                  <div className="flex gap-2 mt-2">
                    <Button 
                      onClick={() => handleDebugSubmit(generatedPrompt)}
                      disabled={isAnalyzing}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Debug with Generated Prompt'}
                    </Button>
                    <Button 
                      onClick={handleCopyPrompt}
                      variant="outline"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copy to Clipboard
                    </Button>
                  </div>
                )}
          </div>
            </TabsContent>
          </Tabs>

          {errorMessage && (
            <div className="mt-4 bg-red-800/60 text-red-200 p-3 rounded animate-pulse">
              {errorMessage}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DebugModal;
