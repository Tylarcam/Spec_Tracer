
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TracingProvider } from "@/contexts/TracingContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";
import NotFound from "./pages/NotFound";
import ContextTransform from "./pages/ContextTransform";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <TracingProvider>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/debug" element={<Index />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/upgrade" element={<Upgrade />} />
                  <Route path="/context-transform" element={<ContextTransform />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </TracingProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
