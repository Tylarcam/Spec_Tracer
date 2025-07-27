import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { X, Sparkles, Copy, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { ElementInfo, FilteredConsoleLog } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';
import { useToast } from '@/hooks/use-toast';
import { useConsoleLogs } from '@/shared/hooks/useConsoleLogs';
import { useContextEngine } from '@/shared/hooks/useContextEngine';
import { transformContextRequest } from '@/shared/api';
import QuickObjectivePill from './QuickObjectivePill';
import { Badge } from '../ui/badge';
import { supabase } from '@/integrations/supabase/client';

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
  terminalHeight?: number; // height of bottom terminal in pixels
  recordEvent?: (event: any) => void; // Add recordEvent prop
}

const quickObjectives = [
  { label: 'Fix alignment', tooltip: 'Align element to its container or siblings' },
  { label: 'Check accessibility', tooltip: 'Ensure element is accessible (ARIA, contrast, etc.)' },
  { label: 'Make clickable', tooltip: 'Make this element interactive' },
  { label: 'Improve contrast', tooltip: 'Increase text/background contrast' },
  { label: 'Fix overflow/scroll', tooltip: 'Resolve overflow or scrolling issues' },
  { label: 'Add aria-label', tooltip: 'Add ARIA label for accessibility' },
  { label: 'Make responsive', tooltip: 'Ensure element works on all screen sizes' },
  { label: 'Remove outline', tooltip: 'Remove unwanted focus outline' },
  { label: 'Add hover effect', tooltip: 'Add a visual effect on hover' },
  { label: 'Fix font size', tooltip: 'Adjust font size for readability' },
  { label: 'Make button primary', tooltip: 'Style as a primary action button' },
  { label: 'Add tooltip', tooltip: 'Show extra info on hover/focus' },
  { label: 'Fix color contrast', tooltip: 'Improve color contrast for accessibility' },
  { label: 'Add alt text', tooltip: 'Add alt text for images' },
  { label: 'Center element', tooltip: 'Center this element in its container' },
];

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
  maxGuestDebugs = 5,
  terminalHeight = 0,
  recordEvent,
}) => {
  const [userIntent, setUserIntent] = useState('');
  const [advancedPrompt, setAdvancedPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('quick');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isElementContextExpanded, setIsElementContextExpanded] = useState(true);
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedQuickObjective, setSelectedQuickObjective] = useState<string | null>(null);
  const [selectedAdvancedQuestion, setSelectedAdvancedQuestion] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Add viewport state management
  const [viewportInfo, setViewportInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    zoom: window.devicePixelRatio || 1
  });

    // Monitor viewport changes
  useEffect(() => {
    const handleResize = () => {
      setViewportInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        zoom: window.devicePixelRatio || 1
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check authentication status and hide auth prompt if user is signed in
  useEffect(() => {
    if (!isExtensionMode && showAuthPrompt) {
      const checkAuth = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          setShowAuthPrompt(false);
        }
      };
      checkAuth();
    }
  }, [isExtensionMode, showAuthPrompt]);

  // Get console logs for current element
  const currentElementSelector = useMemo(() => {
    if (!currentElement) return undefined;
    let selector = currentElement.tag;
    if (currentElement.id) selector += `#${currentElement.id}`;
    if (currentElement.classes.length > 0) selector += `.${currentElement.classes.join('.')}`;
    return selector;
  }, [currentElement]);

  const { getFilteredLogs } = useConsoleLogs();

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

  // Filter console logs for current element - properly typed as FilteredConsoleLog[]
  const filteredLogs: FilteredConsoleLog[] = useMemo(() => {
    const allFilteredLogs = getFilteredLogs();
    return allFilteredLogs.filter(log => 
      log.associatedElement === currentElementSelector || 
      (log.message.includes(currentElement?.tag || '') && log.message.includes(currentElement?.id || ''))
    );
  }, [getFilteredLogs, currentElementSelector, currentElement]);

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

  // Enhanced responsive detection
  const isMobile = viewportInfo.width <= 768;
  const isTablet = viewportInfo.width > 768 && viewportInfo.width <= 1024;
  const isHighZoom = viewportInfo.zoom > 1.2;
  const isLowZoom = viewportInfo.zoom < 0.8;

  // Calculate responsive modal dimensions
  const safeTerminalHeight = terminalHeight || 0;
  const availableHeight = viewportInfo.height - safeTerminalHeight - (isMobile ? 16 : 32);
  const availableWidth = viewportInfo.width - (isMobile ? 16 : 32);
  
  // Dynamic modal sizing based on viewport and zoom
  const maxModalHeight = isHighZoom 
    ? Math.min(availableHeight * 0.9, availableHeight - 40) // More conservative for high zoom
    : Math.min(availableHeight * 0.95, availableHeight - 20);
    
  const maxModalWidth = isMobile 
    ? availableWidth 
    : Math.min(availableWidth, isTablet ? 800 : 1024);

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
    
    // Check authentication for main app
    if (!isExtensionMode) {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setShowAuthPrompt(true);
        return;
      }
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

  const handleGeneratePrompt = async () => {
    if (!userIntent.trim()) {
      toast({
        title: 'User Intent Required',
        description: 'Please enter your intent before generating a prompt.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGeneratingPrompt(true);
      setErrorMessage(null);

      // Generate the raw request using context engine
      const rawRequest = contextEngine.generatePrompt();
      
      // Transform the raw request into a proper prompt
      const transformResult = await transformContextRequest(rawRequest);
      
      // Set the generated prompt in state
      setGeneratedPrompt(transformResult.transformedPrompt);
      
      // Log the generated prompt to the terminal
      if (recordEvent) {
        recordEvent({
          id: `prompt-${Date.now()}`,
          type: 'llm_response',
          timestamp: new Date().toISOString(),
          position: mousePosition,
          element: currentElement,
          prompt: transformResult.originalRequest,
          response: transformResult.transformedPrompt,
        });
      }

      // Switch to the prompt tab
      setActiveTab('prompt');
      
      toast({
        title: 'Context Prompt Generated',
        description: 'A detailed prompt has been generated based on your input and element context.',
        variant: 'default',
      });

    } catch (error: any) {
      console.error('Prompt generation error:', error);
      const msg = error?.message || 'Failed to generate context prompt';
      setErrorMessage(msg);
      toast({
        title: 'Prompt Generation Failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
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
    <div
      data-debug-modal
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      style={{ 
        bottom: safeTerminalHeight,
        padding: isMobile ? '8px' : '16px'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="debug-modal-title"
    >
      <Card 
        id="logtrace-modal"
        ref={modalRef}
        data-debug-modal
        className="bg-slate-900/95 border-cyan-500/50 w-full flex flex-col overflow-hidden"
        style={{ 
          maxWidth: maxModalWidth,
          maxHeight: maxModalHeight,
          minHeight: isMobile ? '50vh' : '400px',
          height: 'auto'
        }}
      >
        {/* Header - Always visible */}
        <div className={`${isMobile ? 'p-3' : 'p-4'} flex items-center justify-between border-b border-cyan-500/20 flex-shrink-0 bg-slate-900/80`}>
          <h3 id="debug-modal-title" className={`font-bold text-cyan-400 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Debug Assistant
          </h3>
          <Button 
            data-close-button
            onClick={() => setShowDebugModal(false)}
            variant="ghost" 
            className="text-gray-400 hover:text-white"
            size={isMobile ? "sm" : "default"}
          >
            <X className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </Button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Element Context Section - Collapsible */}
          {currentElement && (
            <div className={`${isMobile ? 'mx-3 mt-3' : 'mx-4 mt-4'} bg-slate-800/50 rounded-lg border border-green-500/30 flex-shrink-0`}>
              <button
                onClick={() => setIsElementContextExpanded(!isElementContextExpanded)}
                className={`w-full flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'} text-left hover:bg-slate-700/30 transition-colors`}
                aria-expanded={isElementContextExpanded}
              >
                <h4 className={`text-green-400 font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Element Context
                </h4>
                {isElementContextExpanded ? (
                  <ChevronUp className={`text-green-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                ) : (
                  <ChevronDown className={`text-green-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                )}
              </button>
              
              {isElementContextExpanded && (
                <div className={`${isMobile ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
                  <div className={`space-y-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        {currentElement.tag.toUpperCase()}
                      </Badge>
                      {(['button','a','input','select','textarea'].includes(currentElement.tag) || currentElement.element?.onclick != null) && (
                        <Badge variant="outline" className="border-green-500/30 text-green-400 ml-2">
                          Interactive
                        </Badge>
                      )}
                    </div>
                    
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-1">
                      {currentElement.id && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">ID:</span>
                          <span className="text-green-300 font-mono text-right break-all">#{sanitizeText(currentElement.id)}</span>
                        </div>
                      )}
                      {currentElement.classes.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Classes:</span>
                          <span className="text-green-300 font-mono text-right break-all">.{currentElement.classes.map(c => sanitizeText(c)).join(' .')}</span>
                        </div>
                      )}
                      {currentElement.text && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Text:</span>
                          <span className="text-gray-300 text-right break-all max-w-[60%]">"{sanitizeText(currentElement.text)}"</span>
                        </div>
                      )}
                      {currentElement.attributes?.find(attr => attr.name === 'data-lov-id') && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">data-lov-id:</span>
                          <span className="text-blue-300 font-mono text-right break-all">{currentElement.attributes.find(attr => attr.name === 'data-lov-id')?.value}</span>
                        </div>
                      )}
                    </div>

                    {/* Attributes Table - Horizontal Scroll */}
                    {currentElement.attributes && currentElement.attributes.length > 0 && (
                      <div className="mt-3">
                        <div className={`font-semibold text-green-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          All Attributes
                        </div>
                        <div className="overflow-x-auto border border-green-500/10 rounded bg-slate-800/40">
                          <table className="w-full text-xs min-w-full">
                            <thead>
                              <tr className="text-left text-green-300">
                                <th className="py-1 px-2 font-semibold whitespace-nowrap">attribute</th>
                                <th className="py-1 px-2 font-semibold whitespace-nowrap">value</th>
                                <th className="py-1 px-2 font-semibold whitespace-nowrap">actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentElement.attributes.map(attr => (
                                <tr key={attr.name} className="border-t border-green-500/5">
                                  <td className="py-1 px-2 text-gray-400 align-top whitespace-nowrap">{attr.name}</td>
                                  <td className="py-1 px-2 text-orange-300 font-mono align-top break-all whitespace-pre-wrap max-w-[200px]">
                                    {sanitizeText(attr.value)}
                                  </td>
                                  <td className="py-1 px-2 align-top whitespace-nowrap">
                                    <button
                                      className="text-cyan-400 hover:text-cyan-200 px-1"
                                      onClick={() => {
                                        navigator.clipboard.writeText(attr.value);
                                        toast({ title: 'Copied', description: `Copied value for ${attr.name}`, variant: 'default' });
                                      }}
                                      title="Copy value"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tabs Section - Scrollable */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <TabsList className={`grid w-full grid-cols-3 bg-slate-800/50 flex-shrink-0 ${isMobile ? 'h-8 mx-3' : 'h-10 mx-4'}`}>
                <TabsTrigger value="quick" className={`data-[state=active]:bg-cyan-600 ${isMobile ? 'text-xs px-2' : 'text-sm'}`}>
                  <div className="flex items-center gap-1">
                    <Zap className={`text-cyan-400 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    <span>Quick Debug</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="advanced" className={`data-[state=active]:bg-cyan-600 ${isMobile ? 'text-xs px-2' : 'text-sm'}`}>
                  Advanced
                </TabsTrigger>
                <TabsTrigger value="prompt" className={`data-[state=active]:bg-cyan-600 ${isMobile ? 'text-xs px-1' : 'text-sm'}`}>
                  <div className="flex items-center gap-1">
                    <Sparkles className={`text-yellow-400 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    <span className={isMobile ? 'hidden' : ''}>Prompt</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              {/* Tab Content - Scrollable */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <TabsContent value="quick" className={`${isMobile ? 'space-y-3 mt-3 mx-3' : 'space-y-4 mt-4 mx-4'} h-full overflow-y-auto pb-4`}>
                  {/* Direct AI Debug Description */}
                  <div className={`${isMobile ? 'p-2' : 'p-3'} bg-cyan-500/10 rounded-lg border border-cyan-500/20`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className={`text-cyan-400 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                      <span className={`text-cyan-400 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>Direct AI Debug</span>
                    </div>
                    <p className={`text-cyan-300/80 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Type your request and get an immediate AI response. No complex setup needed.
                    </p>
                  </div>

                  {/* Quick Objective Pills - Horizontal Scroll */}
                  <div className="overflow-x-auto">
                    <div className="flex gap-2 mb-3 min-w-max" role="listbox" aria-label="Quick Debug Objectives">
                      {quickObjectives.map((obj, idx) => (
                        <button
                          key={obj.label}
                          className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} rounded-full font-semibold border border-cyan-500/30 bg-slate-800 text-cyan-300 hover:bg-cyan-700/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 whitespace-nowrap ${selectedQuickObjective === obj.label ? 'bg-cyan-600 text-white' : ''}`}
                          onClick={() => {
                            setSelectedQuickObjective(obj.label);
                            setUserIntent(obj.label);
                            setTimeout(() => inputRef.current?.focus(), 0);
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedQuickObjective(obj.label);
                              setUserIntent(obj.label);
                              setTimeout(() => inputRef.current?.focus(), 0);
                            }
                          }}
                          tabIndex={0}
                          role="option"
                          aria-selected={selectedQuickObjective === obj.label}
                          title={obj.tooltip}
                        >
                          {obj.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Section */}
                  <div className="space-y-3">
                    <label className={`block text-cyan-400 font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                      What do you want to change or fix?
                    </label>
                    <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                      <Input
                        ref={inputRef}
                        value={userIntent}
                        onChange={(e) => {
                          setUserIntent(e.target.value);
                          setSelectedQuickObjective(null);
                        }}
                        className={`bg-slate-800 border-green-500/30 text-green-400 flex-1 ${isMobile ? 'text-sm' : ''}`}
                        placeholder="e.g., Make responsive, Fix alignment, Add hover effect..."
                        maxLength={500}
                      />
                      <Button 
                        onClick={() => handleDebugSubmit(userIntent)}
                        disabled={isAnalyzing || !userIntent.trim()}
                        className={`bg-green-600 hover:bg-green-700 text-white ${isMobile ? 'text-sm h-10' : ''}`}
                        size={isMobile ? "sm" : "default"}
                      >
                        <Zap className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
                        {isAnalyzing ? 'Analyzing...' : 'Debug Now'}
                      </Button>
                    </div>
                  </div>

                </TabsContent>

                {/* Authentication Prompt - Global for all tabs */}
                {showAuthPrompt && (
                  <div className={`${isMobile ? 'mx-3 mb-3' : 'mx-4 mb-4'} p-4 bg-orange-500/10 rounded-lg border border-orange-500/30`}>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className={`text-orange-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className={`text-orange-400 font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>Authentication Required</span>
                    </div>
                    <p className={`text-orange-300/90 ${isMobile ? 'text-xs' : 'text-sm'} mb-3`}>
                      AI debugging features require you to be signed in. Please sign in to continue.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => window.location.href = '/auth'}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        size={isMobile ? "sm" : "default"}
                      >
                        Sign In
                      </Button>
                      <Button 
                        onClick={() => setShowAuthPrompt(false)}
                        variant="outline"
                        className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                        size={isMobile ? "sm" : "default"}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <TabsContent value="advanced" className={`${isMobile ? 'space-y-3 mt-3 mx-3' : 'space-y-4 mt-4 mx-4'} h-full overflow-y-auto pb-4`}>
                  <div className="space-y-3">
                    <label className={`block text-cyan-400 font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                      Target Context For Debug
                    </label>
                    
                    {/* Contextual guidance block */}
                    {currentElement && (
                      <div className={`p-3 rounded bg-slate-800/70 border border-cyan-500/20 ${isMobile ? 'text-xs' : 'text-sm'} text-cyan-200 space-y-1`}>
                        <div><span className="font-bold">Tag:</span> &lt;{currentElement.tag}&gt; {currentElement.id && <span className="ml-2 font-mono text-green-300">#{sanitizeText(currentElement.id)}</span>}</div>
                        {currentElement.classes.length > 0 && <div><span className="font-bold">Classes:</span> <span className="font-mono text-green-300">.{currentElement.classes.map(c => sanitizeText(c)).join(' .')}</span></div>}
                        {currentElement.text && <div><span className="font-bold">Text:</span> <span className="text-gray-300">"{sanitizeText(currentElement.text)}"</span></div>}
                        {(['button','a','input','select','textarea'].includes(currentElement.tag) || currentElement.element?.onclick != null) && <div><span className="font-bold text-green-400">Interactive element</span></div>}
                        {currentElement.attributes && currentElement.attributes.length > 0 && (
                          <div><span className="font-bold">Key attributes:</span> {currentElement.attributes.slice(0,3).map(attr => <span key={attr.name} className="ml-1 font-mono text-orange-300">{attr.name}="{sanitizeText(attr.value)}"</span>)}</div>
                        )}
                        {eventListeners.length > 0 && <div><span className="font-bold">Event listeners:</span> <span className="font-mono text-purple-300">{eventListeners.join(', ')}</span></div>}
                        {computedStyles && (
                          <div><span className="font-bold">Styles:</span> <span className="font-mono text-blue-300">display={computedStyles.display}, visibility={computedStyles.visibility}, pointer-events={computedStyles.pointerEvents}</span></div>
                        )}
                      </div>
                    )}
                    
                    {/* Advanced Debug Questions - Horizontal Scroll */}
                    <div>
                      <label className={`block text-cyan-400 font-semibold mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                        Select a Question
                      </label>
                      <div className="overflow-x-auto">
                        <div className="flex gap-2 min-w-max">
                          {[
                            'Why might this element not be behaving as expected?',
                            'Are there any CSS properties preventing interaction?',
                            'Are there any event listeners that might be interfering?',
                            'What accessibility concerns might exist?',
                            'How could the user experience be improved?'
                          ].map((q, idx) => (
                            <button
                              key={q}
                              className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} rounded-full font-semibold border border-cyan-500/30 bg-slate-800 text-cyan-300 hover:bg-cyan-700/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 whitespace-nowrap ${selectedAdvancedQuestion === q ? 'bg-cyan-600 text-white' : ''}`}
                              onClick={() => setSelectedAdvancedQuestion(q)}
                              tabIndex={0}
                              role="option"
                              aria-selected={selectedAdvancedQuestion === q}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Textarea
                      value={advancedPrompt}
                      onChange={(e) => setAdvancedPrompt(e.target.value)}
                      className={`bg-slate-800 border-green-500/30 text-green-400 ${isMobile ? 'min-h-20 text-sm' : 'min-h-32'}`}
                      placeholder="Describe your advanced debug question or issue..."
                      maxLength={2000}
                    />
                    <Button 
                      onClick={async () => {
                        let contextInfo = '';
                        if (currentElement) {
                          const isInteractive = ['button','a','input','select','textarea'].includes(currentElement.tag) || currentElement.element?.onclick != null;
                          const eventListeners = [];
                          const el = currentElement.element as any;
                          [
                            'onclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmouseout',
                            'onmouseenter', 'onmouseleave', 'onkeydown', 'onkeyup', 'oninput',
                            'onchange', 'onfocus', 'onblur', 'onsubmit'
                          ].forEach(listener => {
                            if (typeof el[listener] === 'function') eventListeners.push(listener);
                          });
                          const styles = window.getComputedStyle(currentElement.element);
                          contextInfo = `Target Context For Debug:\n- Tag: <${currentElement.tag}>\n- ID: ${currentElement.id || 'none'}\n- Classes: ${currentElement.classes.join(', ') || 'none'}\n- Text: "${currentElement.text || 'none'}"\n- Interactive: ${isInteractive ? 'Yes' : 'No'}\n- Event Listeners: ${eventListeners.join(', ') || 'none'}\n- Styles: display=${styles.display}, visibility=${styles.visibility}, pointer-events=${styles.pointerEvents}`;
                        }
                        const selectedQuestion = selectedAdvancedQuestion ? `Selected Question: ${selectedAdvancedQuestion}\n` : '';
                        const userInput = advancedPrompt ? `User Input: ${advancedPrompt}\n` : '';
                        const fullPrompt = `${selectedQuestion}${userInput}${contextInfo}`;
                        await handleDebugSubmit(fullPrompt);
                      }}
                      disabled={isAnalyzing}
                      className={`bg-cyan-600 hover:bg-cyan-700 text-white w-full ${isMobile ? 'text-sm h-10' : ''}`}
                      size={isMobile ? "sm" : "default"}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Advanced Debug'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="prompt" className={`${isMobile ? 'space-y-3 mt-3 mx-3' : 'space-y-4 mt-4 mx-4'} h-full overflow-y-auto pb-4`}>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between ${isMobile ? 'mb-1' : 'mb-2'}`}>
                      <label className={`text-cyan-400 font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                        Generated Context Prompt
                      </label>
                      <Button 
                        onClick={handleCopyPrompt}
                        disabled={!generatedPrompt}
                        variant="outline"
                        className={`border-green-500/30 text-green-400 hover:bg-green-500/10 ${isMobile ? 'text-xs h-8' : ''}`}
                        size={isMobile ? "sm" : "sm"}
                      >
                        <Copy className={`${isMobile ? 'w-3 h-3 mr-0.5' : 'w-4 h-4 mr-1'}`} /> Copy
                      </Button>
                    </div>
                    <ScrollArea className={`w-full rounded-md border border-green-500/30 ${isMobile ? 'h-40' : 'h-64'}`}>
                      <Textarea
                        value={generatedPrompt}
                        onChange={(e) => setGeneratedPrompt(e.target.value)}
                        className={`bg-slate-800 border-none text-green-400 resize-none ${isMobile ? 'min-h-40 text-sm' : 'min-h-60'}`}
                        placeholder="Generated prompt will appear here..."
                        readOnly={!generatedPrompt}
                      />
                    </ScrollArea>
                    {generatedPrompt && (
                      <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                        <Button 
                          onClick={() => handleDebugSubmit(generatedPrompt)}
                          disabled={isAnalyzing}
                          className={`bg-purple-600 hover:bg-purple-700 text-white flex-1 ${isMobile ? 'text-sm h-10' : ''}`}
                          size={isMobile ? "sm" : "default"}
                        >
                          {isAnalyzing ? 'Analyzing..' : 'Debug with Generated Prompt'}
                        </Button>
                        <Button 
                          onClick={handleCopyPrompt}
                          variant="outline"
                          className={`border-green-500/30 text-green-400 hover:bg-green-500/10 ${isMobile ? 'text-sm h-10' : ''}`}
                          size={isMobile ? "sm" : "default"}
                        >
                          <Copy className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1'}`} /> Copy to Clipboard
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Error Message - Always visible at bottom */}
          {errorMessage && (
            <div className={`${isMobile ? 'mx-3 mb-3 p-2' : 'mx-4 mb-4 p-3'} bg-red-800/60 text-red-200 rounded animate-pulse ${isMobile ? 'text-sm' : 'text-base'} flex-shrink-0`}>
              {errorMessage}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DebugModal;
