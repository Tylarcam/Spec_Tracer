
import React, { useState, useEffect } from 'react';
import { MousePointer2, X } from 'lucide-react';

interface FloatingHintProps {
  isActive: boolean;
  currentElement: any;
}

const FloatingHint: React.FC<FloatingHintProps> = ({ isActive, currentElement }) => {
  const [dismissed, setDismissed] = useState(false);
  const [showElementHint, setShowElementHint] = useState(false);

  useEffect(() => {
    // Show element-specific hint when hovering over an element
    if (currentElement && isActive) {
      setShowElementHint(true);
      const timer = setTimeout(() => setShowElementHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentElement, isActive]);

  useEffect(() => {
    // Reset dismissed state when LogTrace becomes active
    if (isActive) {
      setDismissed(false);
    }
  }, [isActive]);

  if (dismissed || !isActive) return null;

  return (
    <>
      {/* Main hint - always visible when active */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900/95 border border-cyan-500/30 rounded-lg px-4 py-2 shadow-lg backdrop-blur-sm animate-fade-in">
        <div className="flex items-center gap-2">
          <MousePointer2 className="h-4 w-4 text-cyan-400" />
          <span className="text-cyan-300 text-sm font-medium">Right-click anywhere for actions</span>
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 p-1 hover:bg-slate-700 rounded"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Element-specific hint */}
      {showElementHint && currentElement && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-green-900/95 border border-green-500/30 rounded-lg px-4 py-2 shadow-lg backdrop-blur-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-sm font-medium">
              Element detected: {currentElement.tag}
              {currentElement.id && `#${currentElement.id}`}
              {currentElement.classes.length > 0 && `.${currentElement.classes[0]}`}
            </span>
          </div>
          <div className="text-xs text-green-200 mt-1">
            Right-click for element actions
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingHint;
