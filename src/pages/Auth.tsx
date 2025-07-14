
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Github, Mail, ArrowLeft, Monitor } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtensionAuth, setIsExtensionAuth] = useState(false);
  const [defaultTab, setDefaultTab] = useState('signin');
  const { signUp, signIn, signInWithGitHub, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check URL parameters for extension authentication
    const returnUrl = searchParams.get('return');
    const mode = searchParams.get('mode');
    const provider = searchParams.get('provider');
    const emailParam = searchParams.get('email');

    // Detect extension authentication flow
    if (returnUrl && returnUrl.includes('auth=extension')) {
      setIsExtensionAuth(true);
      
      // Pre-populate email if provided
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
      }
      
      // Set default tab based on mode
      if (mode === 'signup') {
        setDefaultTab('signup');
      } else if (mode === 'signin') {
        setDefaultTab('signin');
      }
      
      // Handle GitHub OAuth automatically
      if (provider === 'github') {
        handleGitHubSignIn();
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !isExtensionAuth) {
      navigate('/');
    }
  }, [user, navigate, isExtensionAuth]);

  // Set up auth state listener for extension flows
  useEffect(() => {
    if (!isExtensionAuth) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Send success message to extension
          if (window.opener) {
            window.opener.postMessage({
              type: 'AUTH_SUCCESS',
              user: session.user,
              session: session
            }, '*');
            window.close();
          }
        } else if (event === 'SIGNED_OUT') {
          // Handle sign out
          if (window.opener) {
            window.opener.postMessage({
              type: 'AUTH_SIGNED_OUT'
            }, '*');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [isExtensionAuth]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password);
      if (error && isExtensionAuth && window.opener) {
        window.opener.postMessage({
          type: 'AUTH_ERROR',
          message: error.message
        }, '*');
      }
    } catch (error: any) {
      if (isExtensionAuth && window.opener) {
        window.opener.postMessage({
          type: 'AUTH_ERROR',
          message: error.message || 'Sign up failed'
        }, '*');
      }
    }
    
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (isExtensionAuth && window.opener) {
          window.opener.postMessage({
            type: 'AUTH_ERROR',
            message: error.message
          }, '*');
        }
      } else if (!isExtensionAuth) {
        navigate('/');
      }
    } catch (error: any) {
      if (isExtensionAuth && window.opener) {
        window.opener.postMessage({
          type: 'AUTH_ERROR',
          message: error.message || 'Sign in failed'
        }, '*');
      }
    }
    
    setIsLoading(false);
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    
    try {
      await signInWithGitHub();
    } catch (error: any) {
      if (isExtensionAuth && window.opener) {
        window.opener.postMessage({
          type: 'AUTH_ERROR',
          message: error.message || 'GitHub sign in failed'
        }, '*');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!isExtensionAuth && (
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-green-400 hover:text-green-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to LogTrace
          </Button>
        )}

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isExtensionAuth && <Monitor className="h-5 w-5 text-cyan-400" />}
              <CardTitle className="text-2xl text-green-400">
                {isExtensionAuth ? 'LogTrace Extension' : 'Welcome to LogTrace'}
              </CardTitle>
            </div>
            <CardDescription className="text-slate-300">
              {isExtensionAuth 
                ? 'Complete your authentication to unlock extension features'
                : 'Sign in to unlock advanced context capture and sharing'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleGitHubSignIn}
                className="w-full mt-4 bg-slate-700 border-slate-600 hover:bg-slate-600"
                disabled={isLoading}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

            {isExtensionAuth && (
              <div className="mt-6 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-xs text-cyan-300 text-center">
                  🚀 Authenticating for Chrome Extension
                  <br />
                  This window will close automatically when complete
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
