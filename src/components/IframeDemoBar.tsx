
import React, { useState } from 'react';
import { Globe, Search, Zap, Crown, Settings, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';
import { useAuth } from '@/contexts/AuthContext';
import UpgradeNotificationBanner from '@/components/LogTrace/UpgradeNotificationBanner';
import UpgradeModal from '@/components/LogTrace/UpgradeModal';

const popularSites = [
  'example.com',
  'httpbin.org',
  'jsonplaceholder.typicode.com',
  'httpstat.us',
  'postman-echo.com',
];

const IframeDemoBar: React.FC = () => {
  const [url, setUrl] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { creditsStatus } = useCreditsSystem();

  const handleAnalyze = () => {
    if (!url.trim()) return;
    
    // Ensure URL has protocol
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    // Navigate to the main Index page with the URL parameter and enable LogTrace
    navigate(`/?site=${encodeURIComponent(formattedUrl)}&demo=true`);
  };

  const handleQuickSite = (site: string) => {
    setUrl(site);
    // Auto-analyze when clicking a popular site
    setTimeout(() => {
      const formattedUrl = site.startsWith('http') ? site : 'https://' + site;
      navigate(`/?site=${encodeURIComponent(formattedUrl)}&demo=true`);
    }, 100);
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const handleAuth = () => {
    navigate('/auth');
  };

  const handleSettings = () => {
    // Could navigate to settings page or open a modal
    console.log('Settings clicked');
  };

  const remainingCredits = creditsStatus?.creditsRemaining || 0;
  const totalCredits = creditsStatus?.creditsLimit || 5;
  const isPremium = creditsStatus?.isPremium || false;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 relative">
      {/* Upgrade Notification Banner */}
      {!isPremium && (
        <UpgradeNotificationBanner 
          remainingUses={remainingCredits}
        />
      )}

      {/* Header with Auth/Settings */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        {/* Credits Display */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500/30 text-green-400">
            <Zap className="w-3 h-3 mr-1" />
            {remainingCredits}/{totalCredits}
          </Badge>
          {isPremium && (
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* User Menu */}
        {user ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSettings}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <User className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleAuth}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <LogIn className="w-4 h-4 mr-1" />
            Sign In
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto text-center">
        {/* Logo and Title */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-green-400 rounded-xl flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-900" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              LogTrace
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            Interactive Website Element Inspector & Debugger
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Test our interactive demo with iframe-friendly websites. Click on any element to inspect its properties, 
            debug with AI, and see real-time element information with mouse tracking.
          </p>
        </div>

        {/* Demo Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl">
          <Card className="bg-slate-800/50 border-cyan-500/20 p-4">
            <div className="text-cyan-400 mb-2">🎯 Mouse Tracking</div>
            <div className="text-sm text-slate-300">
              Real-time element highlighting and position tracking as you move your mouse
            </div>
          </Card>
          <Card className="bg-slate-800/50 border-green-500/20 p-4">
            <div className="text-green-400 mb-2">🔍 Element Inspector</div>
            <div className="text-sm text-slate-300">
              Click any element to see detailed properties, attributes, and computed styles
            </div>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/20 p-4">
            <div className="text-purple-400 mb-2">🤖 AI Debug</div>
            <div className="text-sm text-slate-300">
              Get AI-powered insights and debugging suggestions for any element
            </div>
          </Card>
        </div>

        {/* URL Input */}
        <div className="w-full max-w-2xl mb-6">
          <div className="flex items-center bg-slate-800/50 border border-cyan-500/30 rounded-xl p-4 shadow-lg shadow-cyan-500/10">
            <Globe className="w-6 h-6 text-cyan-400 mr-3" />
            <input
              className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-slate-400 font-medium"
              placeholder="example.com, httpbin.org, your-website.com..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <Button
              onClick={handleAnalyze}
              className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={!url.trim()}
            >
              <Search className="w-4 h-4 mr-2" />
              Start Demo
            </Button>
          </div>
        </div>

        {/* Popular Examples */}
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div className="text-slate-400 mb-2">iframe-friendly examples:</div>
          <div className="flex flex-wrap gap-3 justify-center">
            {popularSites.map((site) => (
              <button
                key={site}
                onClick={() => handleQuickSite(site)}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg border border-slate-600/50 hover:border-cyan-500/50 transition-all duration-200 text-sm"
              >
                {site}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="mt-8 max-w-2xl">
          <Card className="bg-slate-800/30 border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">How to use the demo:</h3>
            <div className="space-y-2 text-sm text-slate-300 text-left">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-mono">1.</span>
                <span>Enter a URL or click one of the iframe-friendly examples above</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-mono">2.</span>
                <span>Press <kbd className="bg-slate-700 px-1 rounded">S</kbd> to activate LogTrace inspection mode</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-mono">3.</span>
                <span>Move your mouse over elements to see real-time highlighting</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-mono">4.</span>
                <span>Click any element to open the detailed inspector panel</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-mono">5.</span>
                <span>Press <kbd className="bg-slate-700 px-1 rounded">Ctrl+D</kbd> to debug with AI</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-mono">6.</span>
                <span>Press <kbd className="bg-slate-700 px-1 rounded">T</kbd> to open the terminal for event history</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Upgrade CTA */}
        {!isPremium && (
          <div className="mt-8">
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade for Unlimited Usage
            </Button>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        remainingUses={remainingCredits}
      />
    </div>
  );
};

export default IframeDemoBar;
