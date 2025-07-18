import React, { useEffect, useRef, useState } from 'react';
import { Camera, Sparkles, Bug, Eye, Square, Monitor, Maximize2, PenTool, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionModalProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: 'screenshot' | 'context' | 'debug' | 'details' | { type: 'screenshot', mode: ScreenshotMode } | { type: 'context', mode: string, input: string }) => void;
}

type ScreenshotMode = 'rectangle' | 'window' | 'fullscreen' | 'freeform';

const screenshotOptions = [
  { mode: 'rectangle' as ScreenshotMode, label: 'Rect', icon: Square },
  { mode: 'window' as ScreenshotMode, label: 'Win', icon: Monitor },
  { mode: 'fullscreen' as ScreenshotMode, label: 'Full', icon: Maximize2 },
  { mode: 'freeform' as ScreenshotMode, label: 'Free', icon: PenTool },
];

const contextGenOptions = [
  { key: 'edit', label: 'Edit', icon: Sparkles },
  { key: 'fix', label: 'Fix', icon: Bug },
  { key: 'tell', label: 'Tell', icon: Eye },
  { key: 'show', label: 'Show', icon: Monitor },
];

const actions = [
  { key: 'details', label: 'View', icon: Eye },
  { key: 'screenshot', label: 'Shot', icon: Camera },
  { key: 'context', label: 'Gen', icon: Sparkles },
  { key: 'debug', label: 'Fix', icon: Bug },
] as const;

type ActionKey = typeof actions[number]['key'];

