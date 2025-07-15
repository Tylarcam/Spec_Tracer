
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Eye, Settings, Zap } from 'lucide-react';

interface InteractiveButtonsProps {
  onInteraction: (section: string) => void;
}

export const InteractiveButtons: React.FC<InteractiveButtonsProps> = ({ onInteraction }) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <Button 
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          onClick={() => onInteraction('buttons')}
        >
          <Play className="w-4 h-4 mr-2" />
          Primary Action
        </Button>
        <Button 
          variant="outline" 
          className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
          onClick={() => onInteraction('outline')}
        >
          <Eye className="w-4 h-4 mr-2" />
          Secondary
        </Button>
        <Button 
          variant="ghost" 
          className="text-purple-500 hover:bg-purple-100 hover:text-purple-700"
        >
          <Settings className="w-4 h-4 mr-2" />
          Ghost Button
        </Button>
      </div>
      <Button 
        size="lg" 
        className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
        onClick={() => alert('Large button clicked!')}
      >
        <Zap className="w-5 h-5 mr-2" />
        Large Interactive Button
      </Button>
    </div>
  );
};
