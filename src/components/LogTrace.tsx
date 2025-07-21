import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Settings, Terminal, ArrowUp, Lightbulb, MousePointer } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation, useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';

import ElementDetails from './LogTrace/ElementDetails';
import TerminalPanel from './LogTrace/TerminalPanel';
import SettingsDrawer from './LogTrace/SettingsDrawer';
import MobileQuickActionsMenu from './LogTrace/MobileQuickActionsMenu';

import { useElementPosition } from '@/hooks/useElementPosition';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { callAIDebugFunction } from '@/shared/api';
import { ElementInfo } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

const LogTrace: React.FC = () => {
  const [isTracing, setIsTracing] = useState(false);
  const [isHoverEnabled, setIsHoverEnabled] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiDebugResponse, setAiDebugResponse] = useState<string | null>(null);
  const [aiDebugLoading, setAiDebugLoading] = useState(false);
  const [aiDebugError, setAiDebugError] = useState<string | null>(null);
  const [aiDebugPrompt, setAiDebugPrompt] = useState('');
  const [showElementDetails, setShowElementDetails] = useState(false);
  const [currentElement, setCurrentElement] = useState<ElementInfo | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { elementInfo, setElement } = useElementPosition();
  const { canUseAiDebug, incrementAiDebugUsage } = useUsageTracking();
  const terminalRef = useRef<HTMLDivElement>(null);

  const startTracing = () => {
    setIsTracing(true);
    setTerminalOutput(prev => [...prev, `[LogTrace]: Tracing started at ${new Date().toLocaleTimeString()}`]);
  };

  const endTracing = () => {
    setIsTracing(false);
    setIsHoverEnabled(true);
    setCurrentElement(null);
    setShowElementDetails(false);
    setTerminalOutput(prev => [...prev, `[LogTrace]: Tracing ended at ${new Date().toLocaleTimeString()}`]);
  };

  const toggleHover = () => {
    setIsHoverEnabled(!isHoverEnabled);
    setTerminalOutput(prev => [...prev, `[LogTrace]: Hover tracking ${isHoverEnabled ? 'disabled' : 'enabled'} at ${new Date().toLocaleTimeString()}`]);
  };

  const toggleTerminal = () => {
    setIsTerminalOpen(!isTerminalOpen);
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleElementClick = (element: ElementInfo) => {
    if (!isTracing) return;
    setCurrentElement(element);
    setShowElementDetails(true);
    setElement(element);
    setTerminalOutput(prev => [...prev, `[LogTrace]: Element "${element.tag}" selected at ${new Date().toLocaleTimeString()}`]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleAIDebug = async () => {
    if (!canUseAiDebug()) {
      navigate('/upgrade');
      return;
    }

    if (!aiDebugPrompt.trim()) {
      setAiDebugError('Please enter a prompt.');
      return;
    }

    setAiDebugLoading(true);
    setAiDebugError(null);
    setAiDebugResponse(null);

    try {
      const response = await callAIDebugFunction(aiDebugPrompt, currentElement, mousePosition);
      setAiDebugResponse(response);
      incrementAiDebugUsage();
      setTerminalOutput(prev => [...prev, `[AI Debug]: Debugging initiated at ${new Date().toLocaleTimeString()}`]);
    } catch (error: any) {
      setAiDebugError(error.message || 'Failed to get AI response');
    } finally {
      setAiDebugLoading(false);
    }
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleUpgradeClick = () => {
    navigate('/upgrade');
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = () => {
    setIsDragging(false);
  };

  useHotkeys('ctrl+s', () => isTracing ? endTracing() : startTracing(), { preventDefault: true });
  useHotkeys('ctrl+e', () => endTracing(), { preventDefault: true });
  useHotkeys('ctrl+t', () => toggleTerminal(), { preventDefault: true });
  useHotkeys('ctrl+d', () => handleAIDebug(), { preventDefault: true });
  useHotkeys('ctrl+p', () => toggleHover(), { preventDefault: true });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowElementDetails(false);
        setCurrentElement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleHover = (e: MouseEvent) => {
      if (!isTracing || !isHoverEnabled || isDragging) return;

      const target = e.target as HTMLElement;

      if (target) {
        const elementInfo: ElementInfo = {
          tag: target.tagName.toLowerCase(),
          id: target.id,
          classes: Array.from(target.classList),
          text: target.textContent?.trim() || '',
        };
        setElement(elementInfo);
        setCurrentElement(elementInfo);
      }
    };

    document.addEventListener('mousemove', handleHover);

    return () => {
      document.removeEventListener('mousemove', handleHover);
    };
  }, [isTracing, isHoverEnabled, setElement, isDragging]);

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white relative overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 border-b border-green-500/30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-green-400">LogTrace</h1>
          {isTracing && <span className="text-sm text-yellow-300 animate-pulse">Tracing...</span>}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            onClick={isTracing ? endTracing : startTracing}
            variant={isTracing ? "destructive" : "default"}
            size="sm"
          >
            {isTracing ? <X className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isTracing ? 'End Trace' : 'Start Trace'}
          </Button>
          <Button
            onClick={toggleHover}
            variant={isHoverEnabled ? "secondary" : "outline"}
            size="sm"
          >
            {isHoverEnabled ? <Pause className="h-4 w-4 mr-2" /> : <MousePointer className="h-4 w-4 mr-2" />}
            {isHoverEnabled ? 'Disable Hover' : 'Enable Hover'}
          </Button>
          <Button onClick={handleSettingsClick} variant="ghost" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Mobile Actions */}
        <div className="lg:hidden">
          <Button onClick={openMobileMenu} variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-auto" onMouseMove={handleMouseMove}>
        {/* Element Details */}
        {showElementDetails && currentElement && (
          <Draggable
            handle=".drag-handle"
            defaultPosition={{ x: 20, y: 20 }}
            position={null}
            onStart={handleDragStart}
            onStop={handleDragStop}
          >
            <div className="absolute top-0 left-0 z-50 bg-slate-800 border border-green-500/30 rounded-md shadow-lg w-full max-w-md">
              <div className="bg-slate-700 p-3 flex items-center justify-between drag-handle cursor-move">
                <h3 className="text-sm font-semibold text-green-400">Element Details</h3>
                <div className="flex items-center gap-2">
                  <Button onClick={handleAIDebug} variant="ghost" size="xs">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    AI Debug
                  </Button>
                  <Button onClick={() => { setShowElementDetails(false); setCurrentElement(null); }} variant="ghost" size="xs">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <ElementDetails element={currentElement} />
                <div className="mt-4 space-y-2">
                  <Label htmlFor="ai-debug-prompt" className="text-sm">AI Debug Prompt</Label>
                  <Textarea
                    id="ai-debug-prompt"
                    placeholder="Describe the issue or desired behavior..."
                    className="bg-slate-700 border-slate-600 text-white text-sm"
                    value={aiDebugPrompt}
                    onChange={(e) => setAiDebugPrompt(e.target.value)}
                  />
                  {aiDebugError && <p className="text-red-400 text-sm">{aiDebugError}</p>}
                  {aiDebugLoading ? (
                    <Skeleton className="w-full h-10 rounded-md" />
                  ) : (
                    <Button onClick={handleAIDebug} className="w-full">
                      Debug with AI
                    </Button>
                  )}
                  {aiDebugResponse && (
                    <div className="mt-3 p-3 bg-slate-700 rounded-md">
                      <p className="text-sm">{aiDebugResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Draggable>
        )}

        {/* Terminal Panel */}
        {isTerminalOpen && (
          <div className="lg:w-1/3 bg-slate-800 border-l border-green-500/30 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-cyan-400">Terminal</h3>
              <Button onClick={toggleTerminal} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div ref={terminalRef} className="flex-1 overflow-y-auto text-xs text-gray-400 space-y-1">
              {terminalOutput.map((output, index) => (
                <p key={index}>{output}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpgradeClick={handleUpgradeClick}
      />

      <MobileQuickActionsMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        onStartTrace={startTracing}
        onEndTrace={endTracing}
        onToggleHover={toggleHover}
        onUpgrade={handleUpgradeClick}
        onSettings={handleSettingsClick}
        isTracing={isTracing}
        isHoverEnabled={isHoverEnabled}
      />
    </div>
  );
};

export default LogTrace;
