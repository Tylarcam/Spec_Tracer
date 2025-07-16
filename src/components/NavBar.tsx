import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, User, Settings, Crown } from 'lucide-react';

const NavBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-green-500/30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo/Home */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80">
          <div className="bg-gradient-to-r from-green-500 to-cyan-500 p-2 rounded-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">LogTrace</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-4">
          <Link to="/interactive-demo">
            <button
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow transition-colors text-base focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
              style={{ minWidth: 80 }}
            >
              Demo
            </button>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Upgrade */}
          <button
            className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold"
            title="Upgrade to Pro"
            onClick={() => navigate('/upgrade')}
          >
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">Pro</span>
          </button>
          {/* Settings */}
          <button
            className="text-gray-400 hover:text-white p-2 rounded-full"
            title="Settings"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-5 w-5" />
          </button>
          {/* Account/Sign In */}
          <button
            className="text-cyan-300 hover:text-cyan-400 p-2 rounded-full"
            title="Sign In / Account"
            onClick={() => navigate('/auth')}
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 