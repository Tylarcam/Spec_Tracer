
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
import { Github, Mail, X } from 'lucide-react';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { sanitizeText, validatePrompt } from '@/utils/sanitization';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useConsoleLogs } from '@/shared/hooks/useConsoleLogs';
import { useContextEngine } from '@/shared/hooks/useContextEngine';
import ElementInspector from '@/components/LogTrace/ElementInspector';
import TabbedTerminal from '@/components/LogTrace/TabbedTerminal';
import MoreDetailsModal from '@/components/LogTrace/PinnedDetails';
import { ElementInfo, LogEvent } from '@/shared/types';
import DebugModal from '@/components/LogTrace/DebugModal';

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

  // --- More Details Modal State ---
  const [showMoreDetails, setShowMoreDetails] = React.useState(false);
  const [detailsElement, setDetailsElement] = React.useState<ElementInfo | null>(null);

  // --- Terminal State ---
  const [debugResponses, setDebugResponses] = React.useState<Array<{ id: string; prompt: string; response: string; timestamp: string }>>([]);

  // --- Element Inspector State ---
  const [showElementInspector, setShowElementInspector] = React.useState(false);
  const [inspectorIsPinned, setInspectorIsPinned] = React.useState(false);
  const inspectorRef = React.useRef<HTMLDivElement>(null);

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
    // Redirect to main app for sign-up
    const returnUrl = encodeURIComponent(`${window.location.origin}?auth=extension`);
    const authUrl = `http://localhost:8081/auth?mode=signup&email=${encodeURIComponent(email)}&return=${returnUrl}`;
    window.open(authUrl, '_blank');
    setIsLoading(false);
    setShowAuthModal(false);
    
    // Set up listener for authentication completion
    window.addEventListener('message', handleAuthMessage);
  };

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    // Redirect to main app for sign-in
    const returnUrl = encodeURIComponent(`${window.location.origin}?auth=extension`);
    const authUrl = `http://localhost:8081/auth?mode=signin&email=${encodeURIComponent(email)}&return=${returnUrl}`;
    window.open(authUrl, '_blank');
    setIsLoading(false);
    setShowAuthModal(false);
    
    // Set up listener for authentication completion
    window.addEventListener('message', handleAuthMessage);
  };

  const handleSignInWithGitHub = async () => {
    setIsLoading(true);
    // Redirect to main app for GitHub authentication
    const returnUrl = encodeURIComponent(`${window.location.origin}?auth=extension`);
    const authUrl = `http://localhost:8081/auth?provider=github&return=${returnUrl}`;
    window.open(authUrl, '_blank');
    setIsLoading(false);
    setShowAuthModal(false);
    
    // Set up listener for authentication completion
    window.addEventListener('message', handleAuthMessage);
  };

  // Handle authentication completion from main app
  const handleAuthMessage = React.useCallback((event: MessageEvent) => {
    // Only accept messages from our main app
    if (event.origin !== 'http://localhost:8081') return;
    
    if (event.data.type === 'AUTH_SUCCESS') {
      setUser(event.data.user);
      setShowAuthModal(false);
      setToast({ 
        title: 'Sign In Successful', 
        description: 'You are now signed in to LogTrace!', 
        variant: 'default' 
      });
      
      // Store auth state in extension storage
      storeAuthState(event.data.user, event.data.session);
      
      // Clean up listener
      window.removeEventListener('message', handleAuthMessage);
    } else if (event.data.type === 'AUTH_ERROR') {
      setToast({ 
        title: 'Sign In Error', 
        description: event.data.message || 'Authentication failed', 
        variant: 'destructive' 
      });
      window.removeEventListener('message', handleAuthMessage);
    }
  }, []);

  // Store auth state in local storage for extension persistence
  const storeAuthState = (user: any, session: any) => {
    try {
      localStorage.setItem('logtrace_extension_auth', JSON.stringify({
        user,
        session,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to store auth state:', error);
    }
  };

  // Load auth state on component mount
  React.useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('logtrace_extension_auth');
      if (storedAuth) {
        const { user, session, timestamp } = JSON.parse(storedAuth);
        // Check if auth is not older than 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setUser(user);
        } else {
          // Clear expired auth
          localStorage.removeItem('logtrace_extension_auth');
        }
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
      localStorage.removeItem('logtrace_extension_auth');
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    
    // Clear stored auth state from extension storage
    try {
      localStorage.removeItem('logtrace_extension_auth');
    } catch (error) {
      console.error('Failed to clear auth state:', error);
    }
    
    setToast({ 
      title: 'Signed Out', 
      description: 'You have been successfully signed out.', 
      variant: 'default' 
    });
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

  // --- Element Inspector Handlers ---
  const handleDebugFromInspector = React.useCallback(() => {
    setShowElementInspector(false);
    setShowDebugModal(true);
    
    if (currentElement) {
      addEvent({
        type: 'debug',
        position: mousePosition,
        element: {
          tag: currentElement.tag,
          id: currentElement.id,
          classes: currentElement.classes,
          text: currentElement.text,
        },
      });
    }
  }, [currentElement, mousePosition, addEvent, setShowDebugModal]);

  const handleToggleInspectorPin = React.useCallback(() => {
    setInspectorIsPinned(prev => !prev);
  }, []);

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
    if (target && !target.closest('#logtrace-overlay') && !target.closest('#logtrace-modal') && !target.closest('[data-element-inspector]')) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      const elementInfo = extractElementInfo(target);
      setCurrentElement(elementInfo);
      
      // Auto-close inspector if not pinned and hovering over a different element
      if (showElementInspector && !inspectorIsPinned) {
        setShowElementInspector(false);
      }
      
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
  }, [isActive, extractElementInfo, addEvent, setMousePosition, setCurrentElement, showElementInspector, inspectorIsPinned]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!isActive) return;
    
    const target = e.target as HTMLElement;
    if (target && !target.closest('#logtrace-overlay') && !target.closest('#logtrace-modal') && !target.closest('[data-element-inspector]')) {
      e.preventDefault();
      e.stopPropagation();
      
      setShowElementInspector(true);
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      addEvent({
        type: 'inspect',
        position: { x: e.clientX, y: e.clientY },
        element: currentElement ? {
          tag: currentElement.tag,
          id: currentElement.id,
          classes: currentElement.classes,
          text: currentElement.text,
        } : undefined,
      });
    }
  }, [isActive, currentElement, addEvent, setMousePosition]);

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

    // Escape: Close modals and inspector
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowDebugModal(false);
      setShowElementInspector(false);
      setShowAuthModal(false);
      setShowMoreDetails(false);
      return;
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
      {isActive && currentElement && !showElementInspector && (
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
                Click to inspect • Ctrl+D to debug
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Element Inspector */}
      <div data-element-inspector>
        <ElementInspector
          isVisible={showElementInspector}
          currentElement={currentElement}
          mousePosition={mousePosition}
          onDebug={handleDebugFromInspector}
          onClose={() => setShowElementInspector(false)}
          panelRef={inspectorRef}
          isExtensionMode={true}
          isDraggable={true}
          isPinned={inspectorIsPinned}
          onPin={handleToggleInspectorPin}
          onShowMoreDetails={() => {
            setDetailsElement(currentElement);
            setShowMoreDetails(true);
            setShowElementInspector(false);
          }}
        />
      </div>

      {/* Debug Modal */}
      {showDebugModal && (
        <DebugModal
          showDebugModal={showDebugModal}
          setShowDebugModal={setShowDebugModal}
          currentElement={currentElement}
          mousePosition={mousePosition}
          isAnalyzing={isAnalyzing}
          analyzeWithAI={handleAIDebug}
          generateAdvancedPrompt={generateAdvancedPrompt}
          modalRef={modalRef}
          isExtensionMode={true}
          showAuthModal={showAuthModal}
          setShowAuthModal={setShowAuthModal}
          user={user}
          guestDebugCount={guestDebugCount}
          maxGuestDebugs={3}
        />
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

      {/* More Details Modal */}
      <MoreDetailsModal 
        element={detailsElement}
        open={showMoreDetails}
        onClose={() => setShowMoreDetails(false)}
      />

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
                <X className="h-4 w-4" />
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
