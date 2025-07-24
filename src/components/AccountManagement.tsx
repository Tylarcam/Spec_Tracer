
import React, { useState } from 'react';
import { User, Mail, Shield, Download, Trash2, LogOut, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/hooks/useNotification';
import { useEnhancedCredits } from '@/hooks/useEnhancedCredits';
import { supabase } from '@/integrations/supabase/client';

const AccountManagement: React.FC = () => {
  const { user, signOut } = useAuth();
  const { success, error } = useNotification();
  const { creditStatus } = useEnhancedCredits();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleUpdateEmail = async () => {
    const newEmail = prompt('Enter your new email address:');
    if (!newEmail) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      success({
        title: 'Email update requested',
        description: 'Please check both your old and new email for confirmation links.'
      });
    } catch (err: any) {
      error({ title: 'Update failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      error({ title: 'Error', description: 'New passwords do not match' });
      return;
    }

    if (passwords.new.length < 6) {
      error({ title: 'Error', description: 'Password must be at least 6 characters long' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      
      success({
        title: 'Password updated',
        description: 'Your password has been successfully changed.'
      });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      error({ title: 'Update failed', description: err.message });
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
      
      success({
        title: 'Confirmation sent',
        description: 'Please check your email for the confirmation link.'
      });
    } catch (err: any) {
      error({ title: 'Failed to send', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!creditStatus.isPremium) {
      error({
        title: 'Pro Feature',
        description: 'Data export is available for Pro users only.'
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you'd call an edge function to generate and download user data
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

      success({
        title: 'Data exported',
        description: 'Your data has been downloaded successfully.'
      });
    } catch (err: any) {
      error({ title: 'Export failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      error({
        title: 'Invalid confirmation',
        description: 'Please type "DELETE" to confirm account deletion.'
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you'd call an edge function to handle account deletion
      // This would include deleting user data, canceling subscriptions, etc.
      error({
        title: 'Contact Support',
        description: 'Please contact support to delete your account. This ensures all data is properly removed.'
      });
    } catch (err: any) {
      error({ title: 'Deletion failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    success({ title: 'Signed out', description: 'You have been successfully signed out.' });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-400" />
            <CardTitle className="text-white">Account Information</CardTitle>
          </div>
          <CardDescription className="text-slate-400">
            Manage your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <CardDescription className="text-slate-400">
            Update your password and security preferences
          </CardDescription>
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
            <CardDescription className="text-slate-400">
              Export your data and usage history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleExportData}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export My Data
            </Button>
            <p className="text-sm text-slate-500 mt-2">
              Download a JSON file containing your account data, usage history, and settings.
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
          <CardDescription className="text-slate-400">
            Irreversible account actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            
            <div className="pt-4 border-t border-slate-700">
              <h4 className="text-red-400 font-medium mb-2">Delete Account</h4>
              <p className="text-sm text-slate-400 mb-3">
                This will permanently delete your account and all associated data. This action cannot be undone.
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
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountManagement;
