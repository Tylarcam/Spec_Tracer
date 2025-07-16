
import { useEnhancedCredits } from './useEnhancedCredits';

interface CreditsStatus {
  creditsRemaining: number;
  creditsLimit: number;
  isPremium: boolean;
}

export const useCreditsSystem = () => {
  const { creditStatus, isLoading, useCredit, awardShareCredits, refreshCredits } = useEnhancedCredits();

  // Map the enhanced credits interface to the expected interface
  const creditsStatus: CreditsStatus = {
    creditsRemaining: creditStatus.totalCredits,
    creditsLimit: creditStatus.maxCredits,
    isPremium: creditStatus.isPremium,
  };

  return {
    creditsStatus,
    loading: isLoading,
    useCredit,
    awardShareCredits,
    refreshCredits,
  };
};
