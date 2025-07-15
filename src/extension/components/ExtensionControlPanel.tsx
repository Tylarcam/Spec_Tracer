
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface ExtensionControlPanelProps {
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
  showTerminal: boolean;
  onToggleTerminal: () => void;
}

const ExtensionControlPanel: React.FC<ExtensionControlPanelProps> = ({
  isActive,
  onActiveChange,
  showTerminal,
  onToggleTerminal,
}) => {
  return (
    <div className="fixed top-4 right-4 pointer-events-auto z-[2147483648]">
      <Card className="bg-slate-900/95 border-cyan-500/50 backdrop-blur-md shadow-xl">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Switch 
              checked={isActive} 
              onCheckedChange={onActiveChange}
              className="data-[state=checked]:bg-cyan-500"
            />
            <span className={`text-sm ${isActive ? "text-cyan-400" : "text-gray-500"}`}>
              {isActive ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
          <Button 
            onClick={onToggleTerminal}
            variant="outline"
            size="sm"
            className="border-green-500 text-green-400 hover:bg-green-500/10 w-full"
          >
            Terminal
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ExtensionControlPanel;
