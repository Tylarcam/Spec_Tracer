
import { useState, useCallback } from 'react';
import { ElementInfo } from '../types';

export interface InspectorInstance {
  id: string;
  element: ElementInfo;
  position: { x: number; y: number };
  zIndex: number;
  createdAt: number;
}

export const useMultipleInspectors = () => {
  const [inspectors, setInspectors] = useState<InspectorInstance[]>([]);

  const addInspector = useCallback((element: ElementInfo, position: { x: number; y: number }) => {
    const newInspector: InspectorInstance = {
      id: crypto.randomUUID(),
      element,
      position: calculateStackPosition(inspectors, position),
      zIndex: 1000 + inspectors.length,
      createdAt: Date.now(),
    };

    setInspectors(prev => {
      // Check if same element is already open
      const existingIndex = prev.findIndex(inspector => 
        inspector.element.element === element.element
      );
      
      if (existingIndex !== -1) {
        // Bring existing inspector to front
        return prev.map((inspector, index) => 
          index === existingIndex 
            ? { ...inspector, zIndex: 1000 + prev.length }
            : inspector
        );
      }

      // Add new inspector, enforcing max 3 limit
      const newInspectors = [...prev, newInspector];
      if (newInspectors.length > 3) {
        // Remove oldest inspector
        const oldest = newInspectors.reduce((oldest, current) => 
          current.createdAt < oldest.createdAt ? current : oldest
        );
        return newInspectors.filter(inspector => inspector.id !== oldest.id);
      }
      
      return newInspectors;
    });
  }, [inspectors]);

  const removeInspector = useCallback((id: string) => {
    setInspectors(prev => prev.filter(inspector => inspector.id !== id));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setInspectors(prev => {
      const maxZ = Math.max(...prev.map(i => i.zIndex));
      return prev.map(inspector => 
        inspector.id === id 
          ? { ...inspector, zIndex: maxZ + 1 }
          : inspector
      );
    });
  }, []);

  const clearAllInspectors = useCallback(() => {
    setInspectors([]);
  }, []);

  return {
    inspectors,
    addInspector,
    removeInspector,
    bringToFront,
    clearAllInspectors,
  };
};

const calculateStackPosition = (
  existingInspectors: InspectorInstance[], 
  basePosition: { x: number; y: number }
): { x: number; y: number } => {
  const isMobile = window.innerWidth <= 768;
  const offset = isMobile ? 20 : 30;
  const inspectorCount = existingInspectors.length;
  
  if (isMobile) {
    // Mobile: stack vertically with small offset
    return {
      x: Math.max(8, Math.min(window.innerWidth - 350, basePosition.x + (inspectorCount * 10))),
      y: Math.max(8, Math.min(window.innerHeight - 400, basePosition.y + (inspectorCount * offset))),
    };
  } else {
    // Desktop: cascade diagonally
    return {
      x: Math.max(0, Math.min(window.innerWidth - 400, basePosition.x + (inspectorCount * offset))),
      y: Math.max(0, Math.min(window.innerHeight - 450, basePosition.y + (inspectorCount * offset))),
    };
  }
};
