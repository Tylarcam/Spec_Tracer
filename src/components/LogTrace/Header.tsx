
import React from 'react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';

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
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">LogTrace</h1>
        <p className="text-green-300">Mouse Cursor & Memory Log Debug Terminal</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch 
            checked={isActive} 
            onCheckedChange={setIsActive}
            className="data-[state=checked]:bg-cyan-500"
          />
          <span className={isActive ? "text-cyan-400" : "text-gray-500"}>
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
        <Button 
          onClick={() => setShowTerminal(!showTerminal)}
          variant="outline"
          className="border-green-500 text-green-400 hover:bg-green-500/10"
        >
          Terminal
        </Button>
      </div>
    </div>
  );
};

export default Header;
