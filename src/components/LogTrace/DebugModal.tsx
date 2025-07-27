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

    // Monitor viewport changes with more comprehensive event handling
  useEffect(() => {
    const handleResize = () => {
      setViewportInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        zoom: window.devicePixelRatio || 1
      });
    };
    
    const handleOrientationChange = () => {
      // Add delay for orientation change to ensure proper measurements
      setTimeout(handleResize, 100);
    };
    
    const handleZoomChange = () => {
      // Handle zoom changes more responsively
      setTimeout(handleResize, 50);
    };
    
    // Initial measurement
    handleResize();
    
    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('scroll', handleZoomChange);
    
    // Use ResizeObserver for more precise monitoring
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    if (document.body) {
      resizeObserver.observe(document.body);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('scroll', handleZoomChange);
      resizeObserver.disconnect();
    };
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

  // Enhanced responsive detection with zoom awareness
  const isMobile = viewportInfo.width <= 768;
  const isTablet = viewportInfo.width > 768 && viewportInfo.width <= 1024;
  const isHighZoom = viewportInfo.zoom > 1.2;
  const isLowZoom = viewportInfo.zoom < 0.8;
  const isVeryHighZoom = viewportInfo.zoom > 1.5;

  // Calculate responsive modal dimensions with better viewport adaptation
  const safeTerminalHeight = terminalHeight || 0;
  const navbarHeight = 64; // Fixed navbar height
  const padding = isMobile ? 16 : 32;
  const minPadding = 8;
  
  // Available space calculation
  const availableHeight = Math.max(
    viewportInfo.height - safeTerminalHeight - navbarHeight - padding,
    viewportInfo.height * 0.3 // Minimum 30% of viewport height
  );
  const availableWidth = Math.max(
    viewportInfo.width - padding,
    viewportInfo.width * 0.8 // Minimum 80% of viewport width
  );
  
  // Dynamic modal sizing with zoom-aware adjustments
  let maxModalHeight: number;
  let maxModalWidth: number;
  
  if (isVeryHighZoom) {
    // Very high zoom: very conservative sizing
    maxModalHeight = Math.min(availableHeight * 0.7, availableHeight - 60);
    maxModalWidth = Math.min(availableWidth * 0.85, 800);
  } else if (isHighZoom) {
    // High zoom: conservative sizing
    maxModalHeight = Math.min(availableHeight * 0.8, availableHeight - 40);
    maxModalWidth = Math.min(availableWidth * 0.9, 900);
  } else if (isLowZoom) {
    // Low zoom: can be larger
    maxModalHeight = Math.min(availableHeight * 0.95, availableHeight - 20);
    maxModalWidth = Math.min(availableWidth * 0.95, 1200);
  } else {
    // Normal zoom: balanced sizing
    maxModalHeight = Math.min(availableHeight * 0.85, availableHeight - 30);
    maxModalWidth = Math.min(availableWidth * 0.92, isTablet ? 800 : 1024);
  }
  
  // Ensure minimum sizes for usability
  const minModalHeight = isMobile ? 300 : 400;
  const minModalWidth = isMobile ? 280 : 400;
  
  maxModalHeight = Math.max(maxModalHeight, minModalHeight);
  maxModalWidth = Math.max(maxModalWidth, minModalWidth);

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
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-end justify-center"
      style={{ 
        bottom: safeTerminalHeight,
        padding: isMobile ? '12px' : '24px'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="debug-modal-title"
    >
      <Card 
        id="logtrace-modal"
        ref={modalRef}
        data-debug-modal
        className="bg-slate-900/98 border-slate-700/50 w-full max-w-2xl rounded-2xl shadow-2xl backdrop-blur-xl"
        style={{ 
          maxHeight: Math.min(viewportInfo.height * 0.75, 600),
          minHeight: 400,
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        {/* Sleek Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 id="debug-modal-title" className="font-semibold text-white text-lg">
                Debug Assistant
              </h3>
              <p className="text-slate-400 text-sm">AI-powered element analysis</p>
            </div>
          </div>
          <Button 
            data-close-button
            onClick={() => setShowDebugModal(false)}
            variant="ghost" 
            className="w-8 h-8 p-0 rounded-full hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Clean Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Element Context - Compact */}
          {currentElement && (
            <div className="px-6 py-4 border-b border-slate-700/30 bg-slate-800/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-300">Selected Element</span>
                </div>
                <button
                  onClick={() => setIsElementContextExpanded(!isElementContextExpanded)}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-expanded={isElementContextExpanded}
                >
                  {isElementContextExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
              
                             {isElementContextExpanded && (
                 <div className="space-y-3">
                   <div className="flex items-center gap-2">
                     <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                       {currentElement.tag.toUpperCase()}
                     </Badge>
                     {(['button','a','input','select','textarea'].includes(currentElement.tag) || currentElement.element?.onclick != null) && (
                       <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                         Interactive
                       </Badge>
                     )}
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3 text-sm">
                     {currentElement.id && (
                       <div>
                         <span className="text-slate-400 text-xs">ID</span>
                         <div className="text-green-300 font-mono text-xs mt-1">#{sanitizeText(currentElement.id)}</div>
                       </div>
                     )}
                     {currentElement.classes.length > 0 && (
                       <div>
                         <span className="text-slate-400 text-xs">Classes</span>
                         <div className="text-green-300 font-mono text-xs mt-1">.{currentElement.classes.map(c => sanitizeText(c)).join(' .')}</div>
                       </div>
                     )}
                     {currentElement.text && (
                       <div className="col-span-2">
                         <span className="text-slate-400 text-xs">Text</span>
                         <div className="text-slate-300 text-xs mt-1">"{sanitizeText(currentElement.text)}"</div>
                       </div>
                     )}
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* Clean Tabs */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/30 mx-6 mt-4 rounded-xl p-1">
                <TabsTrigger 
                  value="quick" 
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg text-sm font-medium transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Quick</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="advanced" 
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg text-sm font-medium transition-all"
                >
                  Advanced
                </TabsTrigger>
                <TabsTrigger 
                  value="prompt" 
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg text-sm font-medium transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Prompt</span>
                  </div>
                </TabsTrigger>
              </TabsList>

                                            {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="quick" className="px-6 py-4 space-y-4">
                   {/* Quick Debug Intro */}
                   <div className="text-center py-2">
                     <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                       <Zap className="w-6 h-6 text-white" />
                     </div>
                     <h3 className="text-white font-semibold text-lg mb-1">Quick Debug</h3>
                     <p className="text-slate-400 text-sm">Describe what you want to fix or improve</p>
                   </div>

                                     {/* Quick Actions Grid */}
                   <div className="grid grid-cols-2 gap-2">
                     {quickObjectives.slice(0, 8).map((obj) => (
                       <button
                         key={obj.label}
                         className={`p-3 rounded-xl border transition-all duration-200 text-left ${
                           selectedQuickObjective === obj.label 
                             ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300' 
                             : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70'
                         }`}
                         onClick={() => {
                           setSelectedQuickObjective(obj.label);
                           setUserIntent(obj.label);
                           setTimeout(() => inputRef.current?.focus(), 0);
                         }}
                         title={obj.tooltip}
                       >
                         <div className="text-xs font-medium">{obj.label}</div>
                       </button>
                     ))}
                   </div>

                                     {/* Input Section */}
                   <div className="space-y-3">
                     <div className="relative">
                       <Input
                         ref={inputRef}
                         value={userIntent}
                         onChange={(e) => {
                           setUserIntent(e.target.value);
                           setSelectedQuickObjective(null);
                         }}
                         className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 h-12 rounded-xl pr-24"
                         placeholder="Describe what you want to fix or improve..."
                         maxLength={500}
                       />
                       <Button 
                         onClick={() => handleDebugSubmit(userIntent)}
                         disabled={isAnalyzing || !userIntent.trim()}
                         className="absolute right-1 top-1 h-10 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg transition-all"
                       >
                         {isAnalyzing ? (
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : (
                           <>
                             <Zap className="w-4 h-4 mr-2" />
                             Debug
                           </>
                         )}
                       </Button>
                     </div>
                   </div>

                                 </TabsContent>

                 <TabsContent value="advanced" className="px-6 py-4 space-y-4">
                   {/* Advanced Debug Intro */}
                   <div className="text-center py-2">
                     <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                       </svg>
                     </div>
                     <h3 className="text-white font-semibold text-lg mb-1">Advanced Debug</h3>
                     <p className="text-slate-400 text-sm">Deep analysis with detailed context</p>
                   </div>
                   
                   {/* Context Summary */}
                   {currentElement && (
                     <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                       <div className="flex items-center gap-2 mb-3">
                         <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                         <span className="text-sm font-medium text-slate-300">Element Context</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 text-xs">
                         <div><span className="text-slate-400">Tag:</span> <span className="text-purple-300 font-mono">&lt;{currentElement.tag}&gt;</span></div>
                         {currentElement.id && <div><span className="text-slate-400">ID:</span> <span className="text-green-300 font-mono">#{sanitizeText(currentElement.id)}</span></div>}
                         {currentElement.classes.length > 0 && <div className="col-span-2"><span className="text-slate-400">Classes:</span> <span className="text-green-300 font-mono">.{currentElement.classes.map(c => sanitizeText(c)).join(' .')}</span></div>}
                         {(['button','a','input','select','textarea'].includes(currentElement.tag) || currentElement.element?.onclick != null) && <div className="col-span-2"><span className="text-green-400 font-medium">Interactive element</span></div>}
                       </div>
                     </div>
                   )}
                    
                                         {/* Advanced Questions */}
                     <div className="space-y-2">
                       <label className="block text-slate-300 font-medium text-sm">
                         Common Questions
                       </label>
                       <div className="grid grid-cols-1 gap-2">
                         {[
                           'Why might this element not be behaving as expected?',
                           'Are there any CSS properties preventing interaction?',
                           'What accessibility concerns might exist?',
                           'How could the user experience be improved?'
                         ].map((q) => (
                           <button
                             key={q}
                             className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                               selectedAdvancedQuestion === q 
                                 ? 'border-purple-500 bg-purple-500/10 text-purple-300' 
                                 : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70'
                             }`}
                             onClick={() => setSelectedAdvancedQuestion(q)}
                           >
                             <div className="text-xs">{q}</div>
                           </button>
                         ))}
                       </div>
                     </div>
                    
                                         <div className="space-y-3">
                       <Textarea
                         value={advancedPrompt}
                         onChange={(e) => setAdvancedPrompt(e.target.value)}
                         className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 min-h-24 rounded-xl resize-none"
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
                         className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl h-12 transition-all"
                       >
                         {isAnalyzing ? (
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : (
                           <>
                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                             </svg>
                             Advanced Debug
                           </>
                         )}
                       </Button>
                     </div>
                  </div>
                </TabsContent>

                                                                   <TabsContent value="prompt" className="px-6 py-4 space-y-4">
                   {/* Prompt Tab Intro */}
                   <div className="text-center py-2">
                     <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                       <Sparkles className="w-6 h-6 text-white" />
                     </div>
                     <h3 className="text-white font-semibold text-lg mb-1">Context Prompt</h3>
                     <p className="text-slate-400 text-sm">AI-generated prompts with full context</p>
                   </div>
                   
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <label className="text-slate-300 font-medium text-sm">
                         Generated Prompt
                       </label>
                       <Button 
                         onClick={handleCopyPrompt}
                         disabled={!generatedPrompt}
                         variant="outline"
                         className="border-slate-600 text-slate-300 hover:bg-slate-800/50 rounded-lg h-8 px-3"
                         size="sm"
                       >
                         <Copy className="w-3 h-3 mr-1" /> Copy
                       </Button>
                     </div>
                     <ScrollArea className="w-full rounded-xl border border-slate-600 h-48">
                       <Textarea
                         value={generatedPrompt}
                         onChange={(e) => setGeneratedPrompt(e.target.value)}
                         className="bg-slate-800/50 border-none text-slate-300 resize-none min-h-48 rounded-xl"
                         placeholder="Generated prompt will appear here..."
                         readOnly={!generatedPrompt}
                       />
                     </ScrollArea>
                     {generatedPrompt && (
                       <div className="flex gap-3">
                         <Button 
                           onClick={() => handleDebugSubmit(generatedPrompt)}
                           disabled={isAnalyzing}
                           className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl h-12"
                         >
                           {isAnalyzing ? (
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           ) : (
                             <>
                               <Sparkles className="w-4 h-4 mr-2" />
                               Debug with Prompt
                             </>
                           )}
                         </Button>
                         <Button 
                           onClick={handleCopyPrompt}
                           variant="outline"
                           className="border-slate-600 text-slate-300 hover:bg-slate-800/50 rounded-xl h-12 px-4"
                         >
                           <Copy className="w-4 h-4" />
                         </Button>
                       </div>
                     )}
                   </div>
                 </TabsContent>
              </div>
            </Tabs>
                     </div>

           {/* Authentication Prompt - Global Overlay */}
           {showAuthPrompt && (
             <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-10">
               <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50 max-w-md w-full mx-4">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                     <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                     </svg>
                   </div>
                   <div>
                     <h4 className="text-orange-400 font-semibold text-lg">Authentication Required</h4>
                     <p className="text-orange-300/80 text-sm">Sign in to access AI debugging features</p>
                   </div>
                 </div>
                 <div className="flex gap-3">
                   <Button 
                     onClick={() => window.location.href = '/auth'}
                     className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl"
                   >
                     Sign In
                   </Button>
                   <Button 
                     onClick={() => setShowAuthPrompt(false)}
                     variant="outline"
                     className="border-slate-600 text-slate-300 hover:bg-slate-800/50 rounded-xl"
                   >
                     Cancel
                   </Button>
                 </div>
               </div>
             </div>
           )}

           {/* Error Message */}
           {errorMessage && (
             <div className="px-6 py-4">
               <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl p-4 border border-red-500/20">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
                     <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                   <div className="flex-1">
                     <h4 className="text-red-400 font-medium text-sm">Error</h4>
                     <p className="text-red-300/80 text-xs">{errorMessage}</p>
                   </div>
                 </div>
               </div>
             </div>
           )}
        </div>
      </Card>
    </div>
  );
};

export default DebugModal;
