
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Crown, Play, Terminal, Brain, MousePointer, Eye, Pin, Settings } from 'lucide-react';
import LogTrace from '@/components/LogTrace';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';
import { useAuth } from '@/contexts/AuthContext';
import UpgradeModal from '@/components/LogTrace/UpgradeModal';

const TestDemo: React.FC = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { creditsStatus } = useCreditsSystem();

  const remainingCredits = creditsStatus?.creditsRemaining || 0;
  const totalCredits = creditsStatus?.creditsLimit || 5;
  const isPremium = creditsStatus?.isPremium || false;

  // Demo content for testing LogTrace functionality
  const demoContent = [
    {
      id: 'interactive-button',
      title: 'Interactive Button',
      description: 'Click this button to test element inspection',
      content: (
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3">
          <Play className="w-4 h-4 mr-2" />
          Test Button
        </Button>
      )
    },
    {
      id: 'form-elements',
      title: 'Form Elements',
      description: 'Various form inputs for testing inspection',
      content: (
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Test input field"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          />
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option>Select option</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
          <textarea 
            placeholder="Test textarea"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20"
          />
        </div>
      )
    },
    {
      id: 'nested-elements',
      title: 'Nested Elements',
      description: 'Complex nested structure for hierarchy testing',
      content: (
        <div className="border-2 border-purple-300 p-4 rounded-lg">
          <div className="bg-purple-100 p-3 rounded">
            <span className="text-purple-700 font-semibold">Parent Container</span>
            <div className="mt-2 bg-white p-2 rounded border">
              <span className="text-gray-600">Child Element</span>
              <div className="mt-1 bg-gray-100 p-1 rounded text-sm">
                <span className="text-gray-500">Grandchild Element</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'styled-components',
      title: 'Styled Components',
      description: 'Various styled elements with different CSS properties',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-pink-400 to-red-500 p-4 rounded-lg text-white">
            Gradient Box
          </div>
          <div className="border-4 border-dashed border-green-400 p-4 rounded-lg text-green-700">
            Dashed Border
          </div>
          <div className="shadow-lg bg-white p-4 rounded-lg">
            Shadow Element
          </div>
          <div className="bg-yellow-200 p-4 rounded-lg transform rotate-3">
            Rotated Element
          </div>
        </div>
      )
    }
  ];

  const workflowTips = [
    {
      icon: <MousePointer className="w-4 h-4" />,
      title: "Hover over elements to see live details",
      shortcut: "Mouse movement"
    },
    {
      icon: <Eye className="w-4 h-4" />,
      title: "Use 'D' key to freeze hover details at cursor position",
      shortcut: "D"
    },
    {
      icon: <Pin className="w-4 h-4" />,
      title: "Click elements to pin details for comparison",
      shortcut: "Click"
    },
    {
      icon: <Settings className="w-4 h-4" />,
      title: "Drag pinned details to organize your workspace",
      shortcut: "Drag & Drop"
    }
  ];

  const advancedFeatures = [
    {
      icon: <Eye className="w-4 h-4" />,
      title: "Pause/resume hover details",
      shortcut: "D"
    },
    {
      icon: <Brain className="w-4 h-4" />,
      title: "Quick debug with AI", 
      shortcut: "Ctrl+D"
    },
    {
      icon: <Terminal className="w-4 h-4" />,
      title: "Toggle terminal view",
      shortcut: "T"
    }
  ];

  const aiDebuggingFeatures = [
    "Use Ctrl+D for instant AI analysis",
    "Get CSS, accessibility, and UX insights", 
    "Export event logs for detailed debugging",
    "View all responses in the terminal"
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                LogTrace Test Demo
              </h1>
              <p className="text-slate-400 text-sm">Interactive Element Debugger & Inspector</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-green-500/30 text-green-400">
              <Zap className="w-3 h-3 mr-1" />
              {remainingCredits}/{totalCredits}
            </Badge>
            {isPremium && (
              <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
            {!isPremium && (
              <Button
                onClick={() => setShowUpgradeModal(true)}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Crown className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Start */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-cyan-400">Quick Start</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">S</Badge>
                <span className="text-slate-300">Start context capture</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">D</Badge>
                <span className="text-slate-300">Pin element details</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">Esc</Badge>
                <span className="text-slate-300">Exit capture mode</span>
              </div>
            </div>
          </Card>

          {/* Workflow Tips */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MousePointer className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold text-green-400">Workflow Tips</h2>
            </div>
            <div className="space-y-2 text-sm">
              {workflowTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="text-green-400 mt-0.5">{tip.icon}</div>
                  <span className="text-slate-300">{tip.title}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Advanced Features */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-purple-400">Advanced Features</h2>
            </div>
            <div className="space-y-2 text-sm">
              {advancedFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-purple-400">{feature.icon}</div>
                    <span className="text-slate-300">{feature.title}</span>
                  </div>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">
                    {feature.shortcut}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Debugging Section */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-cyan-400">AI Debugging</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ul className="space-y-2 text-sm text-slate-300">
                {aiDebuggingFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="text-cyan-400 font-semibold mb-2">💡 Pro Tip</div>
              <p className="text-sm text-slate-300">
                Press 'D' to pause hover details, then move your cursor freely while keeping the element 
                information visible. Perfect for precise debugging or when you need to reference multiple 
                elements simultaneously.
              </p>
            </div>
          </div>
        </Card>

        {/* Demo Elements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {demoContent.map((demo) => (
            <Card key={demo.id} className="bg-slate-800 border-slate-700 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">{demo.title}</h3>  
                <p className="text-sm text-slate-400">{demo.description}</p>
              </div>
              <div className="min-h-[100px] flex items-center justify-center">
                {demo.content}
              </div>
            </Card>
          ))}
        </div>

        {/* Instructions Footer */}
        <Card className="bg-slate-800 border-slate-700 p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">How to Use This Demo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <h4 className="font-medium text-cyan-400 mb-2">Getting Started:</h4>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Press <kbd className="bg-slate-700 px-1 rounded">S</kbd> to activate LogTrace</li>
                <li>Move your mouse over any element above</li>
                <li>Click elements to open detailed inspector</li>
                <li>Press <kbd className="bg-slate-700 px-1 rounded">Ctrl+D</kbd> to debug with AI</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-green-400 mb-2">Advanced Usage:</h4>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Press <kbd className="bg-slate-700 px-1 rounded">D</kbd> to freeze hover details</li>
                <li>Press <kbd className="bg-slate-700 px-1 rounded">T</kbd> to open terminal</li>
                <li>Press <kbd className="bg-slate-700 px-1 rounded">Esc</kbd> to exit any mode</li>
                <li>Right-click for quick actions menu</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>

      {/* LogTrace Overlay */}
      <LogTrace />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        remainingUses={remainingCredits}
      />
    </div>
  );
};

export default TestDemo;
