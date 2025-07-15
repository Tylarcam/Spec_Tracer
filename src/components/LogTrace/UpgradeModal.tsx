
import React, { useState } from 'react';
import { X, Crown, Check, Zap, Loader2, Sparkles, Rocket, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingUses: number;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, remainingUses }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to upgrade to Pro.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        console.error('Checkout error:', error);
        toast({
          title: 'Checkout Error',
          description: 'Failed to create checkout session. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        toast({
          title: 'Error',
          description: 'No checkout URL received.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const features = [
    { icon: Zap, text: 'Unlimited AI debugging requests', highlight: true },
    { icon: Rocket, text: 'Lightning-fast response times' },
    { icon: Target, text: 'Advanced element analysis & insights' },
    { icon: Sparkles, text: 'Export debug sessions to PDF' },
    { icon: Crown, text: 'Priority customer support' },
    { icon: Check, text: 'Team collaboration features' }
  ];

  const isOutOfCredits = remainingUses === 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/30 rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-scale-in">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-t-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-cyan-600/20" />
          <div className="relative flex items-center justify-between p-6 border-b border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Upgrade to Pro</h2>
                <p className="text-green-300 text-sm">Join 10,000+ developers debugging faster</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-8 w-8 p-0"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Urgency Notice */}
          <div className={`${isOutOfCredits ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'} rounded-xl p-4 mb-6`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className={`h-4 w-4 ${isOutOfCredits ? 'text-red-400' : 'text-amber-400'}`} />
              <span className={`${isOutOfCredits ? 'text-red-400' : 'text-amber-400'} font-semibold text-sm`}>
                {isOutOfCredits ? 'Debug Limit Reached' : 'Credits Running Low'}
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {isOutOfCredits 
                ? "You've used all 5 daily AI debugging requests. Upgrade now to continue debugging with unlimited AI power - no more waiting until tomorrow!"
                : `Only ${remainingUses} credits left today. Don't let debugging limits slow you down when you're in the zone.`
              }
            </p>
          </div>

          {/* Pricing with savings highlight */}
          <div className="text-center mb-6">
            <div className="relative">
              <div className="text-4xl font-bold text-white mb-1">
                $9<span className="text-xl text-gray-400">/month</span>
              </div>
              <div className="absolute -top-2 -right-6 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold transform rotate-12">
                Save $99/yr
              </div>
            </div>
            <p className="text-gray-400 text-sm">Cancel anytime • 30-day money-back guarantee</p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <div key={index} className={`flex items-center gap-3 p-2 rounded-lg ${feature.highlight ? 'bg-green-500/10 border border-green-500/20' : ''}`}>
                <div className={`p-1 rounded ${feature.highlight ? 'bg-green-500/20' : 'bg-gray-700/50'}`}>
                  <feature.icon className={`h-4 w-4 ${feature.highlight ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
                <span className={`text-sm ${feature.highlight ? 'text-green-300 font-medium' : 'text-gray-300'}`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="bg-slate-800/50 rounded-lg p-3 mb-6 text-center">
            <p className="text-green-300 text-sm font-medium mb-1">⚡ Join the debugging revolution</p>
            <p className="text-gray-400 text-xs">Trusted by developers at Google, Meta, and 10,000+ startups</p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white h-12 text-base font-semibold disabled:opacity-50 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating your Pro account...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Start Debugging Without Limits
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isLoading}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 h-10"
            >
              {isOutOfCredits ? 'Continue Tomorrow' : 'Maybe Later'}
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="text-center text-xs text-gray-500 mt-4 space-y-1">
            <p>🔒 Secure payment powered by Stripe</p>
            <p>💳 30-day money-back guarantee • Cancel anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
