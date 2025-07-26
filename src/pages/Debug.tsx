import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import LogTrace from '@/components/LogTrace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  Terminal, 
  Smartphone, 
  Monitor, 
  Activity, 
  Code,
  Eye,
  Zap,
  AlertTriangle
} from 'lucide-react';

const Debug: React.FC = () => {
  const isMobile = useIsMobile();
  const [captureActive, setCaptureActive] = useState(false);
  const [debugStats, setDebugStats] = useState({
    elementsInspected: 0,
    eventsTracked: 0,
    errorsFound: 0,
    sessionTime: 0
  });

  const handleCaptureToggle = () => {
    setCaptureActive(!captureActive);
  };

  // Simulate debug statistics
  useEffect(() => {
    const interval = setInterval(() => {
      setDebugStats(prev => ({
        ...prev,
        sessionTime: prev.sessionTime + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const debugFeatures = [
    {
      id: 'inspector',
      name: 'Element Inspector',
      description: 'Inspect DOM elements in real-time',
      icon: Eye,
      status: 'active'
    },
    {
      id: 'events',
      name: 'Event Tracking',
      description: 'Monitor user interactions and events',
      icon: Activity,
      status: 'active'
    },
    {
      id: 'console',
      name: 'Console Monitor',
      description: 'Track console logs and errors',
      icon: Terminal,
      status: 'active'
    },
    {
      id: 'performance',
      name: 'Performance Metrics',
      description: 'Monitor app performance',
      icon: Zap,
      status: 'inactive'
    }
  ];

  const sampleErrors = [
    {
      id: 1,
      type: 'warning',
      message: 'Deprecated API usage detected',
      timestamp: '2024-01-20 14:30:25',
      source: 'main.tsx:45'
    },
    {
      id: 2,
      type: 'error',
      message: 'Failed to load resource',
      timestamp: '2024-01-20 14:32:10',
      source: 'network'
    },
    {
      id: 3,
      type: 'info',
      message: 'Debug session started',
      timestamp: '2024-01-20 14:25:00',
      source: 'LogTrace'
    }
  ];

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <LogTrace 
        captureActive={captureActive}
        onCaptureToggle={handleCaptureToggle}
      />
      
      {/* Mobile-optimized spacing */}
      <div className={`${isMobile ? 'pt-20 px-4 pb-20' : 'pt-4 px-6 pb-6'}`}>
        {/* Header */}
        <div className={`mb-6 ${isMobile ? 'text-center' : ''}`}>
          <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Bug className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Debug Center</h1>
          </div>
          
          <p className={`text-slate-400 max-w-2xl ${isMobile ? 'text-sm mx-auto' : ''}`}>
            Monitor your application's behavior, track events, and debug issues in real-time.
          </p>

          {/* Mobile device indicator */}
          {isMobile && (
            <div className="flex items-center justify-center gap-2 mt-4 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-xs font-medium">
              <Smartphone className="h-3 w-3" />
              Mobile Debug Mode
            </div>
          )}
        </div>

        {/* Debug Statistics */}
        <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className={`p-${isMobile ? '3' : '4'} text-center`}>
              <div className={`text-${isMobile ? 'lg' : '2xl'} font-bold text-green-400 mb-1`}>
                {debugStats.elementsInspected}
              </div>
              <div className={`text-${isMobile ? 'xs' : 'sm'} text-slate-400`}>
                Elements Inspected
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className={`p-${isMobile ? '3' : '4'} text-center`}>
              <div className={`text-${isMobile ? 'lg' : '2xl'} font-bold text-blue-400 mb-1`}>
                {debugStats.eventsTracked}
              </div>
              <div className={`text-${isMobile ? 'xs' : 'sm'} text-slate-400`}>
                Events Tracked
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className={`p-${isMobile ? '3' : '4'} text-center`}>
              <div className={`text-${isMobile ? 'lg' : '2xl'} font-bold text-red-400 mb-1`}>
                {debugStats.errorsFound}
              </div>
              <div className={`text-${isMobile ? 'xs' : 'sm'} text-slate-400`}>
                Errors Found
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className={`p-${isMobile ? '3' : '4'} text-center`}>
              <div className={`text-${isMobile ? 'lg' : '2xl'} font-bold text-cyan-400 mb-1`}>
                {formatTime(debugStats.sessionTime)}
              </div>
              <div className={`text-${isMobile ? 'xs' : 'sm'} text-slate-400`}>
                Session Time
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Features */}
        <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className={`${isMobile ? 'pb-3' : 'pb-4'}`}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'} text-green-400`}>
                <Code className="h-5 w-5" />
                Debug Features
              </CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-400`}>
                Available debugging tools and their status
              </CardDescription>
            </CardHeader>
            <CardContent className={`space-y-${isMobile ? '2' : '3'}`}>
              {debugFeatures.map((feature) => (
                <div key={feature.id} className={`flex items-center justify-between p-${isMobile ? '2' : '3'} bg-slate-700/50 rounded-lg`}>
                  <div className="flex items-center gap-3">
                    <feature.icon className={`h-${isMobile ? '4' : '5'} w-${isMobile ? '4' : '5'} text-cyan-400`} />
                    <div>
                      <div className={`font-medium text-white ${isMobile ? 'text-sm' : ''}`}>
                        {feature.name}
                      </div>
                      <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {feature.description}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={feature.status === 'active' ? 'default' : 'secondary'}
                    className={`${isMobile ? 'text-xs px-2 py-1' : ''}`}
                  >
                    {feature.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className={`${isMobile ? 'pb-3' : 'pb-4'}`}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'} text-red-400`}>
                <AlertTriangle className="h-5 w-5" />
                Recent Issues
              </CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-400`}>
                Console logs and error messages
              </CardDescription>
            </CardHeader>
            <CardContent className={`space-y-${isMobile ? '2' : '3'}`}>
              <div className={`max-h-${isMobile ? '48' : '64'} overflow-y-auto space-y-2`}>
                {sampleErrors.map((error) => (
                  <div key={error.id} className={`p-${isMobile ? '2' : '3'} bg-slate-700/30 rounded border-l-2 border-l-${error.type === 'error' ? 'red' : error.type === 'warning' ? 'yellow' : 'blue'}-400`}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm">{getErrorIcon(error.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-white ${isMobile ? 'text-xs' : 'text-sm'} break-words`}>
                          {error.message}
                        </div>
                        <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
                          {error.source} • {isMobile ? error.timestamp.split(' ')[1] : error.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-specific debug tools */}
        {isMobile && (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-cyan-400">
                <Smartphone className="h-5 w-5" />
                Mobile Debug Tools
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Touch-optimized debugging features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  className="justify-start h-10 text-sm"
                  onClick={() => setDebugStats(prev => ({ ...prev, elementsInspected: prev.elementsInspected + 1 }))}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Inspect Element
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-10 text-sm"
                  onClick={() => setDebugStats(prev => ({ ...prev, eventsTracked: prev.eventsTracked + 1 }))}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Track Event
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-10 text-sm"
                  onClick={() => console.log('Mobile debug log entry')}
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  Add Console Log
                </Button>
              </div>
              
              <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
                <strong>Tip:</strong> Use the floating action button for quick access to all debug tools
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Debug;
