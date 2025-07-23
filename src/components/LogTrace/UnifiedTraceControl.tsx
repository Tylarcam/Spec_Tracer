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
  className,
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
      "bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg",
      "px-4 py-3 shadow-lg transition-all duration-300",
      "flex items-center gap-4",
      className
    )}
      role="toolbar"
      aria-label="Tracing control panel">      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full transition-all duration-300",
          isTracing 
            ? "bg-green-400 shadow-lg shadow-green-400/50" 
            : "bg-slate-500"
        )}>
          {isTracing && showPulse && (
            <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
          )}
        </div>
        <Badge 
          variant={isTracing ? "default" : "secondary"}
          className={cn(
            "text-xs font-medium transition-all duration-300",
            isTracing 
              ? "bg-green-500/20 text-green-400 border-green-500/30" 
              : "bg-slate-700/50 text-slate-400 border-slate-600/30"
          )}
        >
          {isTracing ? "ACTIVE" : "INACTIVE"}
        </Badge>
      </div>

      {/* Trace Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-300 font-medium">Trace:</span>
        <Switch
          checked={isTracing}
          onCheckedChange={onToggleTracing}
          className={cn(
            "transition-all duration-300",
            isTracing ? "bg-green-500" : "bg-slate-600"
          )}
        />
      </div>

      {/* Hover Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-300 font-medium">Hover:</span>
        <Switch
          checked={isHoverEnabled}
          onCheckedChange={onToggleHover}
          disabled={!isTracing}
          className={cn(
            "transition-all duration-300",
            isHoverEnabled ? "bg-blue-500" : "bg-slate-600",
            !isTracing && "opacity-50"
          )}
        />
      </div>

      {/* Event Counter */}
      {isTracing && (
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span className="text-xs text-cyan-400 font-mono">
            {eventCount} events
          </span>
        </div>
      )}



      {/* Settings */}
      <Button
        onClick={onOpenSettings}
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 transition-all duration-300"
      >
        <Settings className="w-3 h-3" />
      </Button>

      {/* Tracing Status Text */}
      {isTracing && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="text-xs text-yellow-400 font-medium animate-pulse">
            Tracing...
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedTraceControl; 