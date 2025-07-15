import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Copy, Sparkles, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';
import { transformContextRequest } from '@/shared/api';
import { useToast } from '@/hooks/use-toast';

const ContextTransformTester: React.FC = () => {
  const [rawRequest, setRawRequest] = useState('');
  const [transformedPrompt, setTransformedPrompt] = useState('');
  const [isTransforming, setIsTransforming] = useState(false);
  const [currentExample, setCurrentExample] = useState(0);
  const [useMockMode, setUseMockMode] = useState(false);
  const { toast } = useToast();

  const examples = [
    "Make the inspector panel draggable",
    "Add authentication to my app",
    "Create a new modal component",
    "Build an API endpoint for user data",
    "I want a simple way to upload files",
    "Need to position the tooltip correctly",
    "Add a database table for orders",
    "Fix the hover effect on buttons"
  ];

  // Mock transformation for testing without backend
  const mockTransformation = (request: string): string => {
    const isDragRequest = /drag|move|position/i.test(request);
    const isAuthRequest = /auth|login|user/i.test(request);
    const isComponentRequest = /component|ui|modal|panel|button/i.test(request);
    
    let context = "Explore current codebase patterns first before adding anything new";
    let questions = [
      "Should I explore your existing patterns before implementing?",
      "Do you have existing functionality I should build on?",
      "What's your preference: simple solution or external libraries?"
    ];
    let preferences = [
      "Build incrementally on what's already working",
      "Avoid external dependencies unless absolutely necessary",
      "Test simple solutions before considering complex ones"
    ];

    if (isDragRequest) {
      context = "We likely have existing positioning and mouse tracking systems in place (LogTrace has comprehensive mouse event handling)";
      questions = [
        "Should I explore your existing positioning/drag functionality before implementing?",
        "Do you have existing mouse event systems I should build on?",
        "What's your preference: simple CSS positioning or external drag libraries?"
      ];
      preferences = [
        "Build incrementally on existing mouse/positioning systems",
        "Avoid external drag libraries unless absolutely necessary",
        "Test simple solutions before considering complex ones"
      ];
    } else if (isAuthRequest) {
      context = "We likely have existing user management and session patterns";
      questions = [
        "Do you have existing user management or auth patterns I should build on?",
        "What's your preference: simple session-based auth or external OAuth libraries?",
        "Should I explore your current backend structure before implementing?"
      ];
      preferences = [
        "Build incrementally on existing user/session systems",
        "Avoid external auth libraries unless absolutely necessary",
        "Test simple authentication before adding complexity"
      ];
    } else if (isComponentRequest) {
      context = "We likely have existing component patterns and design systems";
      questions = [
        "Do you have existing component patterns I should follow?",
        "Should I check your current UI component library before creating new ones?",
        "What's your preference: extend existing components or create new ones?"
      ];
      preferences = [
        "Build on existing component patterns and design system",
        "Avoid creating duplicate components",
        "Test component integration with existing UI first"
      ];
    }

    return `${request}.

IMPORTANT CONTEXT:
- Keep it simple - prefer existing solutions over external dependencies
- ${context}
- I prefer building on existing functionality rather than introducing complexity

QUESTIONS FOR YOU TO ASK FIRST:
1. "${questions[0]}"
2. "${questions[1]}"
3. "${questions[2]}"

IMPLEMENTATION PREFERENCE:
- ${preferences[0]}
- ${preferences[1]}
- ${preferences[2]}`;
  };

  const handleTransform = async () => {
    if (!rawRequest.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter a request to transform',
        variant: 'destructive'
      });
      return;
    }

    setIsTransforming(true);
    
    try {
      if (useMockMode) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockResult = mockTransformation(rawRequest);
        setTransformedPrompt(mockResult);
        
        toast({
          title: 'Transformation Complete (Demo Mode)',
          description: 'Your request has been enhanced with context engineering',
        });
      } else {
        const result = await transformContextRequest(rawRequest);
        setTransformedPrompt(result.transformedPrompt);
        
        toast({
          title: 'Transformation Complete',
          description: 'Your request has been enhanced with context engineering',
        });
      }
    } catch (error) {
      console.error('Transform error:', error);
      
      // Fallback to mock mode if API fails
      if (!useMockMode) {
        toast({
          title: 'API Unavailable - Using Demo Mode',
          description: 'Showing mock transformation. Deploy Supabase functions for full functionality.',
          variant: 'default'
        });
        setUseMockMode(true);
        const mockResult = mockTransformation(rawRequest);
        setTransformedPrompt(mockResult);
      } else {
        toast({
          title: 'Transformation Failed',
          description: error instanceof Error ? error.message : 'Failed to transform request',
          variant: 'destructive'
        });
      }
    } finally {
      setIsTransforming(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const loadExample = () => {
    setRawRequest(examples[currentExample]);
    setCurrentExample((prev) => (prev + 1) % examples.length);
  };

  const reset = () => {
    setRawRequest('');
    setTransformedPrompt('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Context Engineering Transformer</h1>
        </div>
        <p className="text-gray-400">
          Transform raw requests into context-rich prompts that prevent over-engineering
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="border-purple-500/50 text-purple-400">
            LogTrace Context Engineering System
          </Badge>
          {useMockMode && (
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
              <AlertCircle className="w-3 h-3 mr-1" />
              Demo Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Demo Mode Notice */}
      {useMockMode && (
        <Card className="bg-yellow-900/20 border-yellow-500/50">
          <div className="p-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Demo Mode Active</span>
            </div>
            <p className="text-sm text-yellow-300">
              You're seeing a mock transformation. For full functionality, deploy the Supabase context-transform function.
            </p>
          </div>
        </Card>
      )}

      {/* Input Section */}
      <Card className="bg-slate-900/95 border-cyan-500/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-cyan-400">Raw Request</span>
              <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                Before
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadExample}
                size="sm"
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                Load Example
              </Button>
              <Button
                onClick={reset}
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
          
          <Textarea
            value={rawRequest}
            onChange={(e) => setRawRequest(e.target.value)}
            placeholder="Enter your raw coding request here... (e.g., 'Make the panel draggable')"
            className="min-h-[120px] bg-slate-800/50 border-cyan-500/30 text-white resize-none"
            maxLength={1000}
          />
          
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              {rawRequest.length}/1000 characters
            </span>
            <Button
              onClick={handleTransform}
              disabled={isTransforming || !rawRequest.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isTransforming ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Transforming...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Transform with Context Engineering
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Output Section */}
      {transformedPrompt && (
        <Card className="bg-slate-900/95 border-green-500/50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-green-400">Enhanced Prompt</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  After
                </Badge>
              </div>
              <Button
                onClick={() => copyToClipboard(transformedPrompt)}
                size="sm"
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy Enhanced Prompt
              </Button>
            </div>
            
            <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
                {transformedPrompt}
              </pre>
            </div>
            
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="text-sm text-green-400 font-medium mb-1">
                ✅ Context Engineering Applied
              </div>
              <div className="text-xs text-green-300 space-y-1">
                <div>• Complexity preference guidance added</div>
                <div>• Domain-specific questions included</div>
                <div>• Anti-pattern prevention activated</div>
                <div>• Implementation preferences specified</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-slate-900/95 border-yellow-500/50">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3">
            💡 How to Use Your Enhanced Prompt
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div>1. <strong>Copy the enhanced prompt</strong> above</div>
            <div>2. <strong>Feed it to your AI coding assistant</strong> (Claude, ChatGPT, Cursor, etc.)</div>
            <div>3. <strong>Get better results</strong> with proper context and guidance</div>
            <div className="pt-2 text-yellow-400">
              The enhanced prompt includes complexity preferences, exploration questions, and anti-pattern prevention to help AI assistants give you optimal solutions on the first try.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContextTransformTester; 