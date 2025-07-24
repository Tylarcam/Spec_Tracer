
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Landing from "./pages/Landing";
import InteractiveDemo from "./pages/InteractiveDemo";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import ContextTransform from "./pages/ContextTransform";
import Upgrade from "./pages/Upgrade";
import NotFound from "./pages/NotFound";
import NavBar from './components/NavBar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a context for tracing state management
const TracingContext = React.createContext<{
  tracingActive: boolean;
  setTracingActive: (active: boolean) => void;
  isHoverEnabled: boolean;
  setIsHoverEnabled: (enabled: boolean) => void;
  eventCount: number;
  setEventCount: (count: number) => void;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
}>({
  tracingActive: false,
  setTracingActive: () => {},
  isHoverEnabled: true,
  setIsHoverEnabled: () => {},
  eventCount: 0,
  setEventCount: () => {},
  showTerminal: false,
  setShowTerminal: () => {},
});

export const useTracingContext = () => React.useContext(TracingContext);

const AppRoutes = () => {
  console.log('AppRoutes component rendering...');
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === "/";
  const isDebugPage = location.pathname === "/debug";
  const [tracingActive, setTracingActive] = useState(false);
  const [isHoverEnabled, setIsHoverEnabled] = useState(true);
  const [eventCount, setEventCount] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);

  console.log('AppRoutes - Current path:', location.pathname, 'isDebugPage:', isDebugPage, 'isLanding:', isLanding);

  return (
    <TracingContext.Provider value={{ 
      tracingActive, 
      setTracingActive,
      isHoverEnabled,
      setIsHoverEnabled,
      eventCount,
      setEventCount,
      showTerminal,
      setShowTerminal
    }}>
      {!isLanding && (
        <ErrorBoundary>
          <NavBar 
            isTracing={isDebugPage ? tracingActive : false}
            onToggleTracing={isDebugPage ? () => setTracingActive(!tracingActive) : () => {}}
            isHoverEnabled={isDebugPage ? isHoverEnabled : true}
            onToggleHover={isDebugPage ? () => setIsHoverEnabled(!isHoverEnabled) : () => {}}
            eventCount={isDebugPage ? eventCount : 0}
            onOpenSettings={() => {}} // Settings now handled by drawer in NavBar
            onToggleTerminal={isDebugPage ? () => setShowTerminal(!showTerminal) : () => {}}
            showTerminal={isDebugPage ? showTerminal : false}
          />
        </ErrorBoundary>
      )}
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/interactive-demo" element={<InteractiveDemo />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/debug" element={<Index />} />
          <Route path="/context-transform" element={<ContextTransform />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </TracingContext.Provider>
  );
};

const App = () => {
  console.log('App component rendering...');
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
