
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
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setDismissed(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Dismiss when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-floating-hint]')) {
        setDismissed(true);
      }
    };

    if (isActive && !dismissed) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isActive, dismissed]);

  if (dismissed || !isActive) return null;

  // Check if mobile
  const isMobile = window.innerWidth <= 768;

  return (
    <>
      {/* Main hint - positioned lower on mobile */}
      <div 
        data-floating-hint
        className={`fixed left-1/2 transform -translate-x-1/2 z-40 bg-slate-900/95 border border-cyan-500/30 rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm animate-fade-in ${
          isMobile ? 'top-20' : 'top-4'
        }`}
        style={{
          maxWidth: isMobile ? 'calc(100vw - 32px)' : 'auto',
          width: isMobile ? 'calc(100vw - 32px)' : 'auto'
        }}
      >
        <div className="flex items-center gap-2">
          <MousePointer2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-cyan-400 flex-shrink-0`} />
          <span className={`text-cyan-300 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Right-click anywhere for actions
          </span>
          <button
            onClick={() => setDismissed(true)}
            className={`ml-2 p-1 hover:bg-slate-700 rounded flex-shrink-0 ${isMobile ? 'min-w-[24px] min-h-[24px]' : ''}`}
            aria-label="Dismiss hint"
          >
            <X className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'} text-gray-400`} />
          </button>
        </div>
      </div>

      {/* Element-specific hint */}
      {showElementHint && currentElement && (
        <div 
          data-floating-hint
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-green-900/95 border border-green-500/30 rounded-lg px-4 py-2 shadow-lg backdrop-blur-sm animate-fade-in"
          style={{
            maxWidth: isMobile ? 'calc(100vw - 32px)' : 'auto',
            width: isMobile ? 'calc(100vw - 32px)' : 'auto'
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
            <span className={`text-green-300 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Element detected: {currentElement.tag}
              {currentElement.id && `#${currentElement.id}`}
              {currentElement.classes.length > 0 && `.${currentElement.classes[0]}`}
            </span>
          </div>
          <div className={`text-green-200 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            Right-click for element actions
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingHint;
