
/**
 * LogTrace component optimized for Chrome extension
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Github, Mail } from 'lucide-react';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { sanitizeText, validatePrompt } from '@/utils/sanitization';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useConsoleLogs } from '@/shared/hooks/useConsoleLogs';
import { useContextEngine } from '@/shared/hooks/useContextEngine';
import TabbedTerminal from '@/components/LogTrace/TabbedTerminal';
import PinnedDetails from '@/components/LogTrace/PinnedDetails';
import { PinnedDetail, ElementInfo, LogEvent } from '@/shared/types';

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

  const [userIntent, setUserIntent] = React.useState('');
  const [advancedPrompt, setAdvancedPrompt] = React.useState('');
  const [generatedPrompt, setGeneratedPrompt] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('quick');

  // --- Auth Modal State ---
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [guestDebugCount, setGuestDebugCount] = React.useState<number>(0);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // --- Pinning State ---
  const [pinnedDetails, setPinnedDetails] = React.useState<PinnedDetail[]>([]);

  // --- Terminal State ---
  const [debugResponses, setDebugResponses] = React.useState<Array<{ id: string; prompt: string; response: string; timestamp: string }>>([]);

  // --- Toast State ---
  const [toast, setToast] = React.useState<{ title: string; description?: string; variant?: 'destructive' | undefined } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

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

  // --- Auth Logic ---
  React.useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    setIsLoading(false);
    if (error) {
      setToast({ title: 'Sign Up Error', description: error.message, variant: 'destructive' });
    } else {
      setToast({ title: 'Check your email', description: 'We sent you a confirmation link to complete your registration.' });
      setShowAuthModal(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) {
      setToast({ title: 'Sign In Error', description: error.message, variant: 'destructive' });
    } else {
      setShowAuthModal(false);
    }
  };

  const handleSignInWithGitHub = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}/` } });
    setIsLoading(false);
    if (error) {
      setToast({ title: 'GitHub Sign In Error', description: error.message, variant: 'destructive' });
    } else {
      setShowAuthModal(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // --- Guest Usage Tracking ---
  React.useEffect(() => {
    const count = parseInt(localStorage.getItem('logtrace_guest_debug_count') || '0', 10);
    setGuestDebugCount(count);
  }, []);

  const incrementGuestDebug = () => {
    const newCount = guestDebugCount + 1;
    setGuestDebugCount(newCount);
    localStorage.setItem('logtrace_guest_debug_count', newCount.toString());
  };

  // --- Pinning Logic ---
  const addPin = (element: ElementInfo, position: { x: number; y: number }) => {
    const pin: PinnedDetail = {
      id: crypto.randomUUID(),
      element,
      position,
      pinnedAt: {
        x: Math.max(0, Math.min(window.innerWidth - 320, position.x)),
        y: Math.max(0, Math.min(window.innerHeight - 200, position.y)),
      },
    };
    setPinnedDetails(prev => [...prev, pin]);
  };
  const removePin = (id: string) => setPinnedDetails(prev => prev.filter(pin => pin.id !== id));
  const updatePinPosition = (id: string, position: { x: number; y: number }) => {
    setPinnedDetails(prev => prev.map(pin => pin.id === id ? { ...pin, pinnedAt: position } : pin));
  };

  // --- Debug Response Logging ---
  const addDebugResponse = (prompt: string, response: string) => {
    setDebugResponses(prev => [
      { id: crypto.randomUUID(), prompt, response, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  };
  const clearDebugResponses = () => setDebugResponses([]);

  // --- AI Debug Handler (with guest gating) ---
  const handleAIDebug = async (prompt: string) => {
    if (!validatePrompt(prompt)) {
      setToast({ title: 'Invalid Prompt', description: 'Invalid prompt format.', variant: 'destructive' });
      return;
    }

    if (!user && guestDebugCount >= 3) {
      setShowAuthModal(true);
      return;
    }
    if (!user) incrementGuestDebug();

    try {
      // Call Supabase edge function for AI debug
      const { data, error } = await supabase.functions.invoke('ai-debug', {
        body: {
          prompt: sanitizeText(prompt, 2000),
          element: currentElement ? {
            tag: sanitizeText(currentElement.tag),
            id: sanitizeText(currentElement.id),
            classes: currentElement.classes.map(c => sanitizeText(c)),
            text: sanitizeText(currentElement.text),
          } : null,
          position: mousePosition,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        setToast({ title: 'Debug Failed', description: 'Failed to get AI response', variant: 'destructive' });
        return;
      }

      if (!data?.success) {
        setToast({ title: 'AI Error', description: data?.error || 'AI service error', variant: 'destructive' });
        return;
      }

      addDebugResponse(prompt, data.response);
      setToast({ title: 'Debug Complete', description: 'AI analysis complete!' });
    } catch (error: any) {
      console.error('AI Debug API Error:', error);
      if (error instanceof Error && error.message.includes('Authentication required')) {
        setShowAuthModal(true);
        return;
      }
      setToast({ title: 'Service Unavailable', description: 'AI debugging service is currently unavailable.', variant: 'destructive' });
    }
  };

  // --- Prompt Generation ---
  const handleGeneratePrompt = () => {
    const prompt = contextEngine.generatePrompt();
    setGeneratedPrompt(prompt);
    setActiveTab('prompt');
  };

  const handleCopyPrompt = async () => {
    if (!generatedPrompt) {
      setToast({ title: 'No Prompt', description: 'Please generate a prompt first.', variant: 'destructive' });
      return;
    }
    
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setToast({ title: 'Prompt Copied', description: 'Generated prompt copied to clipboard.' });
    } catch (error) {
      setToast({ title: 'Copy Failed', description: 'Failed to copy prompt.', variant: 'destructive' });
    }
  };

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
    const activeElement = document.activeElement as HTMLElement | null;
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable)
    ) {
      return;
    }

    // Ctrl+D: Open debug modal
    if (isActive && e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      setShowDebugModal(true);
      addEvent({
        type: 'debug',
        position: mousePosition,
        element: currentElement
          ? {
              tag: currentElement.tag,
              id: currentElement.id,
              classes: currentElement.classes,
              text: currentElement.text,
            }
          : undefined,
      });
      return;
    }

    // D: Pin/unpin selected element
    if (isActive && e.key === 'd' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      if (currentElement) {
        // Check if already pinned
        const alreadyPinned = pinnedDetails.some(
          (pin) =>
            pin.element.tag === currentElement.tag &&
            pin.element.id === currentElement.id &&
            pin.element.classes.join(' ') === currentElement.classes.join(' ') &&
            pin.element.text === currentElement.text
        );
        if (alreadyPinned) {
          // Unpin
          const pinToRemove = pinnedDetails.find(
            (pin) =>
              pin.element.tag === currentElement.tag &&
              pin.element.id === currentElement.id &&
              pin.element.classes.join(' ') === currentElement.classes.join(' ') &&
              pin.element.text === currentElement.text
          );
          if (pinToRemove) removePin(pinToRemove.id);
        } else {
          // Pin at current mouse position
          addPin(currentElement, mousePosition);
        }
      }
      return;
    }
  }, [isActive, mousePosition, currentElement, addEvent, setShowDebugModal, pinnedDetails]);

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

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
                  <TabsTrigger value="quick" className="data-[state=active]:bg-cyan-600">Quick Debug</TabsTrigger>
                  <TabsTrigger value="advanced" className="data-[state=active]:bg-cyan-600">Advanced</TabsTrigger>
                  <TabsTrigger value="prompt" className="data-[state=active]:bg-cyan-600">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">✨</span>
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
                        onClick={async () => {
                          try {
                            await handleAIDebug(userIntent);
                          } catch (error) {
                            setToast({ title: 'Debug Failed', description: 'AI debugging is not available in extension mode', variant: 'destructive' });
                          }
                        }}
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
                      <span className="text-yellow-200 mr-2">✨</span>
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
                      onClick={async () => {
                        try {
                          await handleAIDebug(advancedPrompt || generateAdvancedPrompt());
                        } catch (error) {
                          setToast({ title: 'Debug Failed', description: 'AI debugging is not available in extension mode', variant: 'destructive' });
                        }
                      }}
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
                        📋 Copy Prompt
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
                          onClick={async () => {
                            try {
                              await handleAIDebug(generatedPrompt);
                            } catch (error) {
                              setToast({ title: 'Debug Failed', description: 'AI debugging is not available in extension mode', variant: 'destructive' });
                            }
                          }}
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
                          📋 Copy to Clipboard
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 z-[2147483650] flex items-center justify-center">
          <Card className="w-full max-w-md p-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-400">Welcome to LogTrace</CardTitle>
              <CardDescription className="text-slate-300">
                Sign in to access advanced debugging features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await handleSignIn(email, password);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await handleSignUp(email, password);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignInWithGitHub}
                  className="w-full mt-4 bg-slate-700 border-slate-600 hover:bg-slate-600"
                  disabled={isLoading}
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
              {toast && (
                <div className={`mt-6 p-3 rounded text-center ${toast.variant === 'destructive' ? 'bg-red-800/60 text-red-200' : 'bg-green-800/60 text-green-200'}`}>{toast.title}{toast.description && <><br />{toast.description}</>}</div>
              )}
              <Button onClick={() => setShowAuthModal(false)} className="mt-6 w-full" variant="ghost">Close</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pinned Details */}
      <PinnedDetails pinnedDetails={pinnedDetails} onRemovePin={removePin} onUpdatePosition={updatePinPosition} />

      {/* Terminal Modal */}
      <TabbedTerminal showTerminal={showTerminal} setShowTerminal={setShowTerminal} events={events} exportEvents={exportEvents} clearEvents={clearEvents} debugResponses={debugResponses} clearDebugResponses={clearDebugResponses} />

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
