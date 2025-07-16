import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsageTracking } from '@/hooks/useUsageTracking';

const Upgrade: React.FC = () => {
  const navigate = useNavigate();
  const { remainingUses } = useUsageTracking();

  const handleUpgrade = () => {
    // Replace with your actual Stripe checkout URL
    window.open('https://buy.stripe.com/test_your_checkout_link', '_blank');
  };

  const features = [
    'Unlimited AI debugging requests',
    'Export debug sessions to PDF',
    'Advanced element analysis',
    'Priority customer support',
    'Team collaboration features',
    'Custom branding options'
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-green-400 hover:text-green-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to LogTrace
        </Button>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-8 w-8 text-yellow-400" />
              <CardTitle className="text-3xl text-green-400">Upgrade to Pro</CardTitle>
            </div>
            <CardDescription className="text-slate-300 text-lg">
              Unlock unlimited AI debugging and advanced features
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Usage Notice */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-red-400" />
                <span className="text-red-400 font-semibold text-lg">Free Limit Reached</span>
              </div>
              <p className="text-gray-300">
                You've used all {5 - remainingUses} free AI debugging requests. 
                Upgrade to continue with unlimited access.
              </p>
            </div>

            {/* Pricing */}
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                $9<span className="text-2xl text-gray-400">/month</span>
              </div>
              <p className="text-gray-400">Cancel anytime • No setup fees</p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleUpgrade}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-semibold"
                size="lg"
              >
                <Crown className="h-5 w-5 mr-2" />
                Upgrade Now
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 h-12"
              >
                Maybe Later
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="text-center text-sm text-gray-500 space-y-2 pt-4 border-t border-gray-700">
              <p>🔒 Secure payment powered by Stripe</p>
              <p>💳 30-day money-back guarantee</p>
              <p>🛡️ Your data is always protected</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upgrade; 