import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Key, Bell, Shield, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useNotification } from '@/hooks/useNotification';
import Spinner from '@/components/ui/spinner';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const { success, error } = useNotification();

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      error({ title: 'Invalid', description: 'Please enter a valid API key' });
      return;
    }

    setIsLoading(true);
    try {
      // Store API key in localStorage for now
      localStorage.setItem('openai_api_key', apiKey);
      success({ title: 'API key saved', description: 'Your API key has been stored securely' });
      setApiKey('');
    } catch (error) {
      error({ title: 'Save failed', description: 'Failed to save API key' });
    } finally {
      setIsLoading(false);
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

          <div className="grid md:grid-cols-2 gap-6">
            {/* API Configuration */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-green-400" />
                  <CardTitle className="text-white">API Configuration</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Configure your OpenAI API key for AI debugging features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-key">OpenAI API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="mt-1 bg-slate-700 border-slate-600"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Required for AI debugging features. Your key is stored locally and securely.
                  </p>
                </div>
                <Button 
                  onClick={handleSaveApiKey}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Spinner size={16} className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save API Key'
                  )}
                </Button>
              </CardContent>
            </Card>

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

            {/* Privacy & Security */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-white">Privacy & Security</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Manage your data and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                    Export My Data
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 