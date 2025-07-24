
import React from 'react';
import { Check, Zap, Crown, Share2 } from 'lucide-react';
import { Button } from './ui/button';

interface PricingSectionProps {
  onUpgrade?: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onUpgrade }) => {
  const freeFeatures = [
    '10 AI captures per day',
    'Basic UI inspection',
    'Hover element analysis',
    'Copy context to AI tools',
    'Share for bonus credits'
  ];

  const proFeatures = [
    'Unlimited AI captures',
    'Debug history & export',
    'Advanced prompt tuning',
    'Auto-summarize flows',
    'Priority support',
    'Team collaboration'
  ];

  return (
    <section className="py-16 px-4 bg-slate-800/20">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Simple Pricing, Powerful Results
          </h2>
          <p className="text-xl text-slate-300">
            No tokens, no BS. Pay for features that save you time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="h-6 w-6 text-green-400" />
                <h3 className="text-2xl font-bold text-white">Free</h3>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                $0<span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-gray-400">Perfect for trying LogTrace</p>
            </div>

            <div className="space-y-3 mb-8">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="h-4 w-4 text-cyan-400" />
                <span className="text-cyan-400 font-semibold text-sm">Bonus Credits</span>
              </div>
              <p className="text-gray-300 text-sm">
                Share LogTrace and earn +5 credits per share. Stack up to 40 total credits!
              </p>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-green-500/10 to-cyan-500/10 border border-green-400/30 rounded-xl p-8 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Crown className="h-6 w-6 text-yellow-400" />
                <h3 className="text-2xl font-bold text-white">Pro</h3>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                $9<span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-gray-400">For serious developers</p>
            </div>

            <div className="space-y-3 mb-8">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={onUpgrade}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>

            <div className="text-center text-xs text-gray-500 mt-4">
              🔒 30-day money-back guarantee
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-4 text-sm text-gray-400">
            <span>✓ Cancel anytime</span>
            <span>✓ No setup fees</span>
            <span>✓ Secure payments</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
