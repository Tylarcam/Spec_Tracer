
import React from 'react';
import { LogEvent, DebugContext } from '@/shared/types';
import { X } from 'lucide-react';

interface TerminalPanelProps {
  events: LogEvent[];
  onClose: () => void;
  onClear: () => void;
  onExport: () => void;
  debugContext: DebugContext;
}

const TerminalPanel: React.FC<TerminalPanelProps> = ({
  events,
  onClose,
  onClear,
  onExport,
  debugContext,
}) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-gray-900 rounded-lg p-4 shadow-xl max-h-96 overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-semibold">Terminal</h3>
        <div className="flex gap-2">
          <button 
            onClick={onClear}
            className="text-gray-400 hover:text-white text-sm"
          >
            Clear
          </button>
          <button 
            onClick={onExport}
            className="text-gray-400 hover:text-white text-sm"
          >
            Export
          </button>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="bg-black rounded p-2 max-h-64 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="text-green-400 text-xs font-mono mb-1">
            [{event.timestamp}] {event.type}: {event.element?.tag || 'N/A'}
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-gray-500 text-xs">No events captured</div>
        )}
      </div>
    </div>
  );
};

export default TerminalPanel;
