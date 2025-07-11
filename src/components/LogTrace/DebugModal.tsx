
import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { ElementInfo } from '@/shared/types';
import { sanitizeText } from '@/utils/sanitization';
import { useToast } from '@/hooks/use-toast';

interface DebugModalProps {
  showDebugModal: boolean;
  setShowDebugModal: (show: boolean) => void;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  isAnalyzing: boolean;
  analyzeWithAI: (prompt: string) => Promise<void>;
  generateAdvancedPrompt: () => string;
  modalRef: React.RefObject<HTMLDivElement>;
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
}) => {
  const [quickPrompt, setQuickPrompt] = useState('Why did this happen?');
  const [advancedPrompt, setAdvancedPrompt] = useState('');
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!showDebugModal) return null;

  const handleDebugSubmit = async (prompt: string) => {
    if (!prompt.trim()) {
      toast({
        title: 'Invalid Prompt',
        description: 'Please enter a valid prompt before debugging.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setErrorMessage(null);
      await analyzeWithAI(prompt);
    } catch (error: any) {
      console.error('Debug analyze error:', error);
      const msg = error?.message || 'Error getting AI response';
      setErrorMessage(msg);
      toast({
        title: 'Debugging Failed',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card 
        id="logtrace-modal"
        ref={modalRef}
        className="bg-slate-900/95 border-cyan-500/50 w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-cyan-400">Debug Assistant</h3>
            <Button 
              onClick={() => setShowDebugModal(false)}
              variant="ghost" 
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>

          {currentElement && (
            <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-green-500/30">
              <h4 className="text-green-400 font-semibold mb-2">Element Context</h4>
              <div className="text-sm text-green-300">
                <div><strong>Tag:</strong> {currentElement.tag}</div>
                {currentElement.id && <div><strong>ID:</strong> {sanitizeText(currentElement.id)}</div>}
                {currentElement.classes.length > 0 && (
                  <div><strong>Classes:</strong> {currentElement.classes.map(c => sanitizeText(c)).join(', ')}</div>
                )}
                <div><strong>Position:</strong> x:{mousePosition.x}, y:{mousePosition.y}</div>
                {currentElement.text && (
                  <div><strong>Text:</strong> "{sanitizeText(currentElement.text)}"</div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-cyan-400 font-semibold mb-2">Quick Debug</label>
              <div className="flex gap-2">
                <Input
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  className="bg-slate-800 border-green-500/30 text-green-400"
                  placeholder="Quick debugging question..."
                  maxLength={500}
                />
                <Button 
                  onClick={() => handleDebugSubmit(quickPrompt)}
                  disabled={isAnalyzing || !quickPrompt.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Debug'}
                </Button>
              </div>
            </div>

            <Separator className="bg-green-500/30" />

            <div>
              <label className="block text-cyan-400 font-semibold mb-2">Advanced Debug</label>
              <Textarea
                value={advancedPrompt || generateAdvancedPrompt()}
                onChange={(e) => setAdvancedPrompt(e.target.value)}
                className="bg-slate-800 border-green-500/30 text-green-400 min-h-32"
                placeholder="Detailed debugging prompt..."
                maxLength={2000}
              />
              <Button 
                onClick={() => handleDebugSubmit(advancedPrompt || generateAdvancedPrompt())}
                disabled={isAnalyzing}
                className="bg-cyan-600 hover:bg-cyan-700 text-white mt-2"
              >
                {isAnalyzing ? 'Analyzing...' : 'Advanced Debug'}
              </Button>
            </div>
          </div>
          {errorMessage && (
            <div className="mt-4 bg-red-800/60 text-red-200 p-3 rounded animate-pulse">
              {errorMessage}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DebugModal;
