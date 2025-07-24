
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CreditStatus {
  dailyCredits: number;
  maxCredits: number;
  totalCredits: number;
  isPremium: boolean;
  waitlistBonus: number;
  resetTime: string;
}

export const useEnhancedCredits = () => {
  const [creditStatus, setCreditStatus] = useState<CreditStatus>({
    dailyCredits: 0,
    maxCredits: 40,
    totalCredits: 0,
    isPremium: false,
    waitlistBonus: 0,
    resetTime: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditStatus = async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Handle guest user credits
        const guestCredits = parseInt(localStorage.getItem('logtrace_guest_debug_count') || '0', 10);
        setCreditStatus({
          dailyCredits: Math.max(0, 10 - guestCredits),
          maxCredits: 40,
          totalCredits: Math.max(0, 10 - guestCredits),
          isPremium: false,
          waitlistBonus: 0,
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_user_credits_status', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error fetching credit status:', error);
        setError(error.message);
        // Set fallback values
        setCreditStatus({
          dailyCredits: 5,
          maxCredits: 40,
          totalCredits: 5,
          isPremium: false,
          waitlistBonus: 0,
          resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        return;
      }

      if (data && data.length > 0) {
        const status = data[0];
        setCreditStatus({
          dailyCredits: status.credits_remaining - status.waitlist_bonus_remaining,
          maxCredits: status.is_premium ? 999999 : 40,
          totalCredits: status.credits_remaining,
          isPremium: status.is_premium,
          waitlistBonus: status.waitlist_bonus_remaining,
          resetTime: status.reset_time,
        });
      }
    } catch (error) {
      console.error('Error fetching credit status:', error);
      setError('Failed to load credit status');
      // Set fallback values
      setCreditStatus({
        dailyCredits: 5,
        maxCredits: 40,
        totalCredits: 5,
        isPremium: false,
        waitlistBonus: 0,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const useCredit = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Handle guest credits
        const currentCount = parseInt(localStorage.getItem('logtrace_guest_debug_count') || '0', 10);
        if (currentCount >= 10) return false;
        
        localStorage.setItem('logtrace_guest_debug_count', (currentCount + 1).toString());
        await fetchCreditStatus();
        return true;
      }

      const { data, error } = await supabase.rpc('use_credit', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error using credit:', error);
        return false;
      }
      
      if (data) {
        await fetchCreditStatus();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error using credit:', error);
      return false;
    }
  };

  const awardShareCredits = async (platform: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if user already shared on this platform today
      const today = new Date().toISOString().split('T')[0];
      const shareKey = `share_${platform}_${today}`;
      
      if (localStorage.getItem(shareKey)) {
        return false; // Already shared today
      }

      // Award 5 bonus credits
      const { error } = await supabase
        .from('user_credits')
        .upsert({
          user_id: user.id,
          credits_used: Math.max(0, (creditStatus.dailyCredits - 5)),
          reset_date: today,
          session_start_time: new Date().toISOString(),
        }, { onConflict: 'user_id,reset_date' });

      if (error) {
        console.error('Error awarding share credits:', error);
        return false;
      }

      localStorage.setItem(shareKey, 'true');
      await fetchCreditStatus();
      return true;
    } catch (error) {
      console.error('Error awarding share credits:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchCreditStatus();
  }, []);

  return {
    creditStatus,
    isLoading,
    error,
    useCredit,
    awardShareCredits,
    refreshCredits: fetchCreditStatus,
  };
};
