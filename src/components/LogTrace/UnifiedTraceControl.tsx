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
  return;
};
export default UnifiedTraceControl;