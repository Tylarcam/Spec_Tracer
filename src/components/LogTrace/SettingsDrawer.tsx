
import React, { useState } from 'react';
import { X, Settings, Keyboard, Zap, Eye, Terminal, MousePointer, Bell, Palette, Share2, Crown, User, Mail, Shield, Download, Trash2, LogOut, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/hooks/useNotification';
import { useEnhancedCredits } from '@/hooks/useEnhancedCredits';
import { supabase } from '@/integrations/supabase/client';
import { ShareModal } from '@/components/ShareModal';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  onUpgradeClick?: () => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose, onUpgrade, onUpgradeClick }) => {
  const { user, signOut } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { creditStatus, awardShareCredits, refreshCredits } = useEnhancedCredits();
  
  // General settings state
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Account settings state
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const shortcuts = [
    { key: 'Ctrl+S', description: 'Start/Stop tracing', icon: Zap },
    { key: 'Ctrl+E', description: 'End tracing session', icon: X },
    { key: 'Click', description: 'Open element details', icon: MousePointer },
    { key: 'Ctrl+T', description: 'Toggle terminal panel', icon: Terminal },
    { key: 'Ctrl+D', description: 'Trigger AI debug', icon: MousePointer },
    { key: 'Ctrl+P', description: 'Pause/Resume hover tracking', icon: Eye },
  ];

  const handleUpgrade = onUpgradeClick || onUpgrade || (async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  });

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
    }
  };

  const handleShare = async (platform: string) => {
    const success = await awardShareCredits(platform);
    if (success) {
      showSuccess({
        title: 'Credits awarded!',
        description: 'You earned +5 bonus credits for sharing LogTrace!'
      });
      await refreshCredits();
    }
  };

  const handleUpdateEmail = async () => {
    const newEmail = prompt('Enter your new email address:');
    if (!newEmail) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      showSuccess({
        title: 'Email update requested',
        description: 'Please check both your old and new email for confirmation links.'
      });
    } catch (err: any) {
      showError({ title: 'Update failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      showError({ title: 'Error', description: 'New passwords do not match' });
      return;
    }

    if (passwords.new.length < 6) {
      showError({ title: 'Error', description: 'Password must be at least 6 characters long' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      
      showSuccess({
        title: 'Password updated',
        description: 'Your password has been successfully changed.'
      });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      showError({ title: 'Update failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });
      if (error) throw error;
      
      showSuccess({
        title: 'Confirmation sent',
        description: 'Please check your email for the confirmation link.'
      });
    } catch (err: any) {
      showError({ title: 'Failed to send', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!creditStatus.isPremium) {
      showError({
        title: 'Pro Feature',
        description: 'Data export is available for Pro users only.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        user: {
          id: user?.id,
          email: user?.email,
          created_at: user?.created_at
        },
        credits: creditStatus,
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logtrace-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess({
        title: 'Data exported',
        description: 'Your data has been downloaded successfully.'
      });
    } catch (err: any) {
      showError({ title: 'Export failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      showError({
        title: 'Invalid confirmation',
        description: 'Please type "DELETE" to confirm account deletion.'
      });
      return;
    }

    setIsLoading(true);
    try {
      showError({
        title: 'Contact Support',
        description: 'Please contact support to delete your account. This ensures all data is properly removed.'
      });
    } catch (err: any) {
      showError({ title: 'Deletion failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showSuccess({ title: 'Signed out', description: 'You have been successfully signed out.' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        data-settings
        className={`
        fixed right-0 top-0 h-full w-full max-w-3xl bg-slate-900 border-l border-green-500/30 
        shadow-2xl z-50 transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-500/20">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Settings</h2>
          </div>
          <Button
            data-close-button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 h-full overflow-y-auto pb-20">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="general" className="text-white data-[state=active]:bg-green-600">General</TabsTrigger>
              <TabsTrigger value="account" className="text-white data-[state=active]:bg-green-600">Account</TabsTrigger>
              <TabsTrigger value="subscription" className="text-white data-[state=active]:bg-green-600">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              {/* Upgrade Section */}
              <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30">
                <CardContent className="p-4">
                  <h3 className="text-green-400 font-semibold mb-2">LogTrace Pro</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Unlock unlimited AI debugging, export features, and priority support.
                  </p>
                  <Button
                    onClick={handleUpgrade}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>

              <Separator className="bg-gray-700" />

              {/* Notifications */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-cyan-400" />
                    <CardTitle className="text-white">Notifications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Enable Notifications</Label>
                      <p className="text-sm text-slate-400">Receive alerts for debugging results</p>
                    </div>
                    <Switch
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-400" />
                    <CardTitle className="text-white">Appearance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Dark Mode</Label>
                      <p className="text-sm text-slate-400">Use dark theme interface</p>
                    </div>
                    <Switch
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Keyboard Shortcuts */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4 text-cyan-400" />
                    <CardTitle className="text-white">Keyboard Shortcuts</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {shortcuts.map((shortcut) => (
                      <div key={shortcut.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <shortcut.icon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">{shortcut.description}</span>
                        </div>
                        <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-gray-300">
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Share for Credits */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-cyan-400" />
                    <CardTitle className="text-white">Share LogTrace</CardTitle>
                  </div>
                  <CardDescription className="text-slate-400">
                    Share with friends and earn bonus credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleShare('twitter')}
                      className="bg-cyan-600 hover:bg-cyan-700 flex-1"
                    >
                      Share on X
                    </Button>
                    <Button
                      onClick={() => handleShare('linkedin')}
                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                    >
                      Share on LinkedIn
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Earn +5 credits for each successful share on social media
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              {user ? (
                <>
                  {/* Account Information */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-green-400" />
                        <CardTitle className="text-white">Account Information</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">Email Address</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              value={user.email || ''}
                              readOnly
                              className="bg-slate-700 border-slate-600"
                            />
                            <Button
                              onClick={handleUpdateEmail}
                              disabled={isLoading}
                              variant="outline"
                              className="border-green-600 text-green-400 hover:bg-green-600/10"
                            >
                              Update
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-white">Account Status</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {user.email_confirmed_at ? (
                              <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-yellow-400 text-sm">Unverified</span>
                                <Button
                                  onClick={handleResendConfirmation}
                                  disabled={isLoading}
                                  size="sm"
                                  variant="outline"
                                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                                >
                                  Resend Confirmation
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Security Settings */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-400" />
                        <CardTitle className="text-white">Security Settings</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwords.new}
                              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                              className="bg-slate-700 border-slate-600 pr-10"
                              placeholder="Enter new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-slate-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-slate-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                            className="bg-slate-700 border-slate-600"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <Button
                          onClick={handleUpdatePassword}
                          disabled={isLoading || !passwords.new || !passwords.confirm}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Update Password
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Data Management */}
                  {creditStatus.isPremium && (
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Download className="h-5 w-5 text-purple-400" />
                          <CardTitle className="text-white">Data Management</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={handleExportData}
                          disabled={isLoading}
                          className="bg-purple-600 hover:bg-purple-700 w-full"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export My Data
                        </Button>
                        <p className="text-sm text-slate-500 mt-2">
                          Download a JSON file containing your account data and usage history.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Separator className="bg-slate-700" />

                  {/* Danger Zone */}
                  <Card className="bg-slate-800 border-red-500/30">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-400" />
                        <CardTitle className="text-white">Danger Zone</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                      
                      <div className="pt-4 border-t border-slate-700">
                        <h4 className="text-red-400 font-medium mb-2">Delete Account</h4>
                        <p className="text-sm text-slate-400 mb-3">
                          This will permanently delete your account and all associated data.
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="delete-confirmation" className="text-white">
                            Type "DELETE" to confirm
                          </Label>
                          <Input
                            id="delete-confirmation"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="bg-slate-700 border-slate-600"
                            placeholder="DELETE"
                          />
                          <Button
                            onClick={handleDeleteAccount}
                            disabled={isLoading || deleteConfirmation !== 'DELETE'}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 w-full"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6 text-center">
                    <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">Sign in required</h3>
                    <p className="text-slate-400 mb-4">
                      Please sign in to access account settings and manage your profile.
                    </p>
                    <Button
                      onClick={() => window.location.href = '/auth'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              {/* Credit Status & Subscription */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-400" />
                    <CardTitle className="text-white">Credits & Subscription</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        {creditStatus.isPremium ? 'Pro Plan' : 'Free Plan'}
                      </span>
                      {creditStatus.isPremium && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    <div className="text-sm text-slate-400">
                      {creditStatus.isPremium ? (
                        'Unlimited credits'
                      ) : (
                        `${creditStatus.totalCredits} credits remaining`
                      )}
                    </div>
                    {!creditStatus.isPremium && (
                      <div className="text-xs text-slate-500 mt-1">
                        Daily: {creditStatus.dailyCredits}/10 • Bonus: {creditStatus.waitlistBonus}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {creditStatus.isPremium ? (
                      <Button
                        onClick={handleManageSubscription}
                        variant="outline"
                        className="w-full border-green-600 text-green-400 hover:bg-green-600/10"
                      >
                        Manage Subscription
                      </Button>
                    ) : (
                      <Button
                        onClick={handleUpgrade}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Pro - $9/mo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pro Features */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Pro Features</CardTitle>
                  <CardDescription className="text-slate-400">
                    Everything included in LogTrace Pro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Zap className="h-4 w-4 text-green-400" />
                      <span className="text-white">Unlimited AI debugging</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Download className="h-4 w-4 text-purple-400" />
                      <span className="text-white">Data export features</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="text-white">Priority support</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span className="text-white">Pro badge and features</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          isOpen={showShareModal} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </>
  );
};

export default SettingsDrawer;
