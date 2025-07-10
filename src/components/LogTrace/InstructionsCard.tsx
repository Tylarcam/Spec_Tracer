
import React from 'react';
import { Card } from '../ui/card';
import { Eye, Code, MousePointer2, Terminal, Pause, Play, Square, Keyboard } from 'lucide-react';

const InstructionsCard: React.FC = () => {
  return (
    <Card className="bg-slate-800/30 border-green-500/20 mb-6">
      <div className="p-4">
        <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          How to Use LogTrace
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-green-300 text-sm">
          <div className="flex items-start gap-2">
            <MousePointer2 className="w-4 h-4 mt-0.5 text-cyan-400" />
            <div>
              <div className="font-medium">Interactive Modes</div>
              <div className="text-xs text-gray-400">
                Start tracing → Hover elements → Click overlay for details
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Play className="w-4 h-4 mt-0.5 text-green-400" />
            <div>
              <div className="font-medium">Start/Stop</div>
              <div className="text-xs text-gray-400">
                <kbd className="bg-slate-700 px-1 py-0.5 rounded text-xs">S</kbd> start tracing | 
                <kbd className="bg-slate-700 px-1 py-0.5 rounded text-xs ml-1">E</kbd> end tracing
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Terminal className="w-4 h-4 mt-0.5 text-yellow-400" />
            <div>
              <div className="font-medium">Terminal</div>
              <div className="text-xs text-gray-400">
                <kbd className="bg-slate-700 px-1 py-0.5 rounded text-xs">T</kbd> toggle terminal window
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Pause className="w-4 h-4 mt-0.5 text-orange-400" />
            <div>
              <div className="font-medium">Hover Pause</div>
              <div className="text-xs text-gray-400">
                <kbd className="bg-slate-700 px-1 py-0.5 rounded text-xs">D</kbd> pause/resume hover details at current position
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Code className="w-4 h-4 mt-0.5 text-purple-400" />
            <div>
              <div className="font-medium">Debug Options</div>
              <div className="text-xs text-gray-400">
                <kbd className="bg-slate-700 px-1 py-0.5 rounded text-xs">Ctrl+D</kbd> quick debug or use detail panel
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Keyboard className="w-4 h-4 mt-0.5 text-blue-400" />
            <div>
              <div className="font-medium">Debug Assistant</div>
              <div className="text-xs text-gray-400">
                <kbd className="bg-slate-700 px-1 py-0.5 rounded text-xs">Ctrl+Enter</kbd> submit debug prompts in modal
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 mt-0.5 text-green-400 text-xs font-bold">ESC</div>
            <div>
              <div className="font-medium">Quick Exit</div>
              <div className="text-xs text-gray-400">
                Press Escape to close panels, modals, and resume hover
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-slate-700/50">
          <div className="text-xs text-gray-500">
            💡 <strong>Tip:</strong> All keyboard shortcuts are disabled when typing in input fields to prevent conflicts.
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InstructionsCard;
