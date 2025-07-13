
import React from 'react';
import { X, Zap, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingUses: number;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, remainingUses }) => {
  const handleUpgrade = () => {
    // For MVP, we'll use a simple Stripe Checkout link
    // In production, you'd integrate with your Stripe setup
    const stripeCheckoutUrl = 'https://buy.stripe.com/test_YOUR_STRIPE_LINK'; // Replace with actual link
    window.open(stripeCheckoutUrl, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  const isLimitReached = remainingUses <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-green-400/30 rounded-xl max-w-md w-full p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLimitReached ? 'Free Limit Reached!' : 'Upgrade to Pro'}
          </h2>
          
          <p className="text-slate-300">
            {isLimitReached 
              ? "You've used all 3 free AI debug requests." 
              : `${remainingUses} free AI debug requests remaining.`
            }
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-slate-200">
            <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
            <span>Unlimited AI debugging requests</span>
          </div>
          <div className="flex items-center gap-3 text-slate-200">
            <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
            <span>Export debugging sessions</span>
          </div>
          <div className="flex items-center gap-3 text-slate-200">
            <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
            <span>Advanced element analytics</span>
          </div>
          <div className="flex items-center gap-3 text-slate-200">
            <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
            <span>Priority support</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="text-lg font-semibold text-white">LogTrace Pro</span>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold text-green-400">$9</span>
            <span className="text-slate-300">/month</span>
          </div>
          <p className="text-center text-sm text-slate-400 mt-1">
            Cancel anytime
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3"
          >
            Upgrade to Pro Now
          </Button>
          
          {!isLimitReached && (
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-slate-400 hover:text-white"
            >
              Maybe Later
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
