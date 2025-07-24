
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { callAIDebugFunction } from '@/shared/api';
import { ElementInfo } from '@/shared/types';

interface DebugModalProps {
  // Props from LogTrace.tsx
  showDebugModal?: boolean;
  setShowDebugModal?: (show: boolean) => void;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  isAnalyzing?: boolean;
  analyzeWithAI?: (prompt: string) => Promise<string>;
  generateAdvancedPrompt?: () => string;
  modalRef?: React.RefObject<HTMLDivElement>;
  isExtensionMode?: boolean;
  showAuthModal?: boolean;
  setShowAuthModal?: (show: boolean) => void;
  user?: any;
  guestDebugCount?: number;
  maxGuestDebugs?: number;
  terminalHeight?: number;
  
  // Props from ElementInspector.tsx
  isOpen?: boolean;
  onClose?: () => void;
  onDebugResponse?: (response: string) => void;
}

const DebugModal: React.FC<DebugModalProps> = ({
  // LogTrace props
  showDebugModal,
  setShowDebugModal,
  currentElement,
  mousePosition,
  isAnalyzing = false,
  analyzeWithAI,
  generateAdvancedPrompt,
  modalRef,
  isExtensionMode = false,
  showAuthModal = false,
  setShowAuthModal,
  user = null,
  guestDebugCount = 0,
  maxGuestDebugs = 3,
  terminalHeight = 0,
  
  // ElementInspector props
  isOpen,
  onClose,
  onDebugResponse,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isAnalyzingLocal, setIsAnalyzingLocal] = useState(false);
  const { toast } = useToast();

  // Determine which props to use based on what's provided
  const isModalOpen = isOpen !== undefined ? isOpen : showDebugModal || false;
  const handleClose = onClose || (() => setShowDebugModal?.(false));
  const isCurrentlyAnalyzing = isAnalyzing || isAnalyzingLocal;

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a debug prompt',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzingLocal(true);
    try {
      console.log('Sending debug request:', { prompt, currentElement, mousePosition });
      
      let response: string;
      
      if (analyzeWithAI) {
        response = await analyzeWithAI(prompt);
      } else {
        response = await callAIDebugFunction(prompt, currentElement, mousePosition);
      }
      
      console.log('Debug response received:', response);
      
      if (onDebugResponse) {
        onDebugResponse(response);
      }
      
      toast({
        title: 'Success',
        description: 'Debug analysis completed',
      });
      
      handleClose();
      setPrompt('');
    } catch (error) {
      console.error('Debug API error:', error);
      
      let errorMessage = 'Failed to analyze element';
      
      if (error instanceof Error) {
        if (error.message.includes('No credits available')) {
          errorMessage = 'No credits available. Please upgrade to continue using AI debugging.';
        } else if (error.message.includes('Authentication required')) {
          errorMessage = 'Please sign in to use AI debugging features.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many requests. Please wait before trying again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Debug Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzingLocal(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleGeneratePrompt = () => {
    if (generateAdvancedPrompt) {
      const generatedPrompt = generateAdvancedPrompt();
      setPrompt(generatedPrompt);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent 
        ref={modalRef}
        className="sm:max-w-[500px] bg-slate-900 border-green-500/50"
        style={{ 
          marginBottom: terminalHeight ? `${terminalHeight}px` : '0px' 
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-green-400">Debug Assistant</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {currentElement && (
            <div className="bg-slate-800 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-green-400 mb-2">Element Context</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div><strong>Tag:</strong> {currentElement.tag}</div>
                {currentElement.id && <div><strong>ID:</strong> {currentElement.id}</div>}
                {currentElement.classes.length > 0 && (
                  <div><strong>Classes:</strong> {currentElement.classes.join(', ')}</div>
                )}
                {currentElement.text && (
                  <div><strong>Text:</strong> {currentElement.text.substring(0, 100)}...</div>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-green-400">
                What would you like to debug?
              </label>
              {generateAdvancedPrompt && (
                <Button
                  onClick={handleGeneratePrompt}
                  size="sm"
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                >
                  Generate Prompt
                </Button>
              )}
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="E.g., 'Why isn't this button clickable?', 'Check accessibility', 'Analyze layout issues'..."
              className="bg-slate-800 border-green-500/50 text-white placeholder-gray-400 min-h-[100px]"
              disabled={isCurrentlyAnalyzing}
            />
          </div>
          
          {!isExtensionMode && guestDebugCount > 0 && (
            <div className="text-sm text-gray-400">
              Debug count: {guestDebugCount}/{maxGuestDebugs}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isCurrentlyAnalyzing}
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCurrentlyAnalyzing || !prompt.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isCurrentlyAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Debug
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DebugModal;
