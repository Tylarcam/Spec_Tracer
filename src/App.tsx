
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import InteractiveDemo0 from "./pages/InteractiveDemo0";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  return (
    <>
      {!isLanding && <NavBar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/interactive-demo" element={<InteractiveDemo />} />
        <Route path="/interactive-demo-0" element={<InteractiveDemo0 />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/debug" element={<Index />} />
        <Route path="/context-transform" element={<ContextTransform />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
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