const QuickActionModal: React.FC<QuickActionModalProps> = ({ visible, x, y, onClose, onAction }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showScreenshotMenu, setShowScreenshotMenu] = useState(false);
  const [screenshotBtnRect, setScreenshotBtnRect] = useState<DOMRect | null>(null);
  const hideMenuTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedContextGen, setSelectedContextGen] = useState<string | null>(null);
  const [contextGenInput, setContextGenInput] = useState('');
  const contextMenuTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [visible, onClose]);

  // Helper to show/hide screenshot menu with delay
  const openScreenshotMenu = (e: React.MouseEvent) => {
    if (hideMenuTimeout.current) clearTimeout(hideMenuTimeout.current);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setScreenshotBtnRect(rect);
    setShowScreenshotMenu(true);
  };
  const closeScreenshotMenu = () => {
    if (hideMenuTimeout.current) clearTimeout(hideMenuTimeout.current);
    hideMenuTimeout.current = setTimeout(() => setShowScreenshotMenu(false), 400);
  };
  const cancelCloseScreenshotMenu = () => {
    if (hideMenuTimeout.current) clearTimeout(hideMenuTimeout.current);
  };

  const openContextMenu = (e: React.MouseEvent) => {
    if (contextMenuTimeout.current) clearTimeout(contextMenuTimeout.current);
    setShowContextMenu(true);
  };
  const closeContextMenu = () => {
    if (contextMenuTimeout.current) clearTimeout(contextMenuTimeout.current);
    contextMenuTimeout.current = setTimeout(() => setShowContextMenu(false), 400);
  };
  const cancelCloseContextMenu = () => {
    if (contextMenuTimeout.current) clearTimeout(contextMenuTimeout.current);
  };

  if (!visible) return null;

  return (
    <div
      ref={modalRef}
      style={{ position: 'absolute', left: x, top: y - 48, zIndex: 1000 }}
      className="flex items-center bg-slate-900/95 border border-cyan-700 rounded-full shadow-lg px-2 py-1 gap-1 animate-fade-in"
      tabIndex={-1}
      data-quick-actions="true"
    >
      {actions.map(({ key, label, icon: Icon }) => {
        if (key === 'screenshot') {
          return (
            <div key={key} className="relative flex items-center">
              <button
                onClick={openScreenshotMenu}
                onMouseEnter={openScreenshotMenu}
                onMouseLeave={closeScreenshotMenu}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
                style={{ minWidth: 56 }}
                type="button"
              >
                <Icon className="h-4 w-4 text-cyan-300" />
                {label}
              </button>
              {showScreenshotMenu && (
                <div
                  onMouseEnter={cancelCloseScreenshotMenu}
                  onMouseLeave={closeScreenshotMenu}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-slate-900 border border-cyan-700 rounded-xl shadow-lg py-2 px-2 flex flex-col gap-1 min-w-[120px] z-50"
                >
                  {screenshotOptions.map(({ mode, label, icon: OptIcon }) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setShowScreenshotMenu(false);
                        onAction({ type: 'screenshot', mode });
                      }}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-cyan-900 text-cyan-100 text-sm font-medium transition-colors w-full"
                      type="button"
                    >
                      <OptIcon className="h-4 w-4 text-cyan-300" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }
        if (key === 'context') {
          return (
            <div key={key} className="relative flex items-center">
              <button
                onClick={openContextMenu}
                onMouseEnter={openContextMenu}
                onMouseLeave={closeContextMenu}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
                style={{ minWidth: 56 }}
                type="button"
              >
                <Icon className="h-4 w-4 text-cyan-300" />
                {label}
              </button>
              {showContextMenu && (
                <div
                  onMouseEnter={cancelCloseContextMenu}
                  onMouseLeave={closeContextMenu}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-slate-900 border border-cyan-700 rounded-xl shadow-lg py-2 px-2 flex flex-col gap-1 min-w-[120px] z-50"
                >
                  {contextGenOptions.map(({ key: ctxKey, label: ctxLabel, icon: CtxIcon }) => (
                    <button
                      key={ctxKey}
                      onClick={() => {
                        setSelectedContextGen(ctxKey);
                        setShowContextMenu(false);
                      }}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-cyan-900 text-cyan-100 text-sm font-medium transition-colors w-full"
                      type="button"
                    >
                      <CtxIcon className="h-4 w-4 text-cyan-300" />
                      {ctxLabel}
                    </button>
                  ))}
                </div>
              )}
              {selectedContextGen && (
                <div className="flex items-center mt-1 absolute left-1/2 -translate-x-1/2 top-full z-50 bg-slate-900 border border-cyan-700 rounded shadow-lg px-2 py-1">
                  <input
                    className="w-32 px-2 py-1 text-xs rounded border border-cyan-500/30 bg-slate-800 text-cyan-200"
                    placeholder={
                      selectedContextGen === 'edit' ? 'Edit...'
                      : selectedContextGen === 'fix' ? 'Fix...'
                      : selectedContextGen === 'tell' ? 'Tell...'
                      : 'Show...'
                    }
                    value={contextGenInput}
                    onChange={e => setContextGenInput(e.target.value)}
                    maxLength={60}
                    autoFocus
                  />
                  <button
                    className="ml-1 p-1 rounded bg-cyan-700 hover:bg-cyan-800"
                    onClick={() => {
                      onAction({ type: 'context', mode: selectedContextGen, input: contextGenInput });
                      setSelectedContextGen(null);
                      setContextGenInput('');
                    }}
                    disabled={!contextGenInput.trim()}
                  >
                    <ArrowUp className="w-4 h-4 text-white" />
                  </button>
                  <button
                    className="ml-1 p-1 rounded bg-gray-700 hover:bg-gray-800 text-xs text-white"
                    onClick={() => {
                      setSelectedContextGen(null);
                      setContextGenInput('');
                    }}
                    tabIndex={-1}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          );
        }
        return (
          <button
            key={key}
            onClick={() => onAction(key)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900 border border-transparent hover:border-cyan-400 text-cyan-100 font-semibold text-sm transition-colors focus:outline-none"
            style={{ minWidth: 56 }}
            type="button"
          >
            <Icon className="h-4 w-4 text-cyan-300" />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default QuickActionModal; 