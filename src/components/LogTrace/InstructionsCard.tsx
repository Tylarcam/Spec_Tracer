import React from 'react';
import { MousePointer2, RotateCcw, Eye, Bug, Camera, Terminal } from 'lucide-react';

const InstructionsCard: React.FC = () => {
  return (
    <div className="bg-slate-800/40 rounded-xl border border-cyan-500/20 p-6 mb-6 max-w-4xl">
      <h2 className="text-cyan-400 font-bold text-xl mb-4 flex items-center gap-2">
        <MousePointer2 className="h-5 w-5" />
        How to Use SpecTrace
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-green-400 font-semibold mb-3">🎯 Getting Started</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">1.</span>
              <span className="text-gray-300">
                <strong className="text-white">Toggle "Capture" ON</strong> in the top navigation bar to activate SpecTrace
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">2.</span>
              <span className="text-gray-300">
                <strong className="text-white">Hover over elements</strong> to see live inspection with green highlights
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">3.</span>
              <span className="text-gray-300">
                <strong className="text-white">Click on any element</strong> to open a sticky inspector panel
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono">4.</span>
              <span className="text-gray-300">
                <strong className="text-white">Press Escape or click X</strong> to close inspector panels
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-green-400 font-semibold mb-3">⚡ Inspector Panel Actions</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-300"><strong>View Details</strong> - Complete element information</span>
            </div>
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-300"><strong>AI Debug</strong> - Get intelligent analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-300"><strong>Screenshots</strong> - Right-click for screenshot options</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-300"><strong>Terminal</strong> - View debug history and logs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
        <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Streamlined Workflow
        </h4>
        <p className="text-green-200 text-sm">
          SpecTrace now uses a simple toggle-to-start approach. Activate capture, inspect elements, 
          and use sticky panels that stay open until you explicitly close them. Perfect for detailed debugging sessions.
        </p>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>Desktop:</strong> Up to 3 inspector panels can be open simultaneously for multi-element comparison.
        </p>
        <p className="mt-2">
          <strong>Mobile:</strong> Touch and hold elements for inspection. Single panel optimized for mobile screens.
        </p>
        <p className="mt-2">
          <strong>Keyboard Shortcuts:</strong> Use <kbd className="px-1 py-0.5 bg-slate-700 rounded">Esc</kbd> to close panels.
        </p>
        <p className="mt-2">
          <strong>Quick Actions:</strong> When trace is activated, right-click any element to open the quick actions menu.
        </p>
      </div>
    </div>
  );
};

export default InstructionsCard; 