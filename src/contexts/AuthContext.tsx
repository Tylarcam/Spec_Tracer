
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, validatePassword, secureLog } from '@/utils/sanitization';

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
        
        // Log auth events securely
        secureLog(`Auth event: ${event}`, { 
          userId: session?.user?.id,
          hasSession: !!session 
        });
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
    // Enhanced input validation
    if (!validateEmail(email)) {
      const error = new Error('Please enter a valid email address');
      toast({
        title: 'Sign Up Error',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      const error = new Error(passwordValidation.errors[0]);
      toast({
        title: 'Sign Up Error',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      secureLog('Sign up error', { error: error.message }, 'error');
      toast({
        title: 'Sign Up Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      secureLog('Sign up successful', { email });
      toast({
        title: 'Check your email',
        description: 'We sent you a confirmation link to complete your registration.'
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Enhanced input validation
    if (!validateEmail(email)) {
      const error = new Error('Please enter a valid email address');
      toast({
        title: 'Sign In Error',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    }

    if (!password || password.length < 1) {
      const error = new Error('Password is required');
      toast({
        title: 'Sign In Error',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) {
      secureLog('Sign in error', { error: error.message, email }, 'error');
      toast({
        title: 'Sign In Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      secureLog('Sign in successful', { email });
    }

    return { error };
  };

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      secureLog('GitHub sign in error', { error: error.message }, 'error');
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
      secureLog('Sign out error', { error: error.message }, 'error');
      toast({
        title: 'Sign Out Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      secureLog('Sign out successful');
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
