
import React from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface HeaderProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  isActive,
  setIsActive,
  showTerminal,
  setShowTerminal,
}) => {
  return (
    <Card className="bg-slate-800/50 border-green-500/30 mb-6">
      <div className="p-6">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">LogTrace</h1>
        <p className="text-green-300 mb-4">Interactive Element Debugger</p>
        
        <div className="flex gap-4">
          <Button
            onClick={() => setIsActive(!isActive)}
            className={`${
              isActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isActive ? 'Stop Tracing' : 'Start Tracing'}
          </Button>
          
          <Button
            onClick={() => setShowTerminal(!showTerminal)}
            variant="outline"
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
          >
            {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Header;
