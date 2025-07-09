
import React from 'react';
import { Card } from '../ui/card';

const InstructionsCard: React.FC = () => {
  return (
    <Card className="bg-slate-800/30 border-green-500/20 mb-6">
      <div className="p-4">
        <h3 className="text-green-400 font-semibold mb-2">Instructions</h3>
        <ul className="text-green-300 text-sm space-y-1">
          <li>• Click "Start Tracing" to begin element inspection</li>
          <li>• Move your mouse over elements to see their information</li>
          <li>• Press <kbd className="bg-slate-700 px-2 py-1 rounded text-xs">Ctrl+D</kbd> to debug the current element with AI</li>
          <li>• Use the terminal to view all logged events</li>
        </ul>
      </div>
    </Card>
  );
};

export default InstructionsCard;
