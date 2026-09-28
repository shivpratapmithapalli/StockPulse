import { api } from './api';
import type { StrategyConfigResponse, StrategyType } from '../types/strategy';
import type { StrategySwitchRequest } from '../types/api';

export const strategyService = {
  /**
   * Retrieves the currently active and available commerce strategies.
   */
  async getStrategy(): Promise<StrategyConfigResponse> {
    return api.get<StrategyConfigResponse>('/config/strategy');
  },

  /**
   * Switches the active strategy between RULE_BASED and AI at runtime without restarting.
   */
  async setStrategy(strategy: StrategyType): Promise<StrategyConfigResponse> {
    const payload: StrategySwitchRequest = { strategy };
    return api.put<StrategyConfigResponse>('/config/strategy', payload);
  },
};
