
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ElementInfo } from '@/shared/types';

interface DebugModalProps {
  showDebugModal: boolean;
  setShowDebugModal: (show: boolean) => void;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  isAnalyzing: boolean;
  analyzeWithAI: (prompt: string) => Promise<string | null>;
  generateAdvancedPrompt: () => string;
  modalRef: React.RefObject<HTMLDivElement>;
  terminalHeight: number;
}

const DebugModal: React.FC<DebugModalProps> = ({
  showDebugModal,
  setShowDebugModal,
  currentElement,
  mousePosition,
  isAnalyzing,
  analyzeWithAI,
  generateAdvancedPrompt,
  modalRef,
  terminalHeight,
}) => {
  const [prompt, setPrompt] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a debug prompt',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Sending debug request:', { prompt, currentElement, mousePosition });
      
      const response = await analyzeWithAI(prompt);
      
      if (response) {
        console.log('Debug response received:', response);
        
        toast({
          title: 'Success',
          description: 'Debug analysis completed',
        });
        
        setShowDebugModal(false);
        setPrompt('');
      }
    } catch (error) {
      console.error('Debug modal error:', error);
      
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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleUseAdvancedPrompt = () => {
    const advancedPrompt = generateAdvancedPrompt();
    setPrompt(advancedPrompt);
  };

  return (
    <Dialog open={showDebugModal} onOpenChange={setShowDebugModal}>
      <DialogContent 
        ref={modalRef}
        className="sm:max-w-[500px] bg-slate-900 border-green-500/50"
        style={{ 
          marginBottom: terminalHeight ? `${terminalHeight + 20}px` : '0px' 
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-green-400">
                What would you like to debug?
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseAdvancedPrompt}
                className="border-green-500/50 text-green-400 hover:bg-green-500/10 text-xs"
              >
                Use Advanced Prompt
              </Button>
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="E.g., 'Why isn't this button clickable?', 'Check accessibility', 'Analyze layout issues'..."
              className="bg-slate-800 border-green-500/50 text-white placeholder-gray-400 min-h-[100px]"
              disabled={isAnalyzing}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDebugModal(false)}
              disabled={isAnalyzing}
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isAnalyzing || !prompt.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isAnalyzing ? (
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
