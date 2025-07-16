
# LogTrace Interactive Demo - Complete Rebuild Guide

## Overview
This document contains all the code, configurations, and implementation details needed to rebuild the exact LogTrace interactive demo functionality. The system provides iframe-based website debugging with AI-powered element inspection.

## Project Setup

### package.json
```json
{
  "name": "logtrace-demo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@supabase/supabase-js": "^2.39.3",
    "@tanstack/react-query": "^4.36.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "html2canvas": "^1.4.1",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1",
    "sonner": "^1.4.3",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Styling Configuration

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --radius: 0.5rem;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;

    --sidebar-background: 222.2 84% 4.9%;
    --sidebar-foreground: 210 40% 98%;
    --sidebar-primary: 210 40% 98%;
    --sidebar-primary-foreground: 222.2 84% 4.9%;
    --sidebar-accent: 217.2 32.6% 17.5%;
    --sidebar-accent-foreground: 210 40% 98%;
    --sidebar-border: 217.2 32.6% 17.5%;
    --sidebar-ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Main Application Structure

### src/App.tsx
```typescript
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GestureProvider } from "@/shared/gestureManager";
import ErrorBoundary from "./components/ErrorBoundary";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import ContextTransform from "./pages/ContextTransform";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GestureProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/debug" element={<Index />} />
                <Route path="/context-transform" element={<ContextTransform />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </GestureProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
```

### src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## Debug Entry Point

### src/pages/Index.tsx
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import IframeDemoBar from '@/components/IframeDemoBar';
import LogTrace from '@/components/LogTrace';
import { useToast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const siteUrl = params.get('site');
  const [iframeError, setIframeError] = useState(false);
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (siteUrl && iframeError) {
      toast({
        title: 'Site Blocked Embedding',
        description: 'This website prevents embedding in iframes. Try another URL.',
        variant: 'destructive',
      });
    }
  }, [siteUrl, iframeError, toast]);

  const handleIframeError = () => {
    setIframeError(true);
  };

  const handleIframeLoad = () => {
    setIframeError(false);
  };

  // If no site URL, show the search interface
  if (!siteUrl) {
    return <IframeDemoBar />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Main content area with iframe */}
      <div className="relative">
        <iframe
          ref={iframeRef}
          src={siteUrl}
          className="w-full h-screen border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onError={handleIframeError}
          onLoad={handleIframeLoad}
          title="Demo Website"
        />
        {iframeError && (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <div className="text-center text-slate-300">
              <h3 className="text-lg font-semibold mb-2">Unable to load website</h3>
              <p className="text-sm">This site may block embedding. Try a different URL.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* LogTrace overlay with iframe integration */}
      <div className="absolute inset-0 pointer-events-none">
        <LogTrace iframeRef={iframeRef} />
      </div>
    </div>
  );
};

export default Index;
```

## Landing Interface with Iframe-Friendly Sites

### src/components/IframeDemoBar.tsx
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Code, Globe, Database, Zap } from 'lucide-react';

