
import React from 'react';
import { ElementInfo } from '@/shared/types';

interface InteractivePanelProps {
  detectedElement: ElementInfo | null;
  cursorPosition: { x: number; y: number };
  onClose: () => void;
  onAnalyzeWithAI: () => void;
  isAIAnalyzing: boolean;
  generateElementPrompt: () => string;
}

const InteractivePanel: React.FC<InteractivePanelProps> = ({
  detectedElement,
  cursorPosition,
  onClose,
  onAnalyzeWithAI,
  isAIAnalyzing,
  generateElementPrompt,
}) => {
  if (!detectedElement) return null;

  return (
    <div className="fixed z-50 bg-gray-800 rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-semibold">Element Inspector</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="text-white text-sm">
        <p>Tag: {detectedElement.tag}</p>
        {detectedElement.id && <p>ID: {detectedElement.id}</p>}
        {detectedElement.classes.length > 0 && (
          <p>Classes: {detectedElement.classes.join(', ')}</p>
        )}
        {detectedElement.text && <p>Text: {detectedElement.text}</p>}
      </div>
      <button
        onClick={onAnalyzeWithAI}
        disabled={isAIAnalyzing}
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
      >
        {isAIAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
      </button>
    </div>
  );
};

export default InteractivePanel;
