
import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Zap, MousePointer, Keyboard, Eye, Code, Terminal } from 'lucide-react';

const InstructionsCard: React.FC = () => {
  return (
    <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-cyan-400">How to Use LogTrace</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Getting Started */}
          <div>
            <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              Getting Started
            </h3>
            <div className="space-y-2 text-sm text-green-300">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">S</Badge>
                <span>Start tracing mode</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">E</Badge>
                <span>End tracing mode</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">Click</Badge>
                <span>Inspect element details</span>
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <div>
            <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Advanced Features
            </h3>
            <div className="space-y-2 text-sm text-green-300">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">D</Badge>
                <span>Pause/resume hover details</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">Ctrl+D</Badge>
                <span>Quick debug with AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">T</Badge>
                <span>Toggle terminal view</span>
              </div>
            </div>
          </div>

          {/* Workflow Tips */}
          <div>
            <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Workflow Tips
            </h3>
            <div className="space-y-2 text-sm text-green-300">
              <div>• Hover over elements to see live details</div>
              <div>• Use 'D' key to freeze hover details at cursor position</div>
              <div>• Click elements to pin details for comparison</div>
              <div>• Drag pinned details to organize your workspace</div>
            </div>
          </div>

          {/* AI Debugging */}
          <div>
            <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
              <Code className="w-4 h-4" />
              AI Debugging
            </h3>
            <div className="space-y-2 text-sm text-green-300">
              <div>• Use Ctrl+D for instant AI analysis</div>
              <div>• Get CSS, accessibility, and UX insights</div>
              <div>• Export event logs for detailed debugging</div>
              <div>• View all responses in the terminal</div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-slate-900/50 rounded-lg border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-semibold text-sm">Pro Tip</span>
          </div>
          <p className="text-green-300 text-xs">
            Press 'D' to pause hover details, then move your cursor freely while keeping the element information visible. 
            Perfect for precise debugging or when you need to reference multiple elements simultaneously.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default InstructionsCard;
