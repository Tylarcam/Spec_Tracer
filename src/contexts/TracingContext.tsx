
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TracingContextType {
  isTracing: boolean;
  setIsTracing: (value: boolean) => void;
  isHoverEnabled: boolean;
  setIsHoverEnabled: (value: boolean) => void;
  eventCount: number;
  setEventCount: (value: number) => void;
}

const TracingContext = createContext<TracingContextType | undefined>(undefined);

export const TracingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTracing, setIsTracing] = useState(false);
  const [isHoverEnabled, setIsHoverEnabled] = useState(true);
  const [eventCount, setEventCount] = useState(0);

  return (
    <TracingContext.Provider value={{
      isTracing,
      setIsTracing,
      isHoverEnabled,
      setIsHoverEnabled,
      eventCount,
      setEventCount,
    }}>
      {children}
    </TracingContext.Provider>
  );
};

export const useTracingContext = () => {
  const context = useContext(TracingContext);
  if (context === undefined) {
    throw new Error('useTracingContext must be used within a TracingProvider');
  }
  return context;
};
