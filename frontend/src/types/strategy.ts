export type StrategyType = 'RULE_BASED' | 'AI';

export interface StrategyConfigResponse {
  activeStrategy: StrategyType;
  availableStrategies: StrategyType[];
  message?: string;
}
