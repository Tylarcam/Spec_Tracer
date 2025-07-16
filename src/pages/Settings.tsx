
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Bell, Shield, Palette, Share2, Crown, Zap, UserCog } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotification } from '@/hooks/useNotification';
import { useEnhancedCredits } from '@/hooks/useEnhancedCredits';
import ShareModal from '@/components/ShareModal';
import AccountManagement from '@/components/AccountManagement';
import { supabase } from '@/integrations/supabase/client';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const { success, error } = useNotification();
  const { creditStatus, refreshCredits } = useEnhancedCredits();

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-green-400 hover:text-green-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to LogTrace
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-green-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-slate-400">Configure your LogTrace experience</p>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Notifications */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-cyan-400" />
                      <CardTitle className="text-white">Notifications</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400">
                      Control how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Enable Notifications</Label>
                        <p className="text-sm text-slate-500">Receive alerts for debugging results</p>
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
                    <CardDescription className="text-slate-400">
                      Customize the look and feel
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Dark Mode</Label>
                        <p className="text-sm text-slate-500">Use dark theme interface</p>
                      </div>
                      <Switch
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Share for Credits */}
                <Card className="bg-slate-800 border-slate-700 md:col-span-2">
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
                    <Button
                      onClick={() => setShowShareModal(true)}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share for Bonus Credits
                    </Button>
                    <p className="text-sm text-slate-500 mt-2">
                      Earn +5 credits for each successful share on social media
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="account">
              <AccountManagement />
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              <div className="grid md:grid-cols-1 gap-6">
                {/* Credit Status & Subscription */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-green-400" />
                      <CardTitle className="text-white">Credits & Subscription</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400">
                      Manage your usage and subscription
                    </CardDescription>
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
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
};

export default Settings;
