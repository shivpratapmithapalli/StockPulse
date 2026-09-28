import { useState, useEffect, useCallback } from 'react';
import type { StrategyType } from '../types/strategy';
import { strategyService } from '../services/strategyService';

export function useStrategy() {
  const [activeStrategy, setActiveStrategy] = useState<StrategyType>('RULE_BASED');
  const [availableStrategies, setAvailableStrategies] = useState<StrategyType[]>(['RULE_BASED', 'AI']);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategy = useCallback(async () => {
    try {
      const data = await strategyService.getStrategy();
      if (data.activeStrategy) {
        setActiveStrategy(data.activeStrategy);
      }
      if (data.availableStrategies && data.availableStrategies.length > 0) {
        setAvailableStrategies(data.availableStrategies);
      }
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get strategy';
      // Retain default 'RULE_BASED'
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // oxlint-disable-next-line react/set-state-in-effect -- async data fetch is the intended side-effect here
  useEffect(() => {
    fetchStrategy();
  }, [fetchStrategy]);

  const switchStrategy = useCallback(async (newStrategy: StrategyType) => {
    const previous = activeStrategy;
    setActiveStrategy(newStrategy); // Optimistic switch
    setIsSwitching(true);
    setError(null);

    try {
      const response = await strategyService.setStrategy(newStrategy);
      if (response.activeStrategy) {
        setActiveStrategy(response.activeStrategy);
      }
      return response;
    } catch (err: unknown) {
      setActiveStrategy(previous); // Revert on failure
      const message = err instanceof Error ? err.message : 'Failed to switch strategy';
      setError(message);
      throw err;
    } finally {
      setIsSwitching(false);
    }
  }, [activeStrategy]);

  return {
    activeStrategy,
    availableStrategies,
    isLoading,
    isSwitching,
    error,
    switchStrategy,
    refetchStrategy: fetchStrategy,
  };
}
