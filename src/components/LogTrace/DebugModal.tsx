
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { callAIDebugFunction } from '@/shared/api';
import { ElementInfo } from '@/shared/types';

interface DebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  onDebugResponse: (response: string) => void;
}

const DebugModal: React.FC<DebugModalProps> = ({
  isOpen,
  onClose,
  currentElement,
  mousePosition,
  onDebugResponse,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

    setIsAnalyzing(true);
    
    try {
      console.log('Sending debug request:', { prompt, currentElement, mousePosition });
      
      const response = await callAIDebugFunction(prompt, currentElement, mousePosition);
      
      console.log('Debug response received:', response);
      
      onDebugResponse(response);
      
      toast({
        title: 'Success',
        description: 'Debug analysis completed',
      });
      
      onClose();
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
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const generateAdvancedPrompt = () => {
    if (!currentElement) return '';
    
    const element = currentElement.element;
    const styles = window.getComputedStyle(element);
    const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(currentElement.tag) || 
                         element.onclick !== null || 
                         styles.cursor === 'pointer';

    return `Debug this element in detail:

Element: <${currentElement.tag}${currentElement.id ? ` id="${currentElement.id}"` : ''}${currentElement.classes.length ? ` class="${currentElement.classes.join(' ')}"` : ''}>
Text: "${currentElement.text}"
Position: x:${mousePosition.x}, y:${mousePosition.y}
Interactive: ${isInteractive ? 'Yes' : 'No'}
Cursor: ${styles.cursor}
Display: ${styles.display}
Visibility: ${styles.visibility}
Pointer Events: ${styles.pointerEvents}

Consider:
1. Why might this element not be behaving as expected?
2. Are there any CSS properties preventing interaction?
3. Are there any event listeners that might be interfering?
4. What accessibility concerns might exist?
5. How could the user experience be improved?

Provide specific, actionable debugging steps and potential solutions.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-green-500/50">
        <DialogHeader>
          <DialogTitle className="text-green-400">AI Debug Assistant</DialogTitle>
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
              <Button
                onClick={() => setPrompt(generateAdvancedPrompt())}
                size="sm"
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                Generate Prompt
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
              onClick={onClose}
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
