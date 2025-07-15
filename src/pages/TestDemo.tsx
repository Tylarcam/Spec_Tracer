
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Crown, Play, Terminal, Brain, MousePointer, Eye, Pin, Settings, Code, Database, Layers } from 'lucide-react';
import LogTrace from '@/components/LogTrace';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';
import { useAuth } from '@/contexts/AuthContext';
import UpgradeModal from '@/components/LogTrace/UpgradeModal';

const TestDemo: React.FC = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { creditsStatus } = useCreditsSystem();

  const remainingCredits = creditsStatus?.creditsRemaining || 0;
  const totalCredits = creditsStatus?.creditsLimit || 5;
  const isPremium = creditsStatus?.isPremium || false;

  // Enhanced demo content with more interactive elements
  const demoContent = [
    {
      id: 'interactive-buttons',
      title: 'Interactive Buttons',
      description: 'Various button types for testing element inspection and hover states',
      content: (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              onClick={() => setActiveSection('buttons')}
            >
              <Play className="w-4 h-4 mr-2" />
              Primary Action
            </Button>
            <Button 
              variant="outline" 
              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              onClick={() => setActiveSection('outline')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Secondary
            </Button>
            <Button 
              variant="ghost" 
              className="text-purple-500 hover:bg-purple-100 hover:text-purple-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Ghost Button
            </Button>
          </div>
          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
            onClick={() => alert('Large button clicked!')}
          >
            <Zap className="w-5 h-5 mr-2" />
            Large Interactive Button
          </Button>
        </div>
      )
    },
    {
      id: 'form-elements',
      title: 'Form Elements',
      description: 'Complex form inputs with validation states and interactions',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="Email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              data-testid="email-input"
            />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              data-testid="password-input"
            />
          </div>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Choose an option</option>
            <option value="developer">Frontend Developer</option>
            <option value="designer">UI/UX Designer</option>
            <option value="manager">Product Manager</option>
          </select>
          <textarea 
            placeholder="Tell us about your project..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
            data-testid="description-textarea"
          />
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="terms" className="rounded focus:ring-2 focus:ring-cyan-500" />
            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
              I agree to the terms and conditions
            </label>
          </div>
        </div>
      )
    },
    {
      id: 'nested-structure',
      title: 'Complex Nested Structure',
      description: 'Multi-level nested elements for testing hierarchy inspection',
      content: (
        <div className="border-2 border-purple-300 p-4 rounded-lg bg-purple-50" data-level="parent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-purple-700 font-semibold flex items-center">
              <Layers className="w-4 h-4 mr-2" />
              Parent Container
            </span>
            <Badge variant="outline" className="border-purple-400 text-purple-600">Level 1</Badge>
          </div>
          <div className="bg-white p-3 rounded border shadow-sm" data-level="child">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Child Element
              </span>
              <Badge variant="secondary">Level 2</Badge>
            </div>
            <div className="bg-gray-100 p-2 rounded border" data-level="grandchild">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm flex items-center">
                  <Code className="w-3 h-3 mr-1" />
                  Grandchild Element
                </span>
                <Badge variant="outline" className="text-xs">Level 3</Badge>
              </div>
              <div className="mt-2 bg-white p-1 rounded text-xs border" data-level="great-grandchild">
                <span className="text-gray-500">Great-grandchild (Level 4)</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'styled-components',
      title: 'Styled Components',
      description: 'Elements with various CSS properties and visual effects',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="bg-gradient-to-br from-pink-400 to-red-500 p-4 rounded-lg text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setActiveSection('gradient')}
            data-component="gradient-box"
          >
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Gradient Box
            </div>
          </div>
          <div 
            className="border-4 border-dashed border-green-400 p-4 rounded-lg text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
            data-component="dashed-border"
          >
            <div className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Dashed Border
            </div>
          </div>
          <div 
            className="shadow-lg bg-white p-4 rounded-lg hover:shadow-2xl transition-shadow transform hover:scale-105 cursor-pointer"
            data-component="shadow-element"
          >
            <div className="flex items-center text-gray-700">
              <Pin className="w-5 h-5 mr-2" />
              Shadow Element
            </div>
          </div>
          <div 
            className="bg-yellow-200 p-4 rounded-lg transform rotate-3 hover:rotate-6 transition-transform cursor-pointer border-2 border-yellow-400"
            data-component="rotated-element"
          >
            <div className="flex items-center text-yellow-800">
              <Settings className="w-5 h-5 mr-2" />
              Rotated Element
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'interactive-cards',
      title: 'Interactive Cards',
      description: 'Hover-sensitive cards with complex interactions',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Frontend', icon: Code, color: 'blue' },
            { title: 'Backend', icon: Database, color: 'green' },
            { title: 'Design', icon: Eye, color: 'purple' }
          ].map((card, index) => (
            <Card 
              key={index}
              className={`p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-${card.color}-400 group`}
              onClick={() => setActiveSection(card.title.toLowerCase())}
              data-card={card.title.toLowerCase()}
            >
              <div className={`flex items-center space-x-3 text-${card.color}-600 group-hover:text-${card.color}-700`}>
                <card.icon className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">{card.title}</h3>
                  <p className="text-sm text-gray-500">Click to interact</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )
    }
  ];

  const workflowTips = [
    {
      icon: <MousePointer className="w-4 h-4" />,
      title: "Press 'S' to start LogTrace capture mode",
      shortcut: "S"
    },
    {
      icon: <Eye className="w-4 h-4" />,
      title: "Press 'D' to freeze hover details at cursor position",
      shortcut: "D"
    },
    {
      icon: <Pin className="w-4 h-4" />,
      title: "Click elements to open detailed inspector panel",
      shortcut: "Click"
    },
    {
      icon: <Brain className="w-4 h-4" />,
      title: "Use 'Ctrl+D' for instant AI debugging analysis",
      shortcut: "Ctrl+D"
    },
    {
      icon: <Terminal className="w-4 h-4" />,
      title: "Press 'T' to toggle terminal for event logs",
      shortcut: "T"
    },
    {
      icon: <Settings className="w-4 h-4" />,
      title: "Right-click for quick actions menu",
      shortcut: "Right-click"
    }
  ];

  const advancedFeatures = [
    {
      icon: <Eye className="w-4 h-4" />,
      title: "Real-time element highlighting with live CSS inspection",
      description: "See computed styles, dimensions, and layout properties"
    },
    {
      icon: <Brain className="w-4 h-4" />,
      title: "AI-powered debugging and suggestions", 
      description: "Get insights on CSS issues, accessibility, and UX improvements"
    },
    {
      icon: <Terminal className="w-4 h-4" />,
      title: "Comprehensive event logging and export",
      description: "Track all interactions and export for detailed analysis"
    },
    {
      icon: <Code className="w-4 h-4" />,
      title: "Element hierarchy and relationship mapping",
      description: "Understand parent-child relationships and DOM structure"
    }
  ];

  // Show active section feedback
  useEffect(() => {
    if (activeSection) {
      const timer = setTimeout(() => setActiveSection(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeSection]);

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

      {/* Active Section Indicator */}
      {activeSection && (
        <div className="fixed top-20 right-4 z-40 bg-cyan-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="font-medium">Interacted with: {activeSection}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Start Instructions */}
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
                <span className="text-slate-300">Start LogTrace capture</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">D</Badge>
                <span className="text-slate-300">Freeze hover details</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">Ctrl+D</Badge>
                <span className="text-slate-300">AI debug analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-xs">T</Badge>
                <span className="text-slate-300">Toggle terminal</span>
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
              {workflowTips.slice(0, 4).map((tip, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-green-400">{tip.icon}</div>
                    <span className="text-slate-300 text-xs">{tip.title}</span>
                  </div>
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                    {tip.shortcut}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Advanced Features */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-purple-400">AI Debugging</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-slate-300">
                • Press Ctrl+D for instant analysis
              </div>
              <div className="text-slate-300">
                • Get CSS & accessibility insights
              </div>
              <div className="text-slate-300">
                • Export detailed event logs
              </div>
              <div className="text-slate-300">
                • Real-time element inspection
              </div>
            </div>
          </Card>
        </div>

        {/* Advanced Features Section */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-cyan-400">Advanced LogTrace Features</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advancedFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-cyan-400 mt-1">{feature.icon}</div>
                <div>
                  <h3 className="font-medium text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Demo Elements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {demoContent.map((demo) => (
            <Card key={demo.id} className="bg-slate-800 border-slate-700 p-6 hover:border-slate-600 transition-colors">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">{demo.title}</h3>  
                <p className="text-sm text-slate-400">{demo.description}</p>
              </div>
              <div className="min-h-[120px] flex items-center justify-center">
                {demo.content}
              </div>
            </Card>
          ))}
        </div>

        {/* Instructions Footer */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            How to Use LogTrace on This Demo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div>
              <h4 className="font-medium text-cyan-400 mb-3">Basic Usage:</h4>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Press <kbd className="bg-slate-700 px-2 py-1 rounded text-xs">S</kbd> to activate LogTrace capture mode</li>
                <li>Move your mouse over any element above to see live details</li>
                <li>Click elements to open the detailed inspector panel</li>
                <li>Press <kbd className="bg-slate-700 px-2 py-1 rounded text-xs">Ctrl+D</kbd> while hovering to debug with AI</li>
                <li>Press <kbd className="bg-slate-700 px-2 py-1 rounded text-xs">T</kbd> to open the terminal for event logs</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-green-400 mb-3">Advanced Features:</h4>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Press <kbd className="bg-slate-700 px-2 py-1 rounded text-xs">D</kbd> to freeze hover details at cursor</li>
                <li>Right-click for quick actions (screenshot, context, debug)</li>
                <li>Use the inspector to view computed styles and attributes</li>
                <li>Export event logs for detailed debugging analysis</li>
                <li>Press <kbd className="bg-slate-700 px-2 py-1 rounded text-xs">Esc</kbd> to exit any mode</li>
              </ol>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-cyan-400">Pro Tip</span>
            </div>
            <p className="text-sm text-slate-300">
              Try interacting with the nested structure elements to see how LogTrace handles complex DOM hierarchies. 
              Use the AI debugging feature (Ctrl+D) to get insights on CSS layouts, accessibility issues, and UX improvements.
            </p>
          </div>
        </Card>
      </div>

      {/* LogTrace Overlay - This enables all the mouse tracking and inspection */}
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
