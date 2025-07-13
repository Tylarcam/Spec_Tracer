
import React from 'react';
import { Play, Square, Terminal, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
  remainingUses?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  isActive, 
  setIsActive, 
  showTerminal, 
  setShowTerminal,
  remainingUses = 3
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          LogTrace
        </h1>
        <p className="text-slate-400 text-lg">
          AI-Powered Element Inspector & Debugger
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Usage Counter */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
          <Zap className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-slate-300">
            {remainingUses} free AI debug{remainingUses !== 1 ? 's' : ''} left
          </span>
        </div>

        <Button
          onClick={() => setShowTerminal(!showTerminal)}
          variant={showTerminal ? "default" : "outline"}
          size="sm"
          className={showTerminal 
            ? "bg-green-500 hover:bg-green-600 text-black" 
            : "border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
          }
        >
          <Terminal className="h-4 w-4 mr-2" />
          Terminal
        </Button>
        
        <Button
          onClick={() => setIsActive(!isActive)}
          variant={isActive ? "default" : "outline"}
          className={isActive 
            ? "bg-green-500 hover:bg-green-600 text-black" 
            : "border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
          }
        >
          {isActive ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Stop Tracing
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Tracing
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Header;
