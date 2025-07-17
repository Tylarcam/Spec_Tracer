
import React, { useEffect, useState } from 'react';
import { X, ArrowRight, SkipForward, CheckCircle, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface OnboardingWalkthroughProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
  isActive?: boolean;
  currentElement?: any;
  mousePosition?: { x: number; y: number };
  showInspectorOpen?: boolean;
  showTerminal?: boolean;
}

const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({
  step,
  onNext,
  onSkip,
  onComplete,
  isActive,
  currentElement,
  showInspectorOpen,
  showTerminal,
  mousePosition,
}) => {
  const navigate = useNavigate();
  const [userActions, setUserActions] = useState({
    rightClicked: false,
    startedLogTrace: false,
    hoveredElement: false,
    openedElementActions: false,
    openedTerminal: false,
  });
  const [waitingForAction, setWaitingForAction] = useState(true);
  const [showHighlight, setShowHighlight] = useState(true);

  // Interactive steps configuration - Updated for right-click workflow
  const interactiveSteps = [
    {
      title: "Right-click for Actions",
      description: "Right-click anywhere on the page to open the LogTrace context menu",
      mobileDescription: "Long-press anywhere on the page to open the LogTrace context menu",
      action: "rightClicked",
      requirement: "Right-click anywhere",
      position: "center",
      highlight: "Right-click to open menu",
    },
    {
      title: "Start LogTrace",
      description: "From the context menu, click 'Start LogTrace' to begin element inspection",
      mobileDescription: "From the context menu, tap 'Start LogTrace' to begin element inspection",
      action: "startedLogTrace",
      requirement: "Click 'Start LogTrace'",
      position: "center",
      highlight: "Start LogTrace from menu",
    },
    {
      title: "Hover over elements",
      description: "Move your mouse over any element to see the green halo and real-time data",
      mobileDescription: "Tap on elements to see real-time data and inspection details",
      action: "hoveredElement", 
      requirement: "Hover over an element",
      position: "center",
      highlight: "Move mouse over elements",
    },
    {
      title: "Element Actions",
      description: "Right-click on an element to see element-specific actions like 'View Details' and 'AI Debug'",
      mobileDescription: "Long-press on an element to see element-specific actions like 'View Details' and 'AI Debug'",
      action: "openedElementActions",
      requirement: "Right-click on element",
      position: "center",
      highlight: "Right-click on element for actions",
    },
    {
      title: "View Terminal",
      description: "Right-click and select 'Open Terminal' to view your debug history and logs",
      mobileDescription: "From the context menu, tap 'Open Terminal' to view your debug history and logs",
      action: "openedTerminal",
      requirement: "Open Terminal from menu",
      position: "bottom",
      highlight: "Open Terminal from context menu",
    }
  ];

  const isMobile = window.innerWidth < 768;
  const currentStepData = interactiveSteps[step];

  // Listen for context menu events
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (step === 0) {
        setUserActions(prev => ({ ...prev, rightClicked: true }));
      } else if (step === 3 && currentElement) {
        setUserActions(prev => ({ ...prev, openedElementActions: true }));
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [step, currentElement]);

  // Track LogTrace state changes
  useEffect(() => {
    if (step === 1 && isActive) {
      setUserActions(prev => ({ ...prev, startedLogTrace: true }));
    }
    if (step === 2 && currentElement) {
      setUserActions(prev => ({ ...prev, hoveredElement: true }));
    }
    if (step === 4 && showTerminal) {
      setUserActions(prev => ({ ...prev, openedTerminal: true }));
    }
  }, [step, isActive, currentElement, showTerminal]);

  // Check if current step action is completed
  const isStepCompleted = () => {
    if (!currentStepData) return false;
    return userActions[currentStepData.action as keyof typeof userActions];
  };

  // Auto-advance when step is completed
  useEffect(() => {
    if (isStepCompleted() && waitingForAction) {
      setWaitingForAction(false);
      setTimeout(() => {
        if (step < interactiveSteps.length - 1) {
          onNext();
          setWaitingForAction(true);
        }
      }, 1500);
    }
  }, [userActions, step, waitingForAction, onNext]);

  // Pulse highlight effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHighlight(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleContinueToDemo = () => {
    onComplete();
    navigate('/interactive-demo');
  };

  if (step >= interactiveSteps.length) {
    // Final completion screen
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-green-500/30 rounded-xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-green-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-green-400 font-semibold text-sm">
                Onboarding Complete!
              </span>
            </div>
            <Button
              onClick={onSkip}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 text-center">
            <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-4 rounded-xl mb-4 w-16 h-16 mx-auto flex items-center justify-center">
              <MousePointer2 className="h-8 w-8 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3">
              Great job! You've mastered LogTrace
            </h3>
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              You can now debug any website using the powerful right-click context menu. 
              No more keyboard conflicts - just right-click for all actions!
            </p>

            <div className="flex gap-3">
              <Button
                onClick={onComplete}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 h-12"
              >
                Close Tutorial
              </Button>
              <Button
                onClick={handleContinueToDemo}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12"
              >
                Continue to Interactive Demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentStepData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Floating highlight for current action */}
      {waitingForAction && (
        <div className={`
          fixed top-20 left-1/2 transform -translate-x-1/2 z-60
          bg-green-500/20 border-2 border-green-500 rounded-lg px-4 py-2
          ${showHighlight ? 'animate-pulse' : ''}
          transition-opacity duration-300
        `}>
          <span className="text-green-400 font-semibold text-sm flex items-center gap-2">
            <MousePointer2 className="h-4 w-4" />
            {currentStepData.highlight}
          </span>
        </div>
      )}

      <div className={`
        bg-slate-900 border border-green-500/30 rounded-xl shadow-2xl
        w-full max-w-md mx-4
        ${currentStepData.position === 'bottom' ? 'mb-8' : ''}
        animate-fade-in
      `}>
        <div className="flex items-center justify-between p-4 border-b border-green-500/20">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isStepCompleted() ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-green-400 font-semibold text-sm">
              Step {step + 1} of {interactiveSteps.length}
            </span>
            {isStepCompleted() && (
              <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
            )}
          </div>
          <Button
            onClick={onSkip}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-3">
            {currentStepData.title}
          </h3>
          <p className="text-gray-300 text-base leading-relaxed mb-4">
            {isMobile ? currentStepData.mobileDescription : currentStepData.description}
          </p>

          <div className={`
            p-3 rounded-lg mb-6 border-2 transition-colors
            ${isStepCompleted() 
              ? 'bg-green-500/20 border-green-500 text-green-300' 
              : 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
            }
          `}>
            <div className="flex items-center gap-2">
              {isStepCompleted() ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 border-2 border-current rounded animate-spin"></div>
              )}
              <span className="font-semibold text-sm">
                {isStepCompleted() ? 'Completed!' : `Try it: ${currentStepData.requirement}`}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {interactiveSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full flex-1 transition-colors ${
                  index < step ? 'bg-green-500' : 
                  index === step ? (isStepCompleted() ? 'bg-green-500' : 'bg-yellow-500') : 
                  'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onSkip}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 h-12"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip Tutorial
            </Button>
            
            {isStepCompleted() && (
              <Button
                onClick={() => {
                  if (step === interactiveSteps.length - 1) {
                    onNext();
                  } else {
                    onNext();
                    setWaitingForAction(true);
                  }
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12"
              >
                {step === interactiveSteps.length - 1 ? 'Complete' : 'Next Step'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWalkthrough;
