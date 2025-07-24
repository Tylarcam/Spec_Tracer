
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Github, Mail } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface ExtensionAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onGitHubSignIn: () => Promise<void>;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  toast: { title: string; description?: string; variant?: 'destructive' | undefined } | null;
}

const ExtensionAuthModal: React.FC<ExtensionAuthModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  email,
  password,
  setEmail,
  setPassword,
  onSignIn,
  onSignUp,
  onGitHubSignIn,
  toast,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[2147483650] flex items-center justify-center">
      <Card className="w-full max-w-md p-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-400">Welcome to LogTrace</CardTitle>
          <CardDescription className="text-slate-300">
            Sign in to access advanced debugging features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onSignIn(email, password);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                    onChange={e => setPassword(e.target.value)}
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
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onSignUp(email, password);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                    onChange={e => setPassword(e.target.value)}
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
              onClick={onGitHubSignIn}
              className="w-full mt-4 bg-slate-700 border-slate-600 hover:bg-slate-600"
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
          {toast && (
            <div className={`mt-6 p-3 rounded text-center ${toast.variant === 'destructive' ? 'bg-red-800/60 text-red-200' : 'bg-green-800/60 text-green-200'}`}>
              {toast.title}
              {toast.description && <><br />{toast.description}</>}
            </div>
          )}
          <Button onClick={onClose} className="mt-6 w-full" variant="ghost">Close</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtensionAuthModal;
