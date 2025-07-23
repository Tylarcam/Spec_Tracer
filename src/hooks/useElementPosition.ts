
import { useState } from 'react';
import { ElementInfo } from '@/shared/types';

export const useElementPosition = () => {
  const [elementInfo, setElementInfo] = useState<ElementInfo | null>(null);

  const setElement = (element: ElementInfo) => {
    setElementInfo(element);
  };

  return {
    elementInfo,
    setElement,
  };
};
