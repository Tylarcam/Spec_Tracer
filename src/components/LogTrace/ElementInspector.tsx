
import React, { useState, useRef } from 'react';
import { ElementInfo } from '@/shared/types';
import { Button } from '../ui/button';
import { Zap, Pin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useDraggable } from '@/shared/hooks/useDraggable';
import DebugModal from './DebugModal';

interface ElementInspectorProps {
  isVisible: boolean;
  currentElement: ElementInfo | null;
  mousePosition: { x: number; y: number };
  onDebug?: () => void;
  onClose: () => void;
  panelRef: React.RefObject<HTMLDivElement>;
  isExtensionMode?: boolean;
  isDraggable?: boolean;
  isPinned?: boolean;
  onPin?: () => void;
  onShowMoreDetails?: () => void;
  currentDebugCount?: number;
  maxDebugCount?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ElementInspector: React.FC<ElementInspectorProps> = ({
  isVisible,
  currentElement,
  mousePosition,
  onDebug,
  onClose,
  panelRef,
  isExtensionMode = false,
  isDraggable = false,
  isPinned = false,
  onPin,
  onShowMoreDetails,
  currentDebugCount = 0,
  maxDebugCount = 3,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { toast } = useToast();
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { adjustedPosition } = useDraggable(panelRef, mousePosition, isDraggable);
  const [debugResponse, setDebugResponse] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleDebugClick = () => {
    if (currentDebugCount >= maxDebugCount) {
      toast({
        title: 'Debug Limit Reached',
        description: `You've reached the maximum of ${maxDebugCount} debug requests. Please upgrade for unlimited access.`,
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Debug button clicked:', { currentElement, mousePosition });
    setShowDebugModal(true);
  };

  const analyzeWithAI = async (prompt: string): Promise<string | null> => {
    setIsAnalyzing(true);
    try {
      // Mock AI analysis for now - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = `AI Analysis: Element appears to be a ${currentElement?.tag} with potential issues...`;
      setDebugResponse(response);
      return response;
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAdvancedPrompt = (element: ElementInfo | null): string => {
    if (!element) return '';
    
    const elementRef = element.element;
    const styles = window.getComputedStyle(elementRef);
    const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(element.tag) || 
                         elementRef.onclick !== null || 
                         styles.cursor === 'pointer';

    return `Debug this element in detail:

Element: <${element.tag}${element.id ? ` id="${element.id}"` : ''}${element.classes.length ? ` class="${element.classes.join(' ')}"` : ''}>
Text: "${element.text}"
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
    <>
      {isVisible && currentElement && (
        <div
          ref={panelRef}
          className={cn(
            "fixed z-[100] bg-slate-900/95 border border-green-500/50 rounded-lg p-4 shadow-lg min-w-[300px] max-w-[400px]",
            isDraggable && "cursor-move",
            isPinned && "border-blue-500/50"
          )}
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
            maxHeight: '80vh',
            overflow: 'auto'
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Element Inspector
          </h3>
          <div className="text-sm text-gray-300 space-y-1">
            <div><strong>Tag:</strong> {currentElement.tag}</div>
            {currentElement.id && <div><strong>ID:</strong> {currentElement.id}</div>}
            {currentElement.classes.length > 0 && (
              <div><strong>Classes:</strong> {currentElement.classes.join(', ')}</div>
            )}
            {currentElement.text && (
              <div><strong>Text:</strong> {currentElement.text.substring(0, 100)}...</div>
            )}
            {currentElement.size && (
              <div>
                <strong>Size:</strong> {currentElement.size.width}x{currentElement.size.height}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleDebugClick}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
              disabled={currentDebugCount >= maxDebugCount}
            >
              <Zap className="h-4 w-4 mr-2" />
              Debug ({currentDebugCount}/{maxDebugCount})
            </Button>
            
            {onPin && (
              <Button
                onClick={onPin}
                size="sm"
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                <Pin className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              onClick={onClose}
              size="sm"
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {debugResponse && (
            <div className="mt-4 p-3 bg-slate-800 rounded-lg border border-green-500/30">
              <h4 className="text-green-400 font-medium mb-2">Debug Response:</h4>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">
                {debugResponse}
              </div>
            </div>
          )}
        </div>
      )}
      
      <DebugModal
        showDebugModal={showDebugModal}
        setShowDebugModal={setShowDebugModal}
        currentElement={currentElement}
        mousePosition={mousePosition}
        isAnalyzing={isAnalyzing}
        analyzeWithAI={analyzeWithAI}
        generateAdvancedPrompt={generateAdvancedPrompt}
        modalRef={modalRef}
        isExtensionMode={isExtensionMode}
        showAuthModal={false}
        setShowAuthModal={() => {}}
        user={null}
        guestDebugCount={currentDebugCount}
        maxGuestDebugs={maxDebugCount}
        terminalHeight={400}
      />
    </>
  );
};

export default ElementInspector;
