import React from 'react';
import { Shield, Zap, Lock } from 'lucide-react';

interface PrivacyBadgeProps {
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
  const baseClasses = "flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium";
  
  if (variant === 'compact') {
    return (
      <div className={`${baseClasses} bg-green-500/10 border border-green-500/30 text-green-400 ${className}`}>
        <Shield className="h-3 w-3" />
        <span>Privacy-First</span>
      </div>
    );
  }
  
  if (variant === 'detailed') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className={`${baseClasses} bg-green-500/10 border border-green-500/30 text-green-400`}>
          <Shield className="h-4 w-4" />
          <span>Zero Data Collection</span>
        </div>
        <div className={`${baseClasses} bg-cyan-500/10 border border-cyan-500/30 text-cyan-400`}>
          <Zap className="h-4 w-4" />
          <span>Client-Side Only</span>
        </div>
        <div className={`${baseClasses} bg-blue-500/10 border border-blue-500/30 text-blue-400`}>
          <Lock className="h-4 w-4" />
          <span>Immediate Cleanup</span>
        </div>
      </div>
    );
  }
  
  // Default variant
  return (
    <div className={`${baseClasses} bg-green-500/10 border border-green-500/30 text-green-400 ${className}`}>
      <Shield className="h-4 w-4" />
      <span>Privacy-First</span>
    </div>
  );
};

export default PrivacyBadge; 