
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, MousePointer, Brain } from 'lucide-react';

export const QuickStartCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-cyan-400">Quick Start</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">S</Badge>
            <span className="text-slate-300">Start LogTrace capture</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">D</Badge>
            <span className="text-slate-300">Freeze hover details</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">Ctrl+D</Badge>
            <span className="text-slate-300">AI debug analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-xs">T</Badge>
            <span className="text-slate-300">Toggle terminal</span>
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MousePointer className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold text-green-400">Workflow Tips</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="text-slate-300">
            • Press 'S' to start capture mode
          </div>
          <div className="text-slate-300">
            • Press 'D' to freeze details
          </div>
          <div className="text-slate-300">
            • Click elements to inspect
          </div>
          <div className="text-slate-300">
            • Right-click for quick actions
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-purple-400">AI Debugging</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="text-slate-300">
            • Press Ctrl+D for instant analysis
          </div>
          <div className="text-slate-300">
            • Get CSS & accessibility insights
          </div>
          <div className="text-slate-300">
            • Export detailed event logs
          </div>
          <div className="text-slate-300">
            • Real-time element inspection
          </div>
        </div>
      </Card>
    </div>
  );
};
