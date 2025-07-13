
import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingWalkthroughProps {
  isActive: boolean;
  currentElement: any;
  mousePosition: { x: number; y: number };
  showInteractivePanel: boolean;
  showTerminal: boolean;
  onComplete: () => void;
}

const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({
  isActive,
  currentElement,
  mousePosition,
  showInteractivePanel,
  showTerminal,
  onComplete,
}) => {
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Check if user has completed tutorial
  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem('logtrace-tutorial-completed');
    if (!hasCompletedTutorial && isActive) {
      setIsVisible(true);
    }
  }, [isActive]);

  // Auto-advance based on user actions
  useEffect(() => {
    if (!isVisible) return;

    if (walkthroughStep === 0 && currentElement) {
      // User is hovering over an element
      setTimeout(() => setWalkthroughStep(1), 1500);
    } else if (walkthroughStep === 1 && showInteractivePanel) {
      // User clicked an element and panel is showing
      setTimeout(() => setWalkthroughStep(2), 2000);
    } else if (walkthroughStep === 2 && showTerminal) {
      // User opened terminal
      setTimeout(() => handleComplete(), 2000);
    }
  }, [walkthroughStep, currentElement, showInteractivePanel, showTerminal, isVisible]);

  const handleComplete = () => {
    localStorage.setItem('logtrace-tutorial-completed', 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleNext = () => {
    if (walkthroughStep < 2) {
      setWalkthroughStep(walkthroughStep + 1);
    } else {
      handleComplete();
    }
  };

  if (!isVisible) return null;

  const getStepContent = () => {
    switch (walkthroughStep) {
      case 0:
        return {
          title: "Welcome to LogTrace! 👋",
          description: "Move your mouse around to see the halo effect. That's real-time element data being captured.",
          position: { top: '20%', left: '50%', transform: 'translateX(-50%)' }
        };
      case 1:
        return {
          title: "Click to Inspect 🔍",
          description: "Click on any element to open the AI debug panel with instant suggestions and insights.",
          position: showInteractivePanel 
            ? { top: mousePosition.y - 100, left: mousePosition.x + 20 }
            : { top: '40%', left: '50%', transform: 'translateX(-50%)' }
        };
      case 2:
        return {
          title: "View Terminal History 📊",
          description: "Press 'T' or use the terminal button to view your debugging history and AI responses.",
          position: { bottom: '20%', right: '20px' }
        };
      default:
        return { title: "", description: "", position: {} };
    }
  };

  const stepContent = getStepContent();

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" />
      
      {/* Tutorial Card */}
      <div 
        className="absolute bg-slate-800 border border-green-400 rounded-lg p-4 max-w-sm pointer-events-auto"
        style={stepContent.position}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="text-green-400 text-sm font-mono">
              Step {walkthroughStep + 1} of 3
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="h-6 w-6 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <h3 className="text-white font-semibold mb-2">{stepContent.title}</h3>
        <p className="text-slate-300 text-sm mb-4">{stepContent.description}</p>
        
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-slate-400 hover:text-white text-sm"
          >
            Skip Tutorial
          </Button>
          <Button
            onClick={handleNext}
            className="bg-green-500 hover:bg-green-600 text-black text-sm"
          >
            {walkthroughStep === 2 ? 'Finish' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWalkthrough;
