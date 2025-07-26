
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import LogTrace from '@/components/LogTrace';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Smartphone, Monitor, Zap, Target, Code, Settings } from 'lucide-react';

const InteractiveDemo: React.FC = () => {
  const isMobile = useIsMobile();
  const [captureActive, setCaptureActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const handleCaptureToggle = () => {
    setCaptureActive(!captureActive);
  };

  const demoSteps = [
    {
      title: "Welcome to LogTrace Interactive Demo",
      description: "Learn how to debug your web applications with LogTrace",
      action: "Start Demo",
      icon: PlayCircle
    },
    {
      title: "Inspect Elements",
      description: "Click on any element to inspect its properties and behavior",
      action: "Try Inspecting",
      icon: Target
    },
    {
      title: "Monitor Events",
      description: "Track user interactions and system events in real-time",
      action: "View Events",
      icon: Zap
    },
    {
      title: "Debug Console",
      description: "Access console logs and error messages directly in the interface",
      action: "Open Console",
      icon: Code
    }
  ];

  const currentStep = demoSteps[demoStep] || demoSteps[0];

  return (
    <div className="min-h-screen bg-slate-900">
      <LogTrace 
        captureActive={captureActive}
        onCaptureToggle={handleCaptureToggle}
      />
      
      {/* Mobile-optimized content */}
      <div className={`${isMobile ? 'pt-20 px-4 pb-20' : 'pt-4 px-6 pb-6'}`}>
        {/* Header */}
        <div className={`mb-6 ${isMobile ? 'text-center' : ''}`}>
          <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <PlayCircle className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Interactive Demo</h1>
          </div>
          
          <p className={`text-slate-400 max-w-2xl ${isMobile ? 'text-sm mx-auto' : ''}`}>
            Experience LogTrace's debugging capabilities through this interactive walkthrough.
          </p>

          {/* Mobile device indicator */}
          {isMobile && (
            <div className="flex items-center justify-center gap-2 mt-4 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium">
              <Smartphone className="h-3 w-3" />
              Mobile Demo Mode
            </div>
          )}
        </div>

        {/* Demo Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            {demoSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= demoStep ? 'bg-blue-500' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-slate-400 text-sm">
            Step {demoStep + 1} of {demoSteps.length}
          </div>
        </div>

        {/* Current Demo Step */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader className={`text-center ${isMobile ? 'pb-3' : 'pb-4'}`}>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <currentStep.icon className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} text-white mb-2`}>
              {currentStep.title}
            </CardTitle>
            <CardDescription className={`${isMobile ? 'text-sm' : 'text-base'} text-slate-300`}>
              {currentStep.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'} mb-6`}>
              <Button
                onClick={() => setDemoStep((prev) => Math.min(prev + 1, demoSteps.length - 1))}
                className={`bg-blue-600 hover:bg-blue-700 text-white ${isMobile ? 'h-12' : 'h-10'}`}
                disabled={demoStep >= demoSteps.length - 1}
              >
                {currentStep.action}
              </Button>
              <Button
                onClick={() => setDemoStep((prev) => Math.max(prev - 1, 0))}
                variant="outline"
                className={`border-slate-600 text-slate-300 hover:bg-slate-700 ${isMobile ? 'h-12' : 'h-10'}`}
                disabled={demoStep <= 0}
              >
                Previous
              </Button>
              <Button
                onClick={() => setDemoStep(0)}
                variant="ghost"
                className={`text-slate-400 hover:text-white hover:bg-slate-700 ${isMobile ? 'h-12' : 'h-10'}`}
              >
                Restart Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Features Grid */}
        <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {demoSteps.map((step, index) => (
            <Card 
              key={index}
              className={`bg-slate-800 border-slate-700 transition-all cursor-pointer ${
                index === demoStep ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setDemoStep(index)}
            >
              <CardContent className={`p-${isMobile ? '4' : '6'} text-center`}>
                <step.icon className={`h-${isMobile ? '8' : '10'} w-${isMobile ? '8' : '10'} text-blue-400 mx-auto mb-3`} />
                <h3 className={`font-semibold text-white mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {step.title}
                </h3>
                <p className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {step.description}
                </p>
                {index === demoStep && (
                  <Badge className="mt-3 bg-blue-600 hover:bg-blue-700">
                    Current Step
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile-specific demo tools */}
        {isMobile && (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-blue-400">
                <Settings className="h-5 w-5" />
                Demo Controls
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Touch-friendly demo navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCaptureToggle}
                  className={captureActive ? 'bg-green-600 border-green-600 text-white' : ''}
                >
                  {captureActive ? 'Stop Capture' : 'Start Capture'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => console.log('Demo interaction logged')}
                >
                  Log Interaction
                </Button>
              </div>
              
              <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
                <strong>Tip:</strong> Use the floating debug panel to access all LogTrace features during the demo
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InteractiveDemo;
