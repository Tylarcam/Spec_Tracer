
import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Store API key in localStorage for now
      localStorage.setItem('openai_api_key', apiKey);
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
      setApiKey('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <div className="space-y-4">
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
