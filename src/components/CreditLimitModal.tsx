
import React from 'react';
import { X, Zap, Crown, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { useEnhancedCredits } from '@/hooks/useEnhancedCredits';

interface CreditLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onShare: () => void;
}

const CreditLimitModal: React.FC<CreditLimitModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpgrade,
  onShare 
}) => {
  const { creditStatus } = useEnhancedCredits();

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-slate-900 border border-red-500/30 rounded-xl shadow-2xl w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-500/20">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Credit Limit Reached</h3>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm font-medium mb-1">
              You've used all your daily credits
            </p>
            <p className="text-gray-400 text-xs">
              Daily: {creditStatus.dailyCredits}/5 • Bonus: {creditStatus.waitlistBonus}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onUpgrade}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-10"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro - Unlimited
            </Button>

            <Button
              onClick={onShare}
              variant="outline"
              className="w-full border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 h-10"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share for +5 Credits
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>🎁 Share on social media to earn bonus credits</p>
            <p>💎 Pro: $9/mo for unlimited debugging</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditLimitModal;
