import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import InteractiveDemo from '@/pages/InteractiveDemo';
import Debug from '@/pages/Debug';
import Home from '@/pages/Home';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Settings from '@/pages/Settings';
import Upgrade from '@/pages/Upgrade';
import NotFound from '@/pages/NotFound';
import ContextTransform from '@/pages/ContextTransform';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/debug",
    element: <Debug />,
  },
  {
    path: "/interactive-demo",
    element: <InteractiveDemo />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/landing", 
    element: <Landing />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/upgrade",
    element: <Upgrade />,
  },
  {
    path: "/context-transform",
    element: <ContextTransform />,
  },
  {
    path: "*",
    element: <NotFound />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
