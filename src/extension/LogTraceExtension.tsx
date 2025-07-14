
/**
 * LogTrace component optimized for Chrome extension
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { useLogTrace } from '@/shared/hooks/useLogTrace';
import { sanitizeText, validatePrompt } from '@/utils/sanitization';
import { supabase } from '@/integrations/supabase/client';
import { useConsoleLogs } from '@/shared/hooks/useConsoleLogs';
import { useContextEngine } from '@/shared/hooks/useContextEngine';
import ElementInspector from '@/components/LogTrace/ElementInspector';
import TabbedTerminal from '@/components/LogTrace/TabbedTerminal';
import MoreDetailsModal from '@/components/LogTrace/PinnedDetails';
import { ElementInfo } from '@/shared/types';
import DebugModal from '@/components/LogTrace/DebugModal';
import ExtensionControlPanel from './components/ExtensionControlPanel';
import ExtensionAuthModal from './components/ExtensionAuthModal';
import ExtensionMouseOverlay from './components/ExtensionMouseOverlay';
import ExtensionTerminalWrapper from './components/ExtensionTerminalWrapper';
import { useExtensionAuth } from './hooks/useExtensionAuth';

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

  const {
    user,
    guestDebugCount,
    email,
    password,
    isLoading,
    toast,
    setEmail,
    setPassword,
    setToast,
    handleSignUp,
    handleSignIn,
    handleSignInWithGitHub,
    incrementGuestDebug,
  } = useExtensionAuth();

  // --- Modal State ---
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showMoreDetails, setShowMoreDetails] = React.useState(false);
  const [detailsElement, setDetailsElement] = React.useState<ElementInfo | null>(null);

  // --- Terminal State ---
  const [debugResponses, setDebugResponses] = React.useState<Array<{ id: string; prompt: string; response: string; timestamp: string }>>([]);

  // --- Element Inspector State ---
  const [showElementInspector, setShowElementInspector] = React.useState(false);
  const [inspectorIsPinned, setInspectorIsPinned] = React.useState(false);
  const inspectorRef = React.useRef<HTMLDivElement>(null);

  const currentElementSelector = useMemo(() => {
    if (!currentElement) return undefined;
    let selector = currentElement.tag;
    if (currentElement.id) selector += `#${currentElement.id}`;
    if (currentElement.classes.length > 0) selector += `.${currentElement.classes.join('.')}`;
    return selector;
  }, [currentElement]);

  const { logs } = useConsoleLogs(currentElementSelector);

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

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.associatedElement === currentElementSelector || 
      (log.message.includes(currentElement?.tag || '') && log.message.includes(currentElement?.id || ''))
    );
  }, [logs, currentElementSelector, currentElement]);

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
    userIntent: '',
  });

  const addDebugResponse = (prompt: string, response: string) => {
    setDebugResponses(prev => [
      { id: crypto.randomUUID(), prompt, response, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  };
  const clearDebugResponses = () => setDebugResponses([]);

  const handleAIDebug = async (prompt: string) => {
    if (!validatePrompt(prompt)) {
      setToast({ title: 'Invalid Prompt', description: 'Invalid prompt format.', variant: 'destructive' });
      return;
    }

    // Change guest debug gating logic
    if (!user && guestDebugCount >= 5) {
      setShowAuthModal(true);
      return;
    }
    if (!user) incrementGuestDebug();

    try {
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

  // Event handlers
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive) return;
    
    const target = e.target as HTMLElement;
    if (target && !target.closest('#logtrace-overlay') && !target.closest('#logtrace-modal') && !target.closest('[data-element-inspector]')) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      const elementInfo = extractElementInfo(target);
      setCurrentElement(elementInfo);
      
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

    if (e.key === 'Escape') {
      e.preventDefault();
      setShowDebugModal(false);
      setShowElementInspector(false);
      setShowAuthModal(false);
      setShowMoreDetails(false);
      return;
    }
  }, [isActive, mousePosition, currentElement, addEvent, setShowDebugModal]);

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

  return (
    <div className="fixed inset-0 pointer-events-none z-[2147483647] font-mono">
      <ExtensionControlPanel
        isActive={isActive}
        onActiveChange={setIsActive}
        showTerminal={showTerminal}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
      />

      <ExtensionMouseOverlay
        isActive={isActive}
        currentElement={currentElement}
        mousePosition={mousePosition}
        showElementInspector={showElementInspector}
        overlayRef={overlayRef}
      />

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
          currentDebugCount={guestDebugCount}
          maxDebugCount={5}
        />
        </div>

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
          maxGuestDebugs={5}
        />
      )}

      <ExtensionAuthModal
        showAuthModal={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        user={user}
        isLoading={isLoading}
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onSignInWithGitHub={handleSignInWithGitHub}
        toast={toast}
      />

      <MoreDetailsModal 
        element={detailsElement}
        open={showMoreDetails}
        onClose={() => setShowMoreDetails(false)}
      />

      <TabbedTerminal 
        isVisible={showTerminal}
        onToggle={() => setShowTerminal(!showTerminal)}
        onClear={clearEvents}
        showTerminal={showTerminal}
        setShowTerminal={setShowTerminal}
        events={events}
        exportEvents={exportEvents}
        clearEvents={clearEvents}
        debugResponses={debugResponses}
        clearDebugResponses={clearDebugResponses}
      />

      <ExtensionTerminalWrapper
        showTerminal={showTerminal}
        onToggleTerminal={() => setShowTerminal(false)}
        events={events}
        onExportEvents={exportEvents}
        onClearEvents={clearEvents}
      />
    </div>
  );
};

export default LogTraceExtension;
