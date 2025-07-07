
import React from 'react';
import { Card } from '../ui/card';

const InstructionsCard: React.FC = () => {
  return (
    <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
      <div className="p-6">
        <h3 className="text-cyan-400 font-semibold mb-4">How to Use</h3>
        <div className="grid md:grid-cols-2 gap-4 text-green-300">
          <div>
            <h4 className="text-cyan-300 font-medium mb-2">Controls</h4>
            <ul className="space-y-1 text-sm">
              <li>• Toggle activation with the switch above</li>
              <li>• Move mouse to inspect elements</li>
              <li>• Click elements to log interactions</li>
              <li>• Press <kbd className="bg-slate-700 px-1 rounded">Ctrl+D</kbd> to debug</li>
            </ul>
          </div>
          <div>
            <h4 className="text-cyan-300 font-medium mb-2">Features</h4>
            <ul className="space-y-1 text-sm">
              <li>• Real-time element inspection overlay</li>
              <li>• AI-powered debugging assistance</li>
              <li>• Persistent event logging</li>
              <li>• Export debugging sessions</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InstructionsCard;
