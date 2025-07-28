
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import PreLaunchLanding from "./pages/PreLaunchLanding";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";
import NotFound from "./pages/NotFound";
import ContextTransform from "./pages/ContextTransform";
import Debug from "./pages/Debug";
import InteractiveDemo from "./pages/InteractiveDemo";
import Support from "./pages/Support";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<PreLaunchLanding />} />
                <Route path="/full-launch" element={<Landing />} />
                <Route path="/debug" element={<Debug />} />
                <Route path="/interactive-demo" element={<InteractiveDemo />} />
                <Route path="/home" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/upgrade" element={<Upgrade />} />
                <Route path="/context-transform" element={<ContextTransform />} />
                <Route path="/support" element={<Support />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
