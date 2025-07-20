
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Settings, Zap, Target } from 'lucide-react';

const TestComponentsSection: React.FC = () => {
  const [sliderValue, setSliderValue] = useState([50]);
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleTestButtonClick = () => {
    setButtonClicked(true);
    setTimeout(() => setButtonClicked(false), 2000);
  };

  return (
    <div className="bg-slate-800/40 rounded-xl border border-purple-500/20 p-6 max-w-4xl">
      <h2 className="text-purple-400 font-bold text-xl mb-4 flex items-center gap-2">
        <Target className="h-5 w-5" />
        Test These Components
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-green-400 font-semibold mb-3">🎯 Interactive Elements</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <h4 className="text-white font-medium mb-2">Test Button</h4>
              <Button 
                onClick={handleTestButtonClick}
                className={`w-full ${buttonClicked ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {buttonClicked ? (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Clicked!
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Click Me
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Try hovering and clicking this button with LogTrace active
              </p>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <h4 className="text-white font-medium mb-3">Pill Slider</h4>
              <div className="space-y-3">
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Value:</span>
                  <span className="text-sm font-mono text-cyan-400">{sliderValue[0]}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Drag the slider while tracing to see detailed interaction data
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-green-400 font-semibold mb-3">🔍 What to Try</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono text-xs mt-0.5">1.</span>
              <span className="text-gray-300">
                <strong className="text-white">Activate LogTrace</strong> using the capture toggle in the nav bar
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono text-xs mt-0.5">2.</span>
              <span className="text-gray-300">
                <strong className="text-white">Hover over these components</strong> to see live inspection
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono text-xs mt-0.5">3.</span>
              <span className="text-gray-300">
                <strong className="text-white">Click to open inspector panels</strong> with detailed analysis
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono text-xs mt-0.5">4.</span>
              <span className="text-gray-300">
                <strong className="text-white">Use AI Debug</strong> to get intelligent insights
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Perfect for Testing
            </h4>
            <p className="text-purple-200 text-sm">
              These components are designed to showcase LogTrace's capabilities. 
              They provide rich interaction data and demonstrate various debugging scenarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestComponentsSection;
