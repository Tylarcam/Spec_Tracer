
import React from 'react';
import { MousePointer2, RotateCcw, Eye, Bug, Camera, Terminal } from 'lucide-react';

const InstructionsCard: React.FC = () => {
  return (
    <div className="bg-slate-800/40 rounded-xl border border-cyan-500/20 p-6 mb-6 max-w-4xl">
      <h2 className="text-cyan-400 font-bold text-xl mb-4 flex items-center gap-2">
        <MousePointer2 className="h-5 w-5" />
        How to Use LogTrace
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-green-400 font-semibold mb-3">🎯 Getting Started</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">1.</span>
              <span className="text-gray-300">
                <strong className="text-white">Right-click anywhere</strong> to open the LogTrace context menu
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">2.</span>
              <span className="text-gray-300">
                Select <strong className="text-white">"Start LogTrace"</strong> to begin element inspection
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">3.</span>
              <span className="text-gray-300">
                <strong className="text-white">Hover over elements</strong> to see live inspection data
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-green-400 font-semibold mb-3">⚡ Context Menu Actions</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-300"><strong>View Details</strong> - Element information</span>
            </div>
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-300"><strong>AI Debug</strong> - Get intelligent insights</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-300"><strong>Screenshots</strong> - Capture areas or full page</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-300"><strong>Terminal</strong> - View debug history</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
        <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          No More Keyboard Conflicts!
        </h4>
        <p className="text-green-200 text-sm">
          LogTrace now uses a comprehensive right-click context menu system. 
          You can type freely without any keyboard shortcuts interfering with your work.
          All actions are discoverable and context-aware through the right-click menu.
        </p>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>Pro tip:</strong> The context menu shows different options based on your current state and whether you're hovering over an element.
          Only <kbd className="px-1 py-0.5 bg-slate-700 rounded">Esc</kbd> is preserved for closing modals.
        </p>
      </div>
    </div>
  );
};

export default InstructionsCard;
