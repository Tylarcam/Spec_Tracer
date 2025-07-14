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
      const { data, error: functionError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (functionError) {
        throw functionError;
      }

      if (data) {
        setCreditsStatus({
          creditsRemaining: data.subscribed ? 999 : 5, // Simple fallback
          creditsLimit: data.subscribed ? 999 : 5,
          resetTime: new Date().toISOString(),
          isPremium: data.subscribed,
          waitlistBonusRemaining: 0
        });
      } else {
        // No subscription record, create default
        setCreditsStatus({
          creditsRemaining: 5,
          creditsLimit: 5,
          resetTime: new Date().toISOString(),
          isPremium: false,
          waitlistBonusRemaining: 0
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

    // Simple credit system - just return true for now
    // In a real app, you'd implement proper credit tracking
    return true;
  }, [user]);

  const grantWaitlistCredits = useCallback(async (email: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    // Simple implementation - just return true
    return true;
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