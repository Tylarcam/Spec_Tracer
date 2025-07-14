
import { useCreditsSystem } from './useCreditsSystem';
import { useAuth } from '@/contexts/AuthContext';

// Legacy hook that wraps the new credits system for backward compatibility
export const useUsageTracking = () => {
  const { user } = useAuth();
  const { 
    creditsStatus, 
    loading, 
    canUseCredit, 
    useCredit 
  } = useCreditsSystem();

  // For non-authenticated users, use guest tracking (5 credits max)
  const getGuestCredits = () => {
    if (user) return { used: 0, remaining: 0 }; // Authenticated users use database
    
    const guestUsed = parseInt(localStorage.getItem('logtrace_guest_debug_count') || '0', 10);
    return {
      used: guestUsed,
      remaining: Math.max(0, 5 - guestUsed)
    };
  };

  const guestCredits = getGuestCredits();

  const incrementAiDebugUsage = async () => {
    if (user) {
      // Use database credits for authenticated users
      return await useCredit();
    } else {
      // Use localStorage for guest users
      const currentCount = parseInt(localStorage.getItem('logtrace_guest_debug_count') || '0', 10);
      localStorage.setItem('logtrace_guest_debug_count', (currentCount + 1).toString());
      return true;
    }
  };

  const getRemainingUses = () => {
    if (loading) return 0;
    
    if (user) {
      return creditsStatus?.creditsRemaining || 0;
    } else {
      return guestCredits.remaining;
    }
  };

  const hasReachedLimit = () => {
    if (loading) return false;
    
    if (user) {
      return !canUseCredit;
    } else {
      return guestCredits.remaining <= 0;
    }
  };

  const canUseAiDebug = () => {
    return !hasReachedLimit();
  };

  const getUsedCount = () => {
    if (loading) return 0;
    
    if (user) {
      return creditsStatus ? (creditsStatus.creditsLimit - creditsStatus.creditsRemaining) : 0;
    } else {
      return guestCredits.used;
    }
  };

  return {
    aiDebugCount: getUsedCount(),
    remainingUses: getRemainingUses(),
    hasReachedLimit: hasReachedLimit(),
    canUseAiDebug: canUseAiDebug(),
    incrementAiDebugUsage,
    isPremium: creditsStatus?.isPremium || false,
    resetTime: creditsStatus?.resetTime,
    waitlistBonusRemaining: creditsStatus?.waitlistBonusRemaining || 0,
    loading,
  };
};
