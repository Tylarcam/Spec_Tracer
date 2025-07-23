
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
import Settings from "./pages/Settings";
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
}>({
  tracingActive: false,
  setTracingActive: () => {},
});

export const useTracingContext = () => React.useContext(TracingContext);

const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === "/";
  const isDebugPage = location.pathname === "/debug";
  const [tracingActive, setTracingActive] = useState(false);
  const [isHoverEnabled, setIsHoverEnabled] = useState(true);
  const [eventCount, setEventCount] = useState(0);

  return (
    <TracingContext.Provider value={{ tracingActive, setTracingActive }}>
      {!isLanding && (
        <NavBar 
          tracingActive={isDebugPage ? tracingActive : undefined}
          onTracingToggle={isDebugPage ? () => setTracingActive(!tracingActive) : undefined}
          isHoverEnabled={isDebugPage ? isHoverEnabled : undefined}
          onToggleHover={isDebugPage ? () => setIsHoverEnabled(!isHoverEnabled) : undefined}
          eventCount={isDebugPage ? eventCount : undefined}
          onOpenSettings={isDebugPage ? () => navigate('/settings') : undefined}
        />
      )}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/interactive-demo" element={<InteractiveDemo />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/debug" element={<Index />} />
        <Route path="/context-transform" element={<ContextTransform />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TracingContext.Provider>
  );
};

const App = () => (
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

export default App;
