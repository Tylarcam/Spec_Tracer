
import React from 'react';
import { X, Crown, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradeNotificationBannerProps {
  remainingCredits: number;
  totalCredits: number;
  onUpgrade: () => void;
  onDismiss: () => void;
  isPremium?: boolean;
}

const UpgradeNotificationBanner: React.FC<UpgradeNotificationBannerProps> = ({
  remainingCredits,
  totalCredits,
  onUpgrade,
  onDismiss,
  isPremium = false
}) => {
  // Don't show for premium users or when there are plenty of credits
  if (isPremium || remainingCredits > 2) {
    return null;
  }

  const isLastCredit = remainingCredits === 1;
  const isOutOfCredits = remainingCredits === 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-200" />
            <span className="font-semibold">
              {isOutOfCredits ? 'No credits left!' : isLastCredit ? 'Last credit!' : 'Running low on credits'}
            </span>
          </div>
          <div className="hidden sm:block text-sm opacity-90">
            {isOutOfCredits 
              ? 'Upgrade now to continue debugging with unlimited AI power' 
              : `Only ${remainingCredits} of ${totalCredits} daily credits remaining`
            }
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onUpgrade}
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-semibold px-4 py-1.5 h-auto"
          >
            <Crown className="h-3 w-3 mr-1.5" />
            Upgrade to Pro
            <ArrowRight className="h-3 w-3 ml-1.5" />
          </Button>
          
          <Button
            onClick={onDismiss}
            size="sm"
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 h-auto w-auto p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeNotificationBanner;
