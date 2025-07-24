
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'logtrace-usage';
const FREE_LIMIT = 3;

interface UsageData {
  aiDebugCount: number;
  lastReset: string;
}

export const useUsageTracking = () => {
  const [usageData, setUsageData] = useState<UsageData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const today = new Date().toDateString();
      
      // Reset daily (optional - you can remove this for lifetime limits)
      if (parsed.lastReset !== today) {
        const resetData = { aiDebugCount: 0, lastReset: today };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
        return resetData;
      }
      
      return parsed;
    }
    
    const initialData = { aiDebugCount: 0, lastReset: new Date().toDateString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  });

  const incrementAiDebugUsage = () => {
    const newUsageData = {
      ...usageData,
      aiDebugCount: usageData.aiDebugCount + 1,
    };
    
    setUsageData(newUsageData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsageData));
  };

  const getRemainingUses = () => {
    return Math.max(0, FREE_LIMIT - usageData.aiDebugCount);
  };

  const hasReachedLimit = () => {
    return usageData.aiDebugCount >= FREE_LIMIT;
  };

  const canUseAiDebug = () => {
    return !hasReachedLimit();
  };

  return {
    aiDebugCount: usageData.aiDebugCount,
    remainingUses: getRemainingUses(),
    hasReachedLimit: hasReachedLimit(),
    canUseAiDebug: canUseAiDebug(),
    incrementAiDebugUsage,
    isPremium: false, // Add this property
    waitlistBonusRemaining: 0, // Add this property
  };
};