const IframeDemoBar: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  // Iframe-friendly websites that work well for demos
  const iframeFriendlySites = [
    {
      name: 'Example.com',
      url: 'https://example.com',
      description: 'Simple HTML example page',
      icon: Globe,
      category: 'Basic'
    },
    {
      name: 'HTTPBin',
      url: 'https://httpbin.org',
      description: 'HTTP request & response service',
      icon: Code,
      category: 'API'
    },
    {
      name: 'JSONPlaceholder',
      url: 'https://jsonplaceholder.typicode.com',
      description: 'Fake REST API for testing',
      icon: Database,
      category: 'API'
    },
    {
      name: 'HTTPStat.us',
      url: 'https://httpstat.us',
      description: 'HTTP status code service',
      icon: Zap,
      category: 'Testing'
    },
    {
      name: 'Postman Echo',
      url: 'https://postman-echo.com',
      description: 'Echo service for HTTP requests',
      icon: ExternalLink,
      category: 'API'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }
      navigate(`/debug?site=${encodeURIComponent(formattedUrl)}`);
    }
  };

  const handleSiteSelect = (siteUrl: string) => {
    navigate(`/debug?site=${encodeURIComponent(siteUrl)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              LogTrace
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Debug any website with AI-powered element inspection and analysis
          </p>
        </div>

        {/* URL Input */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex space-x-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="url"
                    placeholder="Enter website URL (e.g., https://example.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-cyan-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-medium px-8"
                >
                  Debug Site
                </Button>
              </div>
              <p className="text-sm text-slate-400">
                Note: Some websites may block iframe embedding. Try the suggested sites below for best results.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Iframe-Friendly Sites */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-200 text-center">
            Try These Iframe-Friendly Sites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {iframeFriendlySites.map((site) => {
              const IconComponent = site.icon;
              return (
                <Card 
                  key={site.url}
                  className="bg-slate-800/30 border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-all duration-200 hover:border-cyan-400/50"
                  onClick={() => handleSiteSelect(site.url)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-slate-200 truncate">{site.name}</h3>
                          <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                            {site.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">{site.description}</p>
                        <p className="text-xs text-cyan-400 mt-2 truncate">{site.url}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-slate-200">Element Inspection</h3>
            <p className="text-sm text-slate-400">
              Hover over any element to see detailed information and styling
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-slate-200">AI-Powered Debugging</h3>
            <p className="text-sm text-slate-400">
              Get intelligent suggestions for fixing layout and interaction issues
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
              <Code className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-slate-200">Real-time Analysis</h3>
            <p className="text-sm text-slate-400">
              See live CSS properties, event listeners, and computed styles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IframeDemoBar;
```

## Authentication System

### src/contexts/AuthContext.tsx
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGitHub: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: 'Sign Up Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Check your email',
        description: 'We sent you a confirmation link to complete your registration.'
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: 'Sign In Error',
        description: error.message,
        variant: 'destructive'
      });
    }

    return { error };
  };

  const signInWithGitHub = async () => {
    // Check if this is an extension authentication flow
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('return');
    const isExtensionAuth = returnUrl && returnUrl.includes('auth=extension');
    
    // Set redirect URL based on context
    const redirectTo = isExtensionAuth 
      ? `${window.location.origin}/auth?return=${returnUrl}`
      : `${window.location.origin}/`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo
      }
    });

    if (error) {
      toast({
        title: 'GitHub Sign In Error',
        description: error.message,
        variant: 'destructive'
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: 'Sign Out Error',
        description: error.message,
        variant: 'destructive'
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signInWithGitHub,
    signOut,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## Credits System

### src/hooks/useCreditsSystem.ts
```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreditsStatus {
  creditsRemaining: number;
  creditsLimit: number;
  resetTime: string;
  isPremium: boolean;
  waitlistBonusRemaining: number;
}

interface UseCreditsSystemReturn {
  creditsStatus: CreditsStatus | null;
  loading: boolean;
  error: string | null;
  canUseCredit: boolean;
  useCredit: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  grantWaitlistCredits: (email: string) => Promise<boolean>;
}

export const useCreditsSystem = (): UseCreditsSystemReturn => {
  const { user } = useAuth();
  const [creditsStatus, setCreditsStatus] = useState<CreditsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!user) {
      setCreditsStatus(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Call the database function to get user credits status
      const { data, error } = await supabase.rpc('get_user_credits_status', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error fetching credits status:', error);
        setError(error.message);
        return;
      }

      if (data && data.length > 0) {
        const statusData = data[0];
        setCreditsStatus({
          creditsRemaining: statusData.credits_remaining,
          creditsLimit: statusData.credits_limit,
          resetTime: statusData.reset_time,
          isPremium: statusData.is_premium,
          waitlistBonusRemaining: statusData.waitlist_bonus_remaining
        });
      }
    } catch (err: any) {
      console.error('Error fetching credits status:', err);
      setError(err.message || 'Failed to fetch credits status');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const useCredit = useCallback(async (): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('use_credit', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error using credit:', error);
        setError(error.message);
        return false;
      }

      // Refresh status after using credit
      await refreshStatus();
      
      return data || false;
    } catch (err: any) {
      console.error('Error using credit:', err);
      setError(err.message || 'Failed to use credit');
      return false;
    }
  }, [user, refreshStatus]);

  const grantWaitlistCredits = useCallback(async (email: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('grant_waitlist_credits', {
        user_uuid: user.id,
        user_email: email
      });

      if (error) {
        console.error('Error granting waitlist credits:', error);
        setError(error.message);
        return false;
      }

      // Refresh status after granting credits
      if (data) {
        await refreshStatus();
      }
      
      return data || false;
    } catch (err: any) {
      console.error('Error granting waitlist credits:', err);
      setError(err.message || 'Failed to grant waitlist credits');
      return false;
    }
  }, [user, refreshStatus]);

  // Load credits status on mount and when user changes
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Auto-grant waitlist credits on first login
  useEffect(() => {
    const grantCreditsOnFirstLogin = async () => {
      if (!user || !user.email) return;

      // Check if credits already granted by looking at localStorage flag
      const alreadyGranted = localStorage.getItem(`waitlist_credits_granted_${user.id}`);
      if (alreadyGranted) return;

      // Try to grant waitlist credits
      const granted = await grantWaitlistCredits(user.email);
      if (granted) {
        localStorage.setItem(`waitlist_credits_granted_${user.id}`, 'true');
      }
    };

    if (creditsStatus && !loading) {
      grantCreditsOnFirstLogin();
    }
  }, [user, creditsStatus, loading, grantWaitlistCredits]);

  const canUseCredit = creditsStatus ? creditsStatus.creditsRemaining > 0 : false;

  return {
    creditsStatus,
    loading,
    error,
    canUseCredit,
    useCredit,
    refreshStatus,
    grantWaitlistCredits
  };
};
```

## Shared Types

### src/shared/types.ts
```typescript
/**
 * Shared types for LogTrace
 */

export interface LogEvent {
  id: string;
  type: 'move' | 'click' | 'debug' | 'inspect' | 'llm_response';
  timestamp: string;
  position?: { x: number; y: number };
  element?: {
    tag: string;
    id: string;
    classes: string[];
    text: string;
    parentPath?: string;
    attributes?: { name: string; value: string }[];
    size?: { width: number; height: number };
  };
  prompt?: string;
  response?: string;
}

export interface ElementInfo {
  tag: string;
  id: string;
  classes: string[];
  text: string;
  element: HTMLElement;
  parentPath?: string; // DOM hierarchy path, e.g., 'form.checkout-form > div.flex > button.submit-btn'
  attributes?: { name: string; value: string }[];
  size?: { width: number; height: number };
}

export interface LogTraceSettings {
  apiKey?: string;
  autoSave: boolean;
  maxEvents: number;
  debugMode: boolean;
}

export interface DebugContext {
  element: ElementInfo | null;
  position: { x: number; y: number };
  events: LogEvent[];
  settings: LogTraceSettings;
}

export interface PinnedDetail {
  id: string;
  element: ElementInfo;
  position: { x: number; y: number };
  pinnedAt: { x: number; y: number };
}
```

## Iframe Communication System

### src/shared/iframeContentScript.ts
```typescript
/**
 * Content script that runs inside the iframe to capture events and communicate with parent
 */

interface IframeMessage {
  type: 'IFRAME_MOUSE_MOVE' | 'IFRAME_MOUSE_CLICK' | 'IFRAME_ELEMENT_INFO' | 'IFRAME_READY' | 'IFRAME_ACTIVATE' | 'IFRAME_DEACTIVATE';
  data?: any;
}

interface ElementInfo {
  tag: string;
  id: string;
  classes: string[];
  text: string;
  position: { x: number; y: number };
  rect: { left: number; top: number; width: number; height: number };
  attributes: { name: string; value: string }[];
  parentPath: string;
}

class IframeContentScript {
  private isActive = false;
  private currentElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;

  constructor() {
    this.setupMessageListener();
    this.setupEventListeners();
    this.notifyParentReady();
    this.createOverlay();
  }

  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'IFRAME_ACTIVATE') {
        this.isActive = true;
        this.showOverlay();
      } else if (event.data?.type === 'IFRAME_DEACTIVATE') {
        this.isActive = false;
        this.hideOverlay();
      }
    });
  }

  private setupEventListeners() {
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('click', this.handleClick.bind(this));
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.isActive) return;

    const target = e.target as HTMLElement;
    if (target && target !== this.overlayElement) {
      this.currentElement = target;
      this.highlightElement(target);
      
      const elementInfo = this.extractElementInfo(target, e);
      this.sendMessageToParent({
        type: 'IFRAME_MOUSE_MOVE',
        data: {
          position: { x: e.clientX, y: e.clientY },
          element: elementInfo
        }
      });
    }
  }

  private handleClick(e: MouseEvent) {
    if (!this.isActive) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if (target && target !== this.overlayElement) {
      const elementInfo = this.extractElementInfo(target, e);
      this.sendMessageToParent({
        type: 'IFRAME_MOUSE_CLICK',
        data: {
          position: { x: e.clientX, y: e.clientY },
          element: elementInfo
        }
      });
    }
  }

  private extractElementInfo(element: HTMLElement, event: MouseEvent): ElementInfo {
    const rect = element.getBoundingClientRect();
    const text = element.textContent || element.innerText || '';
    
    // Build parent path
    let parentPath = '';
    let parent = element.parentElement;
    let levels = 0;
    while (parent && levels < 2) {
      const tag = parent.tagName.toLowerCase();
      const id = parent.id ? `#${parent.id}` : '';
      const classes = parent.className ? `.${parent.className.split(' ').join('.')}` : '';
      parentPath = `${tag}${id}${classes}` + (parentPath ? ' > ' + parentPath : '');
      parent = parent.parentElement;
      levels++;
    }

    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || '',
      classes: Array.from(element.classList),
      text: text.slice(0, 100),
      position: { x: event.clientX, y: event.clientY },
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      attributes: Array.from(element.attributes).map(attr => ({ name: attr.name, value: attr.value })),
      parentPath
    };
  }

  private createOverlay() {
    this.overlayElement = document.createElement('div');
    this.overlayElement.id = 'logtrace-iframe-overlay';
    this.overlayElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      display: none;
    `;
    document.body.appendChild(this.overlayElement);
  }

  private showOverlay() {
    if (this.overlayElement) {
      this.overlayElement.style.display = 'block';
    }
  }

  private hideOverlay() {
    if (this.overlayElement) {
      this.overlayElement.style.display = 'none';
    }
    this.clearHighlight();
  }

  private highlightElement(element: HTMLElement) {
    this.clearHighlight();
    
    const rect = element.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.className = 'logtrace-element-highlight';
    highlight.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px solid #06b6d4;
      background: rgba(6, 182, 212, 0.1);
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
      pointer-events: none;
      z-index: 999998;
    `;
    
    if (this.overlayElement) {
      this.overlayElement.appendChild(highlight);
    }
  }

  private clearHighlight() {
    if (this.overlayElement) {
      const highlights = this.overlayElement.querySelectorAll('.logtrace-element-highlight');
      highlights.forEach(highlight => highlight.remove());
    }
  }

  private sendMessageToParent(message: IframeMessage) {
    window.parent.postMessage(message, '*');
  }

  private notifyParentReady() {
    this.sendMessageToParent({ type: 'IFRAME_READY' });
  }
}

