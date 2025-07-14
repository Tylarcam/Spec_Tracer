
import React from 'react';
import { X, Crown, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingUses: number;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, remainingUses }) => {
  const handleUpgrade = () => {
    // Production Stripe checkout URL - replace with your actual link
    window.open('https://buy.stripe.com/bIY3fKaLT2zW4mY8ww', '_blank');
  };

  if (!isOpen) return null;

  const features = [
    'Unlimited AI debugging requests',
    'Export debug sessions to PDF',
    'Advanced element analysis',
    'Priority customer support',
    'Team collaboration features',
    'Custom branding options'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-green-500/30 rounded-xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-500/20">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Upgrade to Pro</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Usage Notice */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-red-400" />
              <span className="text-red-400 font-semibold text-sm">Free Limit Reached</span>
            </div>
            <p className="text-gray-300 text-sm">
              You've used all {5 - remainingUses} of your free daily AI debugging requests. 
              Upgrade to continue with unlimited access.
            </p>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-white mb-1">
              $9<span className="text-lg text-gray-400">/month</span>
            </div>
            <p className="text-gray-400 text-sm">Cancel anytime</p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 h-10"
            >
              Maybe Later
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="text-center text-xs text-gray-500 mt-4 space-y-1">
            <p>🔒 Secure payment powered by Stripe</p>
            <p>💳 30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
