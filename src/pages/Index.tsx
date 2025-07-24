
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, Terminal, Settings, MousePointer, Play, Pause } from 'lucide-react';
import LogTrace from '@/components/LogTrace';
import NavBar from '@/components/NavBar';
import { useTracingContext } from '@/App';
import { useLogTraceOrchestrator } from '@/shared/hooks/useLogTraceOrchestrator';

const Index: React.FC = () => {
  console.log('Index component rendering...');
  
  const { tracingActive, setTracingActive } = useTracingContext();
  const [isHoverEnabled, setIsHoverEnabled] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Get the orchestrator data to access events
  const orchestrator = useLogTraceOrchestrator();
  
  const handleToggleTracing = () => {
    console.log('Toggling tracing from:', tracingActive, 'to:', !tracingActive);
    setTracingActive(!tracingActive);
  };

  const handleToggleHover = () => {
    console.log('Toggling hover from:', isHoverEnabled, 'to:', !isHoverEnabled);
    setIsHoverEnabled(!isHoverEnabled);
  };

  const handleToggleTerminal = () => {
    console.log('Toggling terminal from:', showTerminal, 'to:', !showTerminal);
    setShowTerminal(!showTerminal);
  };

  const handleOpenSettings = () => {
    console.log('Opening settings');
    setShowSettings(true);
  };

  useEffect(() => {
    console.log('Index component mounted, tracingActive:', tracingActive);
  }, [tracingActive]);

  console.log('Index component render complete, about to render LogTrace');

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar
        isTracing={tracingActive}
        isHoverEnabled={isHoverEnabled}
        onToggleTracing={handleToggleTracing}
        onToggleHover={handleToggleHover}
        onOpenSettings={handleOpenSettings}
        onToggleTerminal={handleToggleTerminal}
        eventCount={orchestrator.capturedEvents?.length || 0}
        showTerminal={showTerminal}
      />
      
      <LogTrace 
        captureActive={tracingActive}
        onCaptureToggle={setTracingActive}
      />
    </div>
  );
};

export default Index;