// Initialize the content script
if (window.self !== window.top) {
  new IframeContentScript();
}

export default IframeContentScript;
```

### src/shared/hooks/useIframeBridge.ts
```typescript
/**
 * Hook for managing iframe communication and event bridging
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ElementInfo } from '../types';

interface IframeElementInfo {
  tag: string;
  id: string;
  classes: string[];
  text: string;
  position: { x: number; y: number };
  rect: { left: number; top: number; width: number; height: number };
  attributes: { name: string; value: string }[];
  parentPath: string;
}

export const useIframeBridge = (iframeRef: React.RefObject<HTMLIFrameElement>) => {
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [iframeElement, setIframeElement] = useState<ElementInfo | null>(null);
  const [iframeMousePosition, setIframeMousePosition] = useState({ x: 0, y: 0 });
  const [isSameOrigin, setIsSameOrigin] = useState(false);
  const contentScriptInjected = useRef(false);

  // Check if iframe is same-origin
  const checkSameOrigin = useCallback(() => {
    if (!iframeRef.current) return false;
    
    try {
      // Try to access iframe's document - will throw if cross-origin
      const iframeDoc = iframeRef.current.contentDocument;
      return !!iframeDoc;
    } catch (error) {
      return false;
    }
  }, [iframeRef]);

  // Inject content script for cross-origin iframes
  const injectContentScript = useCallback(() => {
    if (!iframeRef.current || contentScriptInjected.current) return;

    const isSameOriginCheck = checkSameOrigin();
    setIsSameOrigin(isSameOriginCheck);

    if (isSameOriginCheck) {
      // For same-origin, inject script directly
      try {
        const iframeDoc = iframeRef.current.contentDocument;
        if (iframeDoc) {
          const script = iframeDoc.createElement('script');
          script.type = 'module';
          script.textContent = `
            // Inline content script for same-origin iframe
            ${getContentScriptCode()}
          `;
          iframeDoc.head.appendChild(script);
          contentScriptInjected.current = true;
        }
      } catch (error) {
        console.error('Failed to inject same-origin content script:', error);
      }
    } else {
      // For cross-origin, we need to handle via postMessage only
      // The content script would need to be injected by the iframe itself
      console.log('Cross-origin iframe detected - content script injection not possible');
    }
  }, [iframeRef, checkSameOrigin]);

  // Handle messages from iframe
  const handleIframeMessage = useCallback((event: MessageEvent) => {
    if (!event.data?.type) return;

    switch (event.data.type) {
      case 'IFRAME_READY':
        setIsIframeReady(true);
        break;
      
      case 'IFRAME_MOUSE_MOVE':
        if (event.data.data) {
          const { position, element } = event.data.data;
          setIframeMousePosition(position);
          
          if (element) {
            // Convert iframe element info to ElementInfo format
            const elementInfo: ElementInfo = {
              tag: element.tag,
              id: element.id,
              classes: element.classes,
              text: element.text,
              element: null as any, // We can't access the actual element cross-origin
              parentPath: element.parentPath,
              attributes: element.attributes,
              size: { width: element.rect.width, height: element.rect.height }
            };
            setIframeElement(elementInfo);
          }
        }
        break;
      
      case 'IFRAME_MOUSE_CLICK':
        if (event.data.data) {
          const { position, element } = event.data.data;
          // Handle iframe click events
          console.log('Iframe click:', { position, element });
        }
        break;
    }
  }, []);

  // Activate/deactivate iframe tracking
  const activateIframe = useCallback(() => {
    if (iframeRef.current && isIframeReady) {
      iframeRef.current.contentWindow?.postMessage({ type: 'IFRAME_ACTIVATE' }, '*');
    }
  }, [iframeRef, isIframeReady]);

  const deactivateIframe = useCallback(() => {
    if (iframeRef.current && isIframeReady) {
      iframeRef.current.contentWindow?.postMessage({ type: 'IFRAME_DEACTIVATE' }, '*');
    }
  }, [iframeRef, isIframeReady]);

  // Setup message listener
  useEffect(() => {
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [handleIframeMessage]);

  // Inject content script when iframe loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      // Small delay to ensure iframe is fully loaded
      setTimeout(() => {
        injectContentScript();
      }, 100);
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [iframeRef, injectContentScript]);

  return {
    isIframeReady,
    isSameOrigin,
    iframeElement,
    iframeMousePosition,
    activateIframe,
    deactivateIframe
  };
};

// Get the content script code as a string
function getContentScriptCode(): string {
  return `
    class IframeContentScript {
      constructor() {
        this.isActive = false;
        this.currentElement = null;
        this.overlayElement = null;
        this.setupMessageListener();
        this.setupEventListeners();
        this.notifyParentReady();
        this.createOverlay();
      }

      setupMessageListener() {
        window.addEventListener('message', (event) => {
          if (event.data?.type === 'IFRAME_ACTIVATE') {
            this.isActive = true;
            this.showOverlay();
          } else if (event.data?.type === 'IFRAME_DEACTIVATE') {
            this.isActive = false;
            this.hideOverlay();
          }
        });
      }

      setupEventListeners() {
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('click', this.handleClick.bind(this));
      }

      handleMouseMove(e) {
        if (!this.isActive) return;
        
        const target = e.target;
        if (target && target !== this.overlayElement) {
          this.currentElement = target;
          this.highlightElement(target);
          
          const elementInfo = this.extractElementInfo(target, e);
          this.sendMessageToParent({
            type: 'IFRAME_MOUSE_MOVE',
            data: {
              position: { x: e.clientX, y: e.clientY },
              element: elementInfo
            }
          });
        }
      }

      handleClick(e) {
        if (!this.isActive) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target;
        if (target && target !== this.overlayElement) {
          const elementInfo = this.extractElementInfo(target, e);
          this.sendMessageToParent({
            type: 'IFRAME_MOUSE_CLICK',
            data: {
              position: { x: e.clientX, y: e.clientY },
              element: elementInfo
            }
          });
        }
      }

      extractElementInfo(element, event) {
        const rect = element.getBoundingClientRect();
        const text = element.textContent || element.innerText || '';
        
        let parentPath = '';
        let parent = element.parentElement;
        let levels = 0;
        while (parent && levels < 2) {
          const tag = parent.tagName.toLowerCase();
          const id = parent.id ? '#' + parent.id : '';
          const classes = parent.className ? '.' + parent.className.split(' ').join('.') : '';
          parentPath = tag + id + classes + (parentPath ? ' > ' + parentPath : '');
          parent = parent.parentElement;
          levels++;
        }

        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || '',
          classes: Array.from(element.classList),
          text: text.slice(0, 100),
          position: { x: event.clientX, y: event.clientY },
          rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
          attributes: Array.from(element.attributes).map(attr => ({ name: attr.name, value: attr.value })),
          parentPath
        };
      }

      createOverlay() {
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'logtrace-iframe-overlay';
        this.overlayElement.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999999; display: none;';
        document.body.appendChild(this.overlayElement);
      }

      showOverlay() {
        if (this.overlayElement) {
          this.overlayElement.style.display = 'block';
        }
      }

      hideOverlay() {
        if (this.overlayElement) {
          this.overlayElement.style.display = 'none';
        }
        this.clearHighlight();
      }

      highlightElement(element) {
        this.clearHighlight();
        
        const rect = element.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = 'logtrace-element-highlight';
        highlight.style.cssText = 'position: fixed; left: ' + rect.left + 'px; top: ' + rect.top + 'px; width: ' + rect.width + 'px; height: ' + rect.height + 'px; border: 2px solid #06b6d4; background: rgba(6, 182, 212, 0.1); box-shadow: 0 0 10px rgba(6, 182, 212, 0.5); pointer-events: none; z-index: 999998;';
        
        if (this.overlayElement) {
          this.overlayElement.appendChild(highlight);
        }
      }

      clearHighlight() {
        if (this.overlayElement) {
          const highlights = this.overlayElement.querySelectorAll('.logtrace-element-highlight');
          highlights.forEach(highlight => highlight.remove());
        }
      }

      sendMessageToParent(message) {
        window.parent.postMessage(message, '*');
      }

      notifyParentReady() {
        this.sendMessageToParent({ type: 'IFRAME_READY' });
      }
    }

    if (window.self !== window.top) {
      new IframeContentScript();
    }
  `;
}
```

## Key Event Handling Details

### What Happens When User Presses Enter:

1. **URL Form Submission** (`IframeDemoBar.tsx`):
   - `handleSubmit` function triggered
   - URL validation and protocol addition (https://)
   - URL encoding for safe query parameter passing
   - Navigation to `/debug?site=${encodedURL}`

2. **Route Change Processing** (`Index.tsx`):
   - `useLocation` hook detects route change
   - URL search params parsed to extract site parameter
   - Conditional rendering: IframeDemoBar vs Debug interface

3. **Iframe Integration**:
   - Iframe element created with `sandbox` security attributes
   - `onLoad` and `onError` event handlers attached
   - Cross-origin communication setup initiated

4. **LogTrace Activation**:
   - LogTrace overlay mounted over iframe
   - Iframe bridge hook initializes communication
   - Content script injection for same-origin iframes
   - Event tracking and debugging tools activated

## UI Components

### Basic UI Components (shortened for brevity)
The system uses shadcn/ui components with custom styling. Key components include:
- Button, Input, Card, Badge for the landing interface
- Dialog, Popover, Tooltip for interactive elements
- Toast notifications for user feedback
- Custom overlays and panels for debugging

## Error Handling and Mobile Support
- Comprehensive error boundaries and fallbacks
- Responsive design with mobile-first approach
- Touch-friendly interfaces for mobile debugging
- Graceful degradation for cross-origin limitations

## Implementation Summary
This rebuild guide provides all the necessary code to recreate the LogTrace interactive demo with:
- Iframe-friendly website suggestions
- Real-time element inspection with cyan highlighting
- AI-powered debugging capabilities
- Comprehensive authentication and credits system
- Cross-origin iframe communication
- Mobile-responsive design
- Complete styling and animation system

Each component is designed to work seamlessly together, creating the exact functionality shown in the screenshot with the dark theme, gradient styling, and interactive debugging capabilities.
