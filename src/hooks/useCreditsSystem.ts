import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreditsStatus {
  creditsRemaining: number;
  creditsLimit: number;
  resetTime: string;
  isPremium: boolean;
  waitlistBonusRemaining: number;
}

interface UseCreditsSystemReturn {
  creditsStatus: CreditsStatus | null;
  loading: boolean;
  error: string | null;
  canUseCredit: boolean;
  useCredit: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  grantWaitlistCredits: (email: string) => Promise<boolean>;
}

export const useCreditsSystem = (): UseCreditsSystemReturn => {
  const { user } = useAuth();
  const [creditsStatus, setCreditsStatus] = useState<CreditsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!user) {
      setCreditsStatus(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: functionError } = await supabase.rpc('get_user_credits_status', {
        user_uuid: user.id
      });

      if (functionError) {
        throw functionError;
      }

      if (data && data.length > 0) {
        const status = data[0];
        setCreditsStatus({
          creditsRemaining: status.credits_remaining,
          creditsLimit: status.credits_limit,
          resetTime: status.reset_time,
          isPremium: status.is_premium,
          waitlistBonusRemaining: status.waitlist_bonus_remaining
        });
      }
    } catch (err: any) {
      console.error('Error fetching credits status:', err);
      setError(err.message || 'Failed to fetch credits status');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const useCredit = useCallback(async (): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const { data, error: functionError } = await supabase.rpc('use_credit', {
        user_uuid: user.id
      });

      if (functionError) {
        throw functionError;
      }

      if (data) {
        // Refresh status after using credit
        await refreshStatus();
        return true;
      }

      return false;
    } catch (err: any) {
      console.error('Error using credit:', err);
      setError(err.message || 'Failed to use credit');
      return false;
    }
  }, [user, refreshStatus]);

  const grantWaitlistCredits = useCallback(async (email: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const { data, error: functionError } = await supabase.rpc('grant_waitlist_credits', {
        user_uuid: user.id,
        user_email: email
      });

      if (functionError) {
        throw functionError;
      }

      if (data) {
        // Refresh status after granting credits
        await refreshStatus();
        return true;
      }

      return false;
    } catch (err: any) {
      console.error('Error granting waitlist credits:', err);
      setError(err.message || 'Failed to grant waitlist credits');
      return false;
    }
  }, [user, refreshStatus]);

  // Load credits status on mount and when user changes
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Auto-grant waitlist credits on first login
  useEffect(() => {
    const grantCreditsOnFirstLogin = async () => {
      if (!user || !user.email) return;

      // Check if credits already granted by looking at localStorage flag
      const alreadyGranted = localStorage.getItem(`waitlist_credits_granted_${user.id}`);
      if (alreadyGranted) return;

      // Try to grant waitlist credits
      const granted = await grantWaitlistCredits(user.email);
      if (granted) {
        localStorage.setItem(`waitlist_credits_granted_${user.id}`, 'true');
      }
    };

    if (creditsStatus && !loading) {
      grantCreditsOnFirstLogin();
    }
  }, [user, creditsStatus, loading, grantWaitlistCredits]);

  const canUseCredit = creditsStatus ? creditsStatus.creditsRemaining > 0 : false;

  return {
    creditsStatus,
    loading,
    error,
    canUseCredit,
    useCredit,
    refreshStatus,
    grantWaitlistCredits
  };
}; 