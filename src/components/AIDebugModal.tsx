
import React from 'react';
import { ElementInfo } from '@/shared/types';
import { X } from 'lucide-react';

interface AIDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: ElementInfo | null;
  position: { x: number; y: number };
  analyzeElementWithAI: (prompt: string) => Promise<any>;
  isAIAnalyzing: boolean;
  generateElementPrompt: () => string;
}

const AIDebugModal: React.FC<AIDebugModalProps> = ({
  isOpen,
  onClose,
  element,
  position,
  analyzeElementWithAI,
  isAIAnalyzing,
  generateElementPrompt,
}) => {
  if (!isOpen || !element) return null;

  const handleAnalyzeClick = () => {
    const prompt = generateElementPrompt();
    analyzeElementWithAI(prompt);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold text-lg">AI Debug</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <div className="text-white space-y-3">
          <div>
            <strong>Element:</strong> {element.tag}
            {element.id && ` #${element.id}`}
          </div>
          <div>
            <strong>Position:</strong> ({position.x}, {position.y})
          </div>
          <div>
            <strong>Generated Prompt:</strong>
            <div className="bg-gray-700 p-2 rounded mt-1 text-sm">
              {generateElementPrompt()}
            </div>
          </div>
          <button
            onClick={handleAnalyzeClick}
            disabled={isAIAnalyzing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded"
          >
            {isAIAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIDebugModal;
