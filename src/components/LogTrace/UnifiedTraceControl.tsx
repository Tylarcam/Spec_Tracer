
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Activity, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface UnifiedTraceControlProps {
  isTracing: boolean;
  isHoverEnabled: boolean;
  onToggleTracing: () => void;
  onToggleHover: () => void;
  onOpenSettings: () => void;
  eventCount: number;
  className?: string;
}

const UnifiedTraceControl: React.FC<UnifiedTraceControlProps> = ({
  isTracing,
  isHoverEnabled,
  onToggleTracing,
  onToggleHover,
  onOpenSettings,
  eventCount,
  className
}) => {
  const [showPulse, setShowPulse] = useState(false);

  // Pulse animation when tracing is active
  useEffect(() => {
    if (isTracing) {
      setShowPulse(true);
      const interval = setInterval(() => {
        setShowPulse(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setShowPulse(false);
    }
  }, [isTracing]);

  return (
    <div className={cn(
      "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
      "bg-slate-900/95 backdrop-blur-sm border border-green-500/30 rounded-lg p-4",
      "flex items-center gap-4 shadow-lg",
      className
    )}>
      {/* Trace Toggle */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onToggleTracing}
          variant={isTracing ? "default" : "outline"}
          size="sm"
          className={cn(
            "flex items-center gap-2",
            isTracing 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "border-green-500/50 text-green-400 hover:bg-green-500/10"
          )}
        >
          {isTracing ? (
            <>
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Start</span>
            </>
          )}
        </Button>
        
        {/* Activity Indicator */}
        {isTracing && (
          <div className="flex items-center gap-1">
            <Activity className={cn(
              "h-4 w-4 text-green-400",
              showPulse && "animate-pulse"
            )} />
            <span className="text-sm text-green-400">Active</span>
          </div>
        )}
      </div>

      {/* Event Count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">Events:</span>
        <Badge variant="outline" className="text-green-400 border-green-500/50">
          {eventCount}
        </Badge>
      </div>

      {/* Hover Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">Hover:</span>
        <Switch
          checked={isHoverEnabled}
          onCheckedChange={onToggleHover}
          className="data-[state=checked]:bg-green-600"
        />
      </div>

      {/* Settings Button */}
      <Button
        onClick={onOpenSettings}
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white hover:bg-slate-800"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UnifiedTraceControl;
