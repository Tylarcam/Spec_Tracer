import React from 'react';
import { Shield, Zap, Lock, Eye } from 'lucide-react';

interface PrivacyStatusProps {
  isActive: boolean;
  className?: string;
}

const PrivacyStatus: React.FC<PrivacyStatusProps> = ({ isActive, className = '' }) => {
  return (
    <div className={`privacy-status ${className}`}>
      <div className="privacy-header">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-green-400" />
          <span className="text-green-400 font-semibold text-sm">Privacy Status</span>
        </div>
      </div>
      
      <div className="privacy-indicators space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-slate-300">Zero data collection</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          <span className="text-slate-300">Client-side only processing</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-slate-300">Immediate data cleanup</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-yellow-400' : 'bg-slate-500'}`}></div>
          <span className="text-slate-300">
            {isActive ? 'Active debugging session' : 'No active session'}
          </span>
        </div>
      </div>
      
      <div className="privacy-note mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-slate-300">
        <div className="flex items-start gap-2">
          <Lock className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
          <span>
            All debugging data is processed locally and immediately cleared when sessions end.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyStatus; 