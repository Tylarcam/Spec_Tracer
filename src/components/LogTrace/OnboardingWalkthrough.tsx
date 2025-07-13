
import React from 'react';
import { X, ArrowRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingWalkthroughProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({
  step,
  onNext,
  onSkip,
  onComplete,
}) => {
  const steps = [
    {
      title: "Hover over elements",
      description: "See the halo? That's real-time element data at your fingertips.",
      position: "center",
      mobileDescription: "Tap elements to see real-time data instantly."
    },
    {
      title: "Click for AI insights",
      description: "Here's the AI debug panel with instant suggestions and solutions.",
      position: "center",
      mobileDescription: "Get AI-powered debugging suggestions with a simple tap."
    },
    {
      title: "View full terminal",
      description: "Press T or tap the terminal icon to view your debug history.",
      position: "bottom",
      mobileDescription: "Swipe up or tap the terminal to see your debug history."
    }
  ];

  const currentStep = steps[step];
  const isMobile = window.innerWidth < 768;

  if (step >= steps.length) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`
        bg-slate-900 border border-green-500/30 rounded-xl shadow-2xl
        w-full max-w-md mx-4
        ${currentStep.position === 'bottom' ? 'mb-8' : ''}
        animate-fade-in
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-500/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-green-400 font-semibold text-sm">
              Step {step + 1} of {steps.length}
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

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-3">
            {currentStep.title}
          </h3>
          <p className="text-gray-300 text-base leading-relaxed mb-6">
            {isMobile ? currentStep.mobileDescription : currentStep.description}
          </p>

          {/* Progress indicator */}
          <div className="flex gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full flex-1 transition-colors ${
                  index <= step ? 'bg-green-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onSkip}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 h-12"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip Tutorial
            </Button>
            <Button
              onClick={step === steps.length - 1 ? onComplete : onNext}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12"
            >
              {step === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWalkthrough;
