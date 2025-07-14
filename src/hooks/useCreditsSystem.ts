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
      // Check if user has a subscription
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Set default credits status
      const defaultCredits = {
        creditsRemaining: 5,
        creditsLimit: 5,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isPremium: subscriber?.subscribed || false,
        waitlistBonusRemaining: 5
      };

      setCreditsStatus(defaultCredits);
    } catch (err: any) {
      console.error('Error fetching credits status:', err);
      setError(err.message || 'Failed to fetch credits status');
      // Set fallback credits status
      setCreditsStatus({
        creditsRemaining: 5,
        creditsLimit: 5,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isPremium: false,
        waitlistBonusRemaining: 5
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const useCredit = useCallback(async (): Promise<boolean> => {
    if (!user || !creditsStatus) {
      return false;
    }

    try {
      if (creditsStatus.creditsRemaining > 0) {
        // Simulate using a credit
        setCreditsStatus(prev => prev ? {
          ...prev,
          creditsRemaining: prev.creditsRemaining - 1
        } : null);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error using credit:', err);
      setError(err.message || 'Failed to use credit');
      return false;
    }
  }, [user, creditsStatus]);

  const grantWaitlistCredits = useCallback(async (email: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      // Check if user is on waitlist
      const { data: waitlistEntry } = await supabase
        .from('waitlist')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (waitlistEntry) {
        // Grant bonus credits for waitlist users
        setCreditsStatus(prev => prev ? {
          ...prev,
          creditsRemaining: prev.creditsRemaining + 5,
          waitlistBonusRemaining: 5
        } : null);
        return true;
      }

      return false;
    } catch (err: any) {
      console.error('Error granting waitlist credits:', err);
      setError(err.message || 'Failed to grant waitlist credits');
      return false;
    }
  }, [user]);

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