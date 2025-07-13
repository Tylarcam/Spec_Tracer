
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UseExtensionAuthReturn {
  user: User | null;
  authLoading: boolean;
  guestDebugCount: number;
  email: string;
  password: string;
  isLoading: boolean;
  toast: { title: string; description?: string; variant?: 'destructive' | undefined } | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setToast: (toast: { title: string; description?: string; variant?: 'destructive' | undefined } | null) => void;
  handleSignUp: (email: string, password: string) => Promise<void>;
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleSignInWithGitHub: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  incrementGuestDebug: () => void;
}

export const useExtensionAuth = (): UseExtensionAuthReturn => {
  const [user, setUser] = React.useState<User | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [guestDebugCount, setGuestDebugCount] = React.useState<number>(0);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [toast, setToast] = React.useState<{ title: string; description?: string; variant?: 'destructive' | undefined } | null>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    const count = parseInt(localStorage.getItem('logtrace_guest_debug_count') || '0', 10);
    setGuestDebugCount(count);
  }, []);

  const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    setIsLoading(false);
    if (error) {
      setToast({ title: 'Sign Up Error', description: error.message, variant: 'destructive' });
    } else {
      setToast({ title: 'Check your email', description: 'We sent you a confirmation link to complete your registration.' });
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) {
      setToast({ title: 'Sign In Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSignInWithGitHub = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'github', 
      options: { redirectTo: `${window.location.origin}/` } 
    });
    setIsLoading(false);
    if (error) {
      setToast({ title: 'GitHub Sign In Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const incrementGuestDebug = () => {
    const newCount = guestDebugCount + 1;
    setGuestDebugCount(newCount);
    localStorage.setItem('logtrace_guest_debug_count', newCount.toString());
  };

  return {
    user,
    authLoading,
    guestDebugCount,
    email,
    password,
    isLoading,
    toast,
    setEmail,
    setPassword,
    setToast,
    handleSignUp,
    handleSignIn,
    handleSignInWithGitHub,
    handleSignOut,
    incrementGuestDebug,
  };
};
