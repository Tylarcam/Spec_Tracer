
import React from 'react';
import { Zap, Eye, Pin, Settings } from 'lucide-react';

interface StyledComponentsProps {
  onInteraction: (section: string) => void;
}

export const StyledComponents: React.FC<StyledComponentsProps> = ({ onInteraction }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div 
        className="bg-gradient-to-br from-pink-400 to-red-500 p-4 rounded-lg text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        onClick={() => onInteraction('gradient')}
        data-component="gradient-box"
      >
        <div className="flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Gradient Box
        </div>
      </div>
      <div 
        className="border-4 border-dashed border-green-400 p-4 rounded-lg text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
        data-component="dashed-border"
      >
        <div className="flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Dashed Border
        </div>
      </div>
      <div 
        className="shadow-lg bg-white p-4 rounded-lg hover:shadow-2xl transition-shadow transform hover:scale-105 cursor-pointer"
        data-component="shadow-element"
      >
        <div className="flex items-center text-gray-700">
          <Pin className="w-5 h-5 mr-2" />
          Shadow Element
        </div>
      </div>
      <div 
        className="bg-yellow-200 p-4 rounded-lg transform rotate-3 hover:rotate-6 transition-transform cursor-pointer border-2 border-yellow-400"
        data-component="rotated-element"
      >
        <div className="flex items-center text-yellow-800">
          <Settings className="w-5 h-5 mr-2" />
          Rotated Element
        </div>
      </div>
    </div>
  );
};
