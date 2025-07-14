
import React, { useState } from 'react';
import { Globe, Search, Zap, Crown, Settings, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SettingsDrawer from '@/components/LogTrace/SettingsDrawer';

const popularSites = [
  'github.com',
  'reddit.com',
  'stackoverflow.com',
  'stripe.com',
  'vercel.com',
];

const IframeDemoBar: React.FC = () => {
  const [url, setUrl] = useState('');
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAnalyze = () => {
    if (!url.trim()) return;
    let fullUrl = url.trim();
    if (!/^https?:\/\//.test(fullUrl)) {
      fullUrl = 'https://' + fullUrl;
    }
    window.location.href = `/debug?site=${encodeURIComponent(fullUrl)}`;
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleSettingsClick = () => {
    setShowSettingsDrawer(true);
  };

  const handleUpgrade = () => {
    // Navigate to upgrade or handle upgrade logic
    navigate('/auth'); // For now, redirect to auth page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 relative">
      {/* Header with icons */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        {/* Credits indicator */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800/80 border border-green-500/30 text-green-400">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">3/5</span>
        </div>
        
        {/* Pro badge */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-medium">Pro</span>
        </div>
        
        {/* Settings */}
        <Button
          onClick={handleSettingsClick}
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-slate-700/50"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Sign in button */}
      <div className="absolute top-4 right-4">
        {user ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">{user.email}</span>
          </div>
        ) : (
          <Button
            onClick={handleSignIn}
            variant="outline"
            size="sm"
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>

      {/* Main content - centered */}
      <div className="flex flex-col items-center">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              LogTrace
            </span>
          </div>
          <div className="text-xl text-white font-medium mb-1">
            Debug any website with AI-powered inspection
          </div>
          <div className="text-slate-400 text-base mb-6">
            Enter any URL below to start debugging with LogTrace
          </div>
        </div>

        {/* Input Card */}
        <div className="w-full max-w-2xl flex items-center bg-slate-800/80 border border-cyan-400/20 rounded-2xl shadow-lg px-6 py-4 mb-8 backdrop-blur-md">
          <Globe className="w-6 h-6 text-cyan-400 mr-3" />
          <input
            className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-slate-400 font-medium"
            placeholder="github.com, reddit.com, your-website.com..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            autoFocus
          />
          <Button
            onClick={handleAnalyze}
            className="ml-4 flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-green-400 to-cyan-400 text-white font-semibold shadow hover:from-green-500 hover:to-cyan-500 transition"
          >
            <Search className="w-5 h-5" />
            Analyze
          </Button>
        </div>

        {/* Popular Examples */}
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div className="text-slate-400 mb-2">Popular examples:</div>
          <div className="flex flex-wrap gap-3 justify-center">
            {popularSites.map((site) => (
              <button
                key={site}
                onClick={() => setUrl(site)}
                className="px-5 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white transition"
              >
                {site}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        onUpgradeClick={handleUpgrade}
      />
    </div>
  );
};

export default IframeDemoBar;
