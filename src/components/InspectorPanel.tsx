
import React from 'react';
import { ElementInfo } from '@/shared/types';
import { X } from 'lucide-react';

interface InspectorPanelProps {
  element: ElementInfo | null;
  onClose: () => void;
}

const InspectorPanel: React.FC<InspectorPanelProps> = ({ element, onClose }) => {
  if (!element) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-gray-800 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-semibold">Inspector</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
      <div className="text-white text-sm space-y-2">
        <div><strong>Tag:</strong> {element.tag}</div>
        {element.id && <div><strong>ID:</strong> {element.id}</div>}
        {element.classes.length > 0 && (
          <div><strong>Classes:</strong> {element.classes.join(', ')}</div>
        )}
        {element.text && <div><strong>Text:</strong> {element.text}</div>}
        {element.size && (
          <div><strong>Size:</strong> {element.size.width}x{element.size.height}</div>
        )}
      </div>
    </div>
  );
};

export default InspectorPanel;
