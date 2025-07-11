
import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useNotification } from '@/hooks/useNotification';
import Spinner from './ui/spinner';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      success({ title: 'API key saved', description: 'Your API key has been stored' });
      setApiKey('');
    } catch (error) {
      error({ title: 'Save failed', description: 'Failed to save API key' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto relative">
      {(isLoading) && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10 rounded">
          <Spinner size={32} />
        </div>
      )}
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <div className={`space-y-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div>
          <Label htmlFor="api-key">OpenAI API Key</Label>
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Required for AI debugging features
          </p>
        </div>
        <Button 
          onClick={handleSaveApiKey}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save API Key'}
        </Button>
      </div>
    </Card>
  );
};

export default Settings;
