
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentButtonProps {
  email: string;
  disabled?: boolean;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ email, disabled = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address first.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { email: email.trim().toLowerCase() }
      });

      if (error) throw error;
      
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast({
        title: 'Payment Error',
        description: err?.message || 'Could not process payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isProcessing || !email.trim()}
      className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 text-lg h-auto disabled:opacity-50"
    >
      <Crown className="h-5 w-5 mr-2" />
      {isProcessing ? 'Processing...' : 'Get Pro Access - $9'}
      <CreditCard className="h-5 w-5 ml-2" />
    </Button>
  );
};

export default PaymentButton;
