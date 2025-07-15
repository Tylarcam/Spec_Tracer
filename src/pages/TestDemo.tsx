
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Crown, Brain, Settings } from 'lucide-react';
import LogTrace from '@/components/LogTrace';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';
import { useAuth } from '@/contexts/AuthContext';
import UpgradeModal from '@/components/LogTrace/UpgradeModal';

// Import refactored components
import { DemoSection } from '@/components/TestDemo/DemoSection';
import { InteractiveButtons } from '@/components/TestDemo/InteractiveButtons';
import { FormElements } from '@/components/TestDemo/FormElements';
import { NestedStructure } from '@/components/TestDemo/NestedStructure';
import { StyledComponents } from '@/components/TestDemo/StyledComponents';
import { InteractiveCards } from '@/components/TestDemo/InteractiveCards';
import { QuickStartCards } from '@/components/TestDemo/QuickStartCards';
import { ActiveSectionIndicator } from '@/components/TestDemo/ActiveSectionIndicator';

const TestDemo: React.FC = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { creditsStatus } = useCreditsSystem();

  const remainingCredits = creditsStatus?.creditsRemaining || 0;
  const totalCredits = creditsStatus?.creditsLimit || 5;
  const isPremium = creditsStatus?.isPremium || false;

  // Show active section feedback
  useEffect(() => {
    if (activeSection) {
      const timer = setTimeout(() => setActiveSection(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeSection]);

  const advancedFeatures = [
    {
      icon: <Brain className="w-4 h-4" />,
      title: "Real-time element highlighting with live CSS inspection",
      description: "See computed styles, dimensions, and layout properties"
    },
    {
      icon: <Brain className="w-4 h-4" />,
      title: "AI-powered debugging and suggestions", 
      description: "Get insights on CSS issues, accessibility, and UX improvements"
    },
    {
      icon: <Settings className="w-4 h-4" />,
      title: "Comprehensive event logging and export",
      description: "Track all interactions and export for detailed analysis"
    },
    {
      icon: <Settings className="w-4 h-4" />,
      title: "Element hierarchy and relationship mapping",
      description: "Understand parent-child relationships and DOM structure"
    }
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

      {/* Active Section Indicator */}
      <ActiveSectionIndicator activeSection={activeSection} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Start Instructions */}
        <QuickStartCards />

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
          <DemoSection
            id="interactive-buttons"
            title="Interactive Buttons"
            description="Various button types for testing element inspection and hover states"
          >
            <InteractiveButtons onInteraction={setActiveSection} />
          </DemoSection>

          <DemoSection
            id="form-elements"
            title="Form Elements"
            description="Complex form inputs with validation states and interactions"
          >
            <FormElements />
          </DemoSection>

          <DemoSection
            id="nested-structure"
            title="Complex Nested Structure"
            description="Multi-level nested elements for testing hierarchy inspection"
          >
            <NestedStructure />
          </DemoSection>

          <DemoSection
            id="styled-components"
            title="Styled Components"
            description="Elements with various CSS properties and visual effects"
          >
            <StyledComponents onInteraction={setActiveSection} />
          </DemoSection>

          <DemoSection
            id="interactive-cards"
            title="Interactive Cards"
            description="Hover-sensitive cards with complex interactions"
          >
            <InteractiveCards onInteraction={setActiveSection} />
          </DemoSection>
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
